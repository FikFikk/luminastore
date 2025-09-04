import { IAddress } from "@/app/components/inteface/IAddress";
import Cookies from "js-cookie";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE!}/user`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    "x-api-key": API_KEY,
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}


export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T;
}

export interface PhotoProfile {
  original: string;
  small: string;
  medium: string;
}

export interface User {
  Addresses: IAddress[];
  message: string;
  ID: number;
  Email: string;
  FirstName: string;
  Surname: string;
  PhoneNumber: string;
  PhotoProfile: PhotoProfile;
  Address?: string;
}



// GET USER
export const getUser = async (): Promise<ApiResponse<User>> => {
  try {
    const res = await fetch(`${API_BASE}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        Accept: "application/json",
      },
    });

    const data: User = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error: unknown) {
    return {
      ok: false,
      status: 500,
      data: {
        message: error instanceof Error ? error.message : "Unknown error",
      } as unknown as User, // fallback typing supaya tetap sesuai
    };
  }
};


// UPDATE PROFILE (TEXT ONLY)
export const updateUserProfile = async (
  payload: Partial<Pick<User, "FirstName" | "Surname" | "PhoneNumber" | "Address" | "Email">>
): Promise<ApiResponse<User>> => {
  try {
    const res = await fetch(`${API_BASE}/update_profile`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: User = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error: unknown) {
    return {
      ok: false,
      status: 500,
      data: {
        message: error instanceof Error ? error.message : "Unknown error",
      } as unknown as User,
    };
  }
};


export const uploadProfilePicture = async (file: File): Promise<ApiResponse<User>> => {
  try {
    const formData = new FormData();
    formData.append("PhotoProfile", file);

    const res = await fetch(`${API_BASE}/update_profile`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        // jangan pakai Content-Type, biar FormData otomatis set boundary
      },
      body: formData,
    });

    const data: User = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error: unknown) {
    return {
      ok: false,
      status: 500,
      data: {
        message: error instanceof Error ? error.message : "Unknown error",
      } as unknown as User, // fallback typing
    };
  }
};


// CHANGE PASSWORD
export const changePassword = async (payload: {
  CurrentPassword: string;
  NewPassword: string;
}): Promise<ApiResponse<ChangePasswordResponse>> => {
  try {
    const res = await fetch(`${API_BASE}/update_password`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: ChangePasswordResponse = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error: unknown) {
    return {
      ok: false,
      status: 500,
      data: {
        message: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
    };
  }
};
