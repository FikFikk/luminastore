// services/duitkuService.ts
export interface DuitkuPaymentMethod {
  paymentMethod: string;
  paymentName: string;
  paymentImage: string;
  totalFee: string | number;
}

export interface GroupedPaymentMethods {
  bank_transfer: DuitkuPaymentMethod[];
  ewallet: DuitkuPaymentMethod[];
  credit_card: DuitkuPaymentMethod[];
  retail: DuitkuPaymentMethod[];
  others: DuitkuPaymentMethod[];
}

export interface DuitkuPaymentMethodsResponse {
  success: boolean;
  responseCode: string;
  responseMessage: string;
  paymentMethods: DuitkuPaymentMethod[];
  groupedMethods: GroupedPaymentMethods;
  totalMethods: number;
}

// Cache for payment methods (they don't change frequently)
const paymentMethodsCache = new Map<number, { data: DuitkuPaymentMethodsResponse; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

export const getDuitkuPaymentMethods = async (amount: number): Promise<DuitkuPaymentMethodsResponse> => {
  if (!amount || amount <= 0) {
    throw new Error('Amount harus lebih besar dari 0');
  }

  // Round amount to nearest hundred for better caching
  const roundedAmount = Math.ceil(amount / 100) * 100;

  // Check cache first
  const cached = paymentMethodsCache.get(roundedAmount);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached payment methods');
    return cached.data;
  }

  try {
    console.log('Fetching payment methods for amount:', amount);

    const response = await fetch('/api/duitku/payment-methods', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Duitku payment methods error:', response.status, errorText);

      let errorMessage = 'Gagal mengambil metode pembayaran';
      
      if (response.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      } else if (response.status === 400) {
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          // Use default message
        }
      } else if (response.status >= 500) {
        errorMessage = 'Terjadi kesalahan server pembayaran. Silakan coba lagi nanti.';
      }

      throw new Error(errorMessage);
    }

    const data: DuitkuPaymentMethodsResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.responseMessage || 'Gagal mengambil metode pembayaran');
    }

    // Cache the successful response
    paymentMethodsCache.set(roundedAmount, { data, timestamp: Date.now() });

    console.log(`Successfully fetched ${data.totalMethods} payment methods`);
    return data;

  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

// Utility function to format payment method name
export const formatPaymentMethodName = (method: DuitkuPaymentMethod): string => {
  let name = method.paymentName;
  
  // Add fee information if there's a fee
  const fee = typeof method.totalFee === 'string' ? parseInt(method.totalFee) : method.totalFee;
  if (fee > 0) {
    name += ` (+Rp ${fee.toLocaleString('id-ID')})`;
  }
  
  return name;
};

// Utility function to get payment method display info
export const getPaymentMethodInfo = (method: DuitkuPaymentMethod) => {
  const fee = typeof method.totalFee === 'string' ? parseInt(method.totalFee) : method.totalFee;
  
  return {
    code: method.paymentMethod,
    name: method.paymentName,
    image: method.paymentImage,
    fee: fee,
    feeFormatted: fee > 0 ? `Rp ${fee.toLocaleString('id-ID')}` : 'Gratis',
    displayName: formatPaymentMethodName(method)
  };
};

// Utility function to clear cache
export const clearPaymentMethodsCache = () => {
  paymentMethodsCache.clear();
  console.log('Payment methods cache cleared');
};

// Get category display name
export const getCategoryDisplayName = (category: keyof GroupedPaymentMethods): string => {
  const categoryNames = {
    bank_transfer: 'Transfer Bank',
    ewallet: 'E-Wallet',
    credit_card: 'Kartu Kredit',
    retail: 'Retail/Convenience Store',
    others: 'Metode Lainnya'
  };
  
  return categoryNames[category];
};