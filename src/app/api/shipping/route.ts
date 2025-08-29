// app/api/shipping/route.ts - Fixed version with better error handling and validation
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// In-memory rate limiting (for production, consider using Redis)
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxRequests = 30; // 30 requests per minute per IP
  private readonly timeWindow = 60000; // 1 minute

  isAllowed(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);

    // Clean up expired entries
    if (userRequests && now > userRequests.resetTime) {
      this.requests.delete(identifier);
    }

    const current = this.requests.get(identifier);

    if (!current) {
      // First request
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.timeWindow
      });
      return { allowed: true };
    }

    if (current.count >= this.maxRequests) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Increment count
    current.count++;
    return { allowed: true };
  }
}

const rateLimiter = new RateLimiter();

// Response cache to reduce backend calls
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

export async function GET(req: Request) {
  try {
    console.log("[Shipping Route] Request received"); 
    
    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = rateLimiter.isAllowed(ip);
    
    if (!rateLimitResult.allowed) {
      console.log(`[Shipping Route] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { 
          error: "Terlalu banyak request. Silakan tunggu sebentar sebelum mencoba lagi.",
          retryAfter: rateLimitResult.retryAfter 
        }, 
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
          }
        }
      );
    }

    // Authentication
    const cookieStore = await cookies(); 
    const tokenCookie = cookieStore.get("token"); 
    const token = tokenCookie?.value;

    if (!token) {
      console.log("[Shipping Route] Token not found");
      return NextResponse.json({ error: "Sesi Anda telah berakhir. Silakan login kembali." }, { status: 401 });
    }

    const backendApiKey = process.env.BACKEND_API_KEY;
    if (!backendApiKey) {
      console.error("[Shipping Route] BACKEND_API_KEY not set");
      return NextResponse.json({ error: "Konfigurasi server tidak lengkap." }, { status: 500 });
    }

    // Get parameters
    const { searchParams } = new URL(req.url);
    const destinationId = searchParams.get("destination_id");
    const weight = searchParams.get("weight");

    console.log("[Shipping Route] Parameters:", { destinationId, weight });

    if (!destinationId || !weight) {
      return NextResponse.json(
        { error: "Parameter destination_id dan weight harus diisi" },
        { status: 400 }
      );
    }

    // Validate and sanitize destination_id
    const destIdNum = parseInt(destinationId);
    if (isNaN(destIdNum) || destIdNum <= 0) {
      return NextResponse.json(
        { error: "destination_id harus berupa angka yang valid" },
        { status: 400 }
      );
    }

    // Validate weight
    const weightNum = parseInt(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return NextResponse.json(
        { error: "Berat harus berupa angka yang lebih besar dari 0" },
        { status: 400 }
      );
    }

    // Clamp weight to reasonable limits (RajaOngkir usually has weight limits)
    const clampedWeight = Math.min(Math.max(weightNum, 1), 30000); // Between 1g and 30kg
    if (clampedWeight !== weightNum) {
      console.log(`[Shipping Route] Weight clamped from ${weightNum} to ${clampedWeight}`);
    }

    // Check cache first
    const cacheKey = `${destIdNum}-${clampedWeight}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("[Shipping Route] Returning cached response");
      return NextResponse.json(cached.data);
    }

    // Backend configuration
    const backendApiUrl = process.env.NEXT_PUBLIC_API_BASE;
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
    if (!backendApiUrl) {
      console.error("[Shipping Route] NEXT_PUBLIC_API_BASE not set");
      return NextResponse.json({ error: "Konfigurasi server tidak lengkap." }, { status: 500 });
    }

    // Use the sanitized values in the URL
    const backendUrl = `${backendApiUrl}/payment/calculate-shipping?destination_id=${destIdNum}&weight=${clampedWeight}`;
    
    console.log("[Shipping Route] Calling backend URL:", backendUrl);
    
    // Make request to backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      Key: backendApiKey,
    };

    if (API_KEY) {
      headers["x-api-key"] = API_KEY;
    }

    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers,
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      console.log("[Shipping Route] Backend response status:", response.status);
      
      if (!response.ok) {
        console.error(`[Shipping Route] Backend error ${response.status}:`, responseText);
        
        // Handle specific backend errors
        if (response.status === 422) {
          // Parse the error response to get more details
          let errorDetails = "Parameter tidak valid untuk perhitungan ongkir";
          try {
            const errorJson = JSON.parse(responseText);
            if (errorJson.error && typeof errorJson.error === 'string') {
              errorDetails = errorJson.error;
            } else if (errorJson.message) {
              errorDetails = errorJson.message;
            }
          } catch (e) {
            console.log("[Shipping Route] Could not parse error response");
          }
          
          return NextResponse.json({ 
            error: `Validasi gagal: ${errorDetails}. Silakan periksa kembali alamat tujuan.`,
            debug: process.env.NODE_ENV === 'development' ? {
              destination_id: destIdNum,
              weight: clampedWeight,
              original_weight: weightNum,
              backend_response: responseText
            } : undefined
          }, { status: 400 });
        } else if (response.status === 429) {
          return NextResponse.json({ 
            error: "Sistem pengiriman sedang sibuk. Silakan tunggu sebentar dan coba lagi." 
          }, { status: 503 }); // Return 503 instead of 429 to avoid confusion
        } else if (response.status === 401) {
          return NextResponse.json({ 
            error: "Sesi Anda telah berakhir. Silakan login kembali." 
          }, { status: 401 });
        } else if (response.status === 404) {
          return NextResponse.json({ 
            error: "Layanan pengiriman tidak tersedia untuk tujuan ini." 
          }, { status: 404 });
        } else if (response.status >= 500) {
          return NextResponse.json({ 
            error: "Terjadi kesalahan pada server pengiriman. Silakan coba lagi nanti." 
          }, { status: 502 });
        }
        
        // Try to parse error response
        try {
          const errorJson = JSON.parse(responseText);
          return NextResponse.json({ 
            error: errorJson.error || errorJson.message || "Gagal memuat ongkos kirim" 
          }, { status: response.status });
        } catch (e) {
          return NextResponse.json({ 
            error: "Terjadi kesalahan saat memuat ongkos kirim" 
          }, { status: response.status });
        }
      }
      
      // Parse successful response
      try {
        const data = JSON.parse(responseText);
        console.log("[Shipping Route] Success - caching response");
        
        // Validate response structure
        if (!data.shipping_options || !Array.isArray(data.shipping_options)) {
          console.warn("[Shipping Route] Invalid response structure:", data);
          return NextResponse.json({
            error: "Format response pengiriman tidak valid"
          }, { status: 502 });
        }
        
        // Filter out invalid services (cost = 0 or negative)
        const filteredData = {
          ...data,
          shipping_options: data.shipping_options
            .map((courier: { services: any[]; }) => ({
              ...courier,
              services: courier.services.filter(service => service.cost > 0)
            }))
            .filter((courier: { services: string | any[]; }) => courier.services.length > 0)
        };
        
        // Cache the successful response
        responseCache.set(cacheKey, { data: filteredData, timestamp: Date.now() });
        
        return NextResponse.json(filteredData);
      } catch (e) {
        console.error("[Shipping Route] JSON parse error:", e);
        return NextResponse.json({ 
          error: "Response dari server pengiriman tidak valid" 
        }, { status: 502 });
      }

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error("[Shipping Route] Request timeout");
        return NextResponse.json({ 
          error: "Timeout: Server pengiriman tidak merespons. Silakan coba lagi." 
        }, { status: 504 });
      }
      
      throw fetchError; // Re-throw other fetch errors
    }

  } catch (error: any) {
    console.error("[Shipping Route] Unexpected error:", error);
    return NextResponse.json({ 
      error: "Terjadi kesalahan sistem. Silakan coba lagi nanti.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Optional: Add cleanup for cache and rate limiter
setInterval(() => {
  const now = Date.now();
  
  // Clean up expired cache entries
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      responseCache.delete(key);
    }
  }
  
  console.log(`[Shipping Route] Cache cleanup: ${responseCache.size} entries remaining`);
}, 5 * 60 * 1000); // Run every 5 minutes