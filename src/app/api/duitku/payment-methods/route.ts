// app/api/duitku/payment-methods/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from 'crypto';

interface DuitkuPaymentMethod {
  paymentMethod: string;
  paymentName: string;
  paymentImage: string;
  totalFee: string; 
}

interface DuitkuResponse {
  responseCode: string;
  responseMessage: string;
  paymentFee: DuitkuPaymentMethod[];
}

export async function POST(req: Request) {
  try {
    console.log("[Duitku Route] Payment methods request received");

    // Authentication check
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token");
    const token = tokenCookie?.value;

    if (!token) {
      console.log("[Duitku Route] Token not found");
      return NextResponse.json(
        { error: "Sesi Anda telah berakhir. Silakan login kembali." },
        { status: 401 }
      );
    }

    // Get request body
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount harus lebih besar dari 0" },
        { status: 400 }
      );
    }

    // Duitku configuration
    const merchantCode = process.env.DUITKU_MERCHANT_CODE;
    const apiKey = process.env.DUITKU_API_KEY;
    const environment = process.env.DUITKU_ENVIRONMENT || "sandbox";

    if (!merchantCode || !apiKey) {
      console.error("[Duitku Route] Missing configuration");
      return NextResponse.json(
        { error: "Konfigurasi pembayaran tidak lengkap" },
        { status: 500 }
      );
    }

    // Prepare Duitku API request
    const datetime = new Date().toISOString().slice(0, 19).replace("T", " ");
    const paymentAmount = parseInt(amount.toString());

    // Create signature
    const signatureString = `${merchantCode}${paymentAmount}${datetime}${apiKey}`;
    const signature = crypto
      .createHash("sha256")
      .update(signatureString)
      .digest("hex");

    const requestBody = {
      merchantcode: merchantCode,
      amount: paymentAmount,
      datetime: datetime,
      signature: signature,
    };

    console.log("[Duitku Route] Request params:", {
      merchantCode,
      amount: paymentAmount,
      datetime,
      hasSignature: !!signature,
    });

    // Determine API URL based on environment
    const baseUrl =
      environment === "production"
        ? "https://passport.duitku.com"
        : "https://sandbox.duitku.com";

    const apiUrl = `${baseUrl}/webapi/api/merchant/paymentmethod/getpaymentmethod`;

    // Make request to Duitku
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log("[Duitku Route] Response status:", response.status);

    if (response.status !== 200) {
      console.error(`[Duitku Route] API error ${response.status}:`, responseText);

      let errorMessage = "Gagal mengambil metode pembayaran";
      try {
        const errorJson = JSON.parse(responseText);
        if (typeof errorJson === "object" && errorJson && "Message" in errorJson) {
          errorMessage = `Server Error: ${(errorJson as { Message: string }).Message}`;
        }
      } catch {
        // fallback ke default errorMessage
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    // Parse successful response
    let data: DuitkuResponse;
    try {
      data = JSON.parse(responseText) as DuitkuResponse;
    } catch (_error) {
      console.error("[Duitku Route] JSON parse error");
      return NextResponse.json(
        { error: "Response tidak valid dari server pembayaran" },
        { status: 502 }
      );
    }

    console.log("[Duitku Route] Success response:", {
      responseCode: data.responseCode,
      responseMessage: data.responseMessage,
      methodCount: data.paymentFee?.length || 0,
    });

    if (data.responseCode !== "00") {
      return NextResponse.json(
        { error: data.responseMessage || "Gagal mengambil metode pembayaran" },
        { status: 400 }
      );
    }

    if (!data.paymentFee || !Array.isArray(data.paymentFee)) {
      return NextResponse.json(
        { error: "Format response tidak valid" },
        { status: 502 }
      );
    }

    // Group payment methods by type for better UX
    interface MethodData {
      totalFee: number;
      paymentMethod: string;
      paymentName: string;
      paymentImage: string;
    }

    interface GroupedMethods {
      bank_transfer: MethodData[];
      ewallet: MethodData[];
      credit_card: MethodData[];
      retail: MethodData[];
      others: MethodData[];
    }

    const groupedMethods: GroupedMethods = {
      bank_transfer: [],
      ewallet: [],
      credit_card: [],
      retail: [],
      others: [],
    };

    data.paymentFee.forEach((method: DuitkuPaymentMethod) => {
      const methodCode = method.paymentMethod.toLowerCase();
      const methodData: MethodData = {
        ...method,
        totalFee: parseInt(method.totalFee) || 0,
      };

      if (
        methodCode.includes("va") ||
        methodCode.includes("bank") ||
        methodCode.includes("bri") ||
        methodCode.includes("bca") ||
        methodCode.includes("bni") ||
        methodCode.includes("mandiri")
      ) {
        groupedMethods.bank_transfer.push(methodData);
      } else if (
        methodCode.includes("ovo") ||
        methodCode.includes("gopay") ||
        methodCode.includes("dana") ||
        methodCode.includes("linkaja") ||
        methodCode.includes("shopeepay")
      ) {
        groupedMethods.ewallet.push(methodData);
      } else if (methodCode.includes("cc") || methodCode.includes("credit")) {
        groupedMethods.credit_card.push(methodData);
      } else if (
        methodCode.includes("alfamart") ||
        methodCode.includes("indomaret")
      ) {
        groupedMethods.retail.push(methodData);
      } else {
        groupedMethods.others.push(methodData);
      }
    });

    return NextResponse.json({
      success: true,
      responseCode: data.responseCode,
      responseMessage: data.responseMessage,
      paymentMethods: data.paymentFee,
      groupedMethods: groupedMethods,
      totalMethods: data.paymentFee.length,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("[Duitku Route] Request timeout");
      return NextResponse.json(
        { error: "Timeout: Server pembayaran tidak merespons" },
        { status: 504 }
      );
    }

    let message = "Terjadi kesalahan sistem pembayaran";
    if (process.env.NODE_ENV === "development") {
      message = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json(
      {
        error: "Terjadi kesalahan sistem pembayaran",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
