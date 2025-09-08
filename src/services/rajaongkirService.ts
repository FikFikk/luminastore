// services/rajaongkirService.ts - Enhanced with better error handling and validation
export interface Destination {
  value: string;
  label: string;
  province_name?: string;
  city_name?: string;
  district_name?: string;
  subdistrict_name?: string;
  zip_code?: string;
}

export interface RajaOngkirDestination {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
}

export interface ShippingService {
  service_code: string;
  service_name: string;
  description: string;
  cost: number;
  cost_formatted: string;
  etd: string;
}

export interface ShippingOption {
  courier_code: string;
  courier_name: string;
  services: ShippingService[];
}

// Rate limiting configuration
// Rate limiting configuration
class RateLimiter {
  private lastRequestTime = 0;
  private requestCount = 0;
  private resetTime = 0;
  private readonly maxRequests = 10; // Max requests per minute
  private readonly timeWindow = 60000; // 1 minute in milliseconds
  private readonly minInterval = 3000; // 3 seconds between requests
  
  async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + this.timeWindow;
    }
    
    // Check if we've exceeded the rate limit
    if (this.requestCount >= this.maxRequests) {
      const waitTime = this.resetTime - now;
      console.log(`Rate limit exceeded. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.resetTime = Date.now() + this.timeWindow;
    }
    
    // Ensure minimum interval between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      console.log(`Minimum interval not met. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }
}

// Debounce utility class
class Debouncer {
  private timeoutId: NodeJS.Timeout | null = null;
  
  debounce<TArgs extends unknown[], TReturn>(
    func: (...args: TArgs) => TReturn | Promise<TReturn>, 
    delay: number
  ): (...args: TArgs) => Promise<TReturn> {
    return (...args: TArgs): Promise<TReturn> => {
      return new Promise((resolve, reject) => {
        // Clear previous timeout
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        
        // Set new timeout
        this.timeoutId = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };
  }
  
  // Method to cancel pending debounced calls
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

// Create singleton instances
const destinationRateLimiter = new RateLimiter();
const shippingRateLimiter = new RateLimiter();
const destinationDebouncer = new Debouncer();

// Cache for destinations to reduce API calls
const destinationCache = new Map<string, { data: Destination[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_DELAY = 3000; // 3 seconds

// Internal search function (without debounce)
const _searchDestinationsInternal = async (
  keyword: string
): Promise<Destination[]> => {
  if (!keyword.trim() || keyword.length < 3) return [];

  // Check cache first
  const cacheKey = keyword.toLowerCase().trim();
  const cached = destinationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached destination data');
    return cached.data;
  }

  try {
    console.log(`Searching destinations for: "${keyword}"`);
    await destinationRateLimiter.waitForNextRequest();
    
    const res = await fetch(`/api/rajaongkir?search=${encodeURIComponent(keyword)}&limit=5`);

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Terlalu banyak pencarian. Silakan tunggu sebentar sebelum mencoba lagi.');
      }
      const errorText = await res.text();
      console.error("API Error:", res.status, errorText);
      throw new Error(`Failed to fetch destinations: ${res.status}`);
    }

    const data = await res.json();
    
    let destinations: RajaOngkirDestination[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      destinations = data.data;
    } else if (Array.isArray(data)) {
      destinations = data;
    } else {
      console.warn("Unexpected API response structure:", data);
      return [];
    }

    const result = destinations.map((item: RajaOngkirDestination) => ({
      value: item.id.toString(),
      label: item.label,
      province_name: item.province_name,
      city_name: item.city_name,
      district_name: item.district_name,
      subdistrict_name: item.subdistrict_name,
      zip_code: item.zip_code,
    }));

    // Cache the result
    destinationCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    console.log(`Found ${result.length} destinations for: "${keyword}"`);
    return result;

  } catch (error) {
    console.error("Error searching destinations:", error);
    throw error;
  }
};

// Public search function with debounce
export const searchDestinations = destinationDebouncer.debounce(
  _searchDestinationsInternal,
  DEBOUNCE_DELAY
);

// Utility function to cancel pending searches (useful for component cleanup)
export const cancelPendingDestinationSearch = () => {
  destinationDebouncer.cancel();
};

// Optional: Create a version that can be used with immediate search (bypass debounce)
export const searchDestinationsImmediate = _searchDestinationsInternal;
// Cache for shipping options
const shippingCache = new Map<string, { data: ShippingOption[]; timestamp: number }>();
const SHIPPING_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for shipping data

// Request deduplication for shipping options
const pendingShippingRequests = new Map<string, Promise<ShippingOption[]>>();

export const getShippingOptions = async (
  destinationId: string,
  weight: number
): Promise<ShippingOption[]> => {
  // Input validation
  const destIdNum = parseInt(destinationId);
  if (isNaN(destIdNum) || destIdNum <= 0) {
    throw new Error('ID tujuan tidak valid');
  }
  
  if (weight <= 0) {
    throw new Error('Berat harus lebih dari 0 gram');
  }
  
  // Clamp weight to reasonable limits
  const clampedWeight = Math.min(Math.max(weight, 1), 30000); // Between 1g and 30kg
  
  const cacheKey = `${destIdNum}-${clampedWeight}`;
  
  // Check if there's already a pending request for the same parameters
  const pendingRequest = pendingShippingRequests.get(cacheKey);
  if (pendingRequest) {
    console.log('Using pending request for shipping options');
    return await pendingRequest;
  }
  
  // Check cache first
  const cached = shippingCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SHIPPING_CACHE_DURATION) {
    console.log('Using cached shipping data');
    return cached.data;
  }

  // Create the request promise
  const requestPromise = performShippingRequest(destIdNum.toString(), clampedWeight, cacheKey);
  pendingShippingRequests.set(cacheKey, requestPromise);
  
  try {
    const result = await requestPromise;
    return result;
  } finally {
    // Clean up pending request
    pendingShippingRequests.delete(cacheKey);
  }
};

async function performShippingRequest(
  destinationId: string,
  weight: number,
  cacheKey: string
): Promise<ShippingOption[]> {
  try {
    await shippingRateLimiter.waitForNextRequest();
    
    // Get token from localStorage or cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      throw new Error('Authentication token not found. Silakan login kembali.');
    }

    // Use the Next.js API route instead of direct backend call for better error handling
    const apiUrl = `/api/shipping?destination_id=${destinationId}&weight=${weight}`;
    
    console.log("Calling shipping API:", apiUrl);
    
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Shipping API error:", res.status, errorText);
      
      let errorMessage = 'Gagal memuat opsi pengiriman';
      let isUserError = false;
      
      // Handle specific error types with better messaging
      if (res.status === 400) {
        isUserError = true;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
            
            // Check for validation errors that suggest address issues
            if (errorMessage.includes('Validasi gagal') || 
                errorMessage.includes('Invalid') || 
                errorMessage.includes('422')) {
              errorMessage = 'Alamat tujuan tidak valid atau tidak didukung oleh kurir. Silakan pilih alamat lain atau periksa kembali detail alamat.';
            }
          }
        } catch (e) {
          errorMessage = 'Parameter pengiriman tidak valid. Silakan periksa kembali alamat tujuan.';
        }
      } else if (res.status === 429) {
        errorMessage = 'Sistem sedang sibuk. Silakan tunggu beberapa saat sebelum mencoba lagi.';
      } else if (res.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      } else if (res.status === 404) {
        isUserError = true;
        errorMessage = 'Layanan pengiriman tidak tersedia untuk alamat tujuan ini. Silakan pilih alamat lain.';
      } else if (res.status === 500 || res.status === 502) {
        errorMessage = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
      } else if (res.status === 503) {
        errorMessage = 'Layanan pengiriman sedang dalam pemeliharaan. Silakan coba lagi nanti.';
      }
      
      const error = new Error(errorMessage) as Error & { isUserError: boolean };
      error.isUserError = isUserError;
      throw error;

    }

    const data = await res.json();
    console.log("Shipping API response:", data);
    
    const result = data.shipping_options || [];
    
    // Validate that we have meaningful results
    if (result.length === 0) {
      const error = new Error(
        "Tidak ada opsi pengiriman yang tersedia untuk alamat tujuan ini. Silakan pilih alamat lain atau hubungi customer service."
      ) as Error & { isUserError: boolean };
      
      error.isUserError = true;
      throw error;
    }

    // Cache the result
    shippingCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;

    } catch (error: unknown) {
      console.error("Error getting shipping options:", error);

      if (error instanceof Error) {
        // sudah punya pesan valid → lempar lagi
        if (error.message && !error.message.includes("Failed to fetch")) {
          throw error;
        }
      }

      // fallback untuk error tak dikenal
      throw new Error(
        "Tidak dapat terhubung ke layanan pengiriman. Periksa koneksi internet dan coba lagi."
      );
    }
}

// Utility function to clear caches (useful for debugging or manual refresh)
export const clearCaches = () => {
  destinationCache.clear();
  shippingCache.clear();
  pendingShippingRequests.clear();
  console.log('All caches cleared');
};

// Utility function to check if error is user-correctable
export const isUserCorrectableError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;

  const e = error as { isUserError?: boolean; message?: string };

  return (
    !!e.isUserError || // pastikan boolean
    !!e.message?.includes("alamat") ||
    !!e.message?.includes("tujuan") ||
    !!e.message?.includes("tidak valid") ||
    !!e.message?.includes("tidak didukung")
  );
};
