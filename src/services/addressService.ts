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


export interface Address {
  ID: number;
  ClassName: string;
  RecordClassName: string;
  Title: string;
  Alamat: string;
  KodePos: string;
  Kecamatan: string;
  Kota: string;
  Provinsi: string;
  IsDefault: number;
  MemberID: number;
  ProvinceID: number;
  CityID: number;
  DistrictID: number;
  SubDistrictID: number;
  Created: string;
  LastEdited: string;
}

export interface CreateAddressParams {
  member_id: number;
  title: string;
  alamat: string;
  kodepos: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  is_default: number;
  province_id: number;
  city_id: number;
  district_id: number;
  subdistrict_id: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  addresses?: Address[];
}

/**
 * Get member addresses
 */
export const getMemberAddresses = async (): Promise<Address[]> => {
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

    const result: ApiResponse<Address[]> = await response.json();
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
export const createMemberAddress = async (params: CreateAddressParams): Promise<Address> => {
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

    const result: ApiResponse<Address> = await response.json();
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
 * Update address
 */
export const updateAddress = async (addressId: number, params: Partial<CreateAddressParams>): Promise<Address> => {
  try {
    const response = await fetch(`${API_BASE}/updateAddress/${addressId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<Address> = await response.json();
    console.log("Update address result:", result);

    if (result.data) {
      return result.data;
    } else {
      throw new Error(result.error || result.message || 'Failed to update address');
    }
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/deleteAddress/${addressId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<void> = await response.json();
    console.log("Delete address result:", result);

    if (result.success === false) {
      throw new Error(result.error || result.message || 'Failed to delete address');
    }
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};