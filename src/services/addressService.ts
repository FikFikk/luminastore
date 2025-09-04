import { IAddress } from "@/app/components/inteface/IAddress";
import { IAddressParams } from "@/app/components/inteface/IAddressParams";
import Cookies from "js-cookie";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE!}/address`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    "x-api-key": API_KEY,
    "Authorization": token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

export interface ApiResponse<T> {
  ok?: boolean; 
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  addresses?: IAddress[];
}

/**
 * Get member addresses
 */
export const getMemberAddresses = async (): Promise<IAddress[]> => {
  try {
    const response = await fetch(`${API_BASE}/getMemberAddresses`, {
      method: "GET",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<IAddress[]> = await response.json();
    console.log("Get addresses result:", result);

    return result.addresses || result.data || [];
  } catch (error) {
    console.error("Error getting addresses:", error);
    throw error;
  }
};

/**
 * Create new address with RajaOngkir IDs
 */
export const createMemberAddress = async (params: IAddressParams): Promise<IAddress> => {
  try {
    console.log("Creating address with params:", params);

    const response = await fetch(`${API_BASE}/createMemberAddress`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<IAddress> = await response.json();
    console.log("Create address result:", result);

    if (result.data) {
      return result.data;
    } else {
      throw new Error(result.error || result.message || 'Failed to create address');
    }
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
};

/**
 * Set default address
 * PUT /api/addresses/{id}/set-default
 */
export const setDefaultAddress = async (addressId: number): Promise<ApiResponse<IAddress>> => {
  try {
    console.log("Setting default address:", addressId);

    const response = await fetch(`${API_BASE}/setDefaultAddress/${addressId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Set default response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<IAddress> = await response.json();
    console.log("Set default address result:", result);

    return {
      ...result,
      ok: result.success || false
    };
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
};

/**
 * Delete address
 * DELETE /api/addresses/{id}
 */
export const deleteAddress = async (addressId: number): Promise<ApiResponse<null>> => {
  try {
    console.log("Deleting address:", addressId);

    const response = await fetch(`${API_BASE}/deleteMemberAddress/${addressId}`, {
      method: "DELETE",
      headers: {
        "x-api-key": API_KEY,
        "Authorization": Cookies.get("token") ? `Bearer ${Cookies.get("token")}` : "",
      },
      mode: "cors",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete response error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<null> = await response.json();
    console.log("Delete address result:", result);

    return {
      ...result,
      ok: result.success || false,
    };
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};


/**
 * Update address
 * PUT /api/addresses/{id}
 */
export const updateAddress = async (
  addressId: number,
  params: IAddressParams
): Promise<ApiResponse<IAddress>> => {
  try {
    console.log("Updating address:", addressId, "with params:", params);

    const response = await fetch(`${API_BASE}/updateMemberAddress/${addressId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<IAddress> = await response.json();
    console.log("Update address result:", result);

    return {
      ...result,              // spread biar semua field dari API tetap ada
      ok: result.success || false,
    };
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};
