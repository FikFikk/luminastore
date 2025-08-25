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

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T;
}

// GET USER
export const getUser = async (): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`${API_BASE}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    return { ok: false, status: 500, data: { message: error instanceof Error ? error.message : "Unknown error" } };
  }
};

// UPDATE PROFILE (TEXT ONLY)
export const updateUserProfile = async (payload: {
  FirstName?: string;
  Surname?: string;
  PhoneNumber?: string;
  Address?: string;
  Email?: string;
}): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`${API_BASE}/update_profile`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    return { ok: false, status: 500, data: { message: error instanceof Error ? error.message : "Unknown error" } };
  }
};

// UPLOAD PROFILE PICTURE
export const uploadProfilePicture = async (file: File): Promise<ApiResponse<any>> => {
  try {
    const formData = new FormData();
    formData.append("PhotoProfile", file);

    const res = await fetch(`${API_BASE}/update_profile`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        // ⚠️ jangan pakai Content-Type, biar FormData otomatis set boundary
      },
      body: formData,
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    return { ok: false, status: 500, data: { message: error instanceof Error ? error.message : "Unknown error" } };
  }
};
