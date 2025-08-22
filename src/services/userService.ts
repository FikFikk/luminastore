import Cookies from "js-cookie";

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T;
}

export interface UserResponse {
  ID?: number;
  FirstName: string;
  Surname: string;
  Email: string;
  PhoneNumber?: string;
  Address?: string;
  ProfilePicture?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface UpdateUserResponse {
  message: string;
}

//
// FETCH USER
//
export async function fetchUser(): Promise<UserResponse | null> {
  try {
    console.log("🔍 fetchUser service dipanggil");
    
    const res = await fetch("/api/user", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      credentials: "include" // biar cookie ikut terkirim
    });

    console.log("📡 Response status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
      console.error("❌ Failed to fetch user:", res.status, errorData);
      return null;
    }

    const data = await res.json();
    console.log("📦 User data received:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetchUser service:", error);
    return null;
  }
}

//
// UPDATE USER PROFILE
//
export async function updateUserProfile(payload: {
  FirstName: string;
  Surname: string;
  Email: string;
  PhoneNumber?: string;
  Address?: string;
}): Promise<ApiResponse<UpdateUserResponse>> {
  try {
    console.log("🔄 updateUserProfile service dipanggil", payload);
    
    const formData = new FormData();
    formData.append("FirstName", payload.FirstName);
    formData.append("Surname", payload.Surname);
    formData.append("Email", payload.Email);
    
    if (payload.PhoneNumber) {
      formData.append("PhoneNumber", payload.PhoneNumber);
    }
    
    if (payload.Address) {
      formData.append("Address", payload.Address);
    }

    const res = await fetch("/api/user", {
      method: "PUT",
      credentials: "include", // biar cookie ikut terkirim
      body: formData,
    });

    console.log("📡 Update response status:", res.status);

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error("❌ Error updateUserProfile service:", error);
    return { 
      ok: false, 
      status: 500, 
      data: { message: "Network error" } 
    };
  }
}

//
// UPLOAD PROFILE PICTURE
//
export async function uploadProfilePicture(file: File): Promise<ApiResponse<UpdateUserResponse>> {
  try {
    console.log("📸 uploadProfilePicture service dipanggil", file.name);
    
    const formData = new FormData();
    formData.append("ProfilePicture", file);

    const res = await fetch("/api/user/profile-picture", {
      method: "POST",
      credentials: "include", // biar cookie ikut terkirim
      body: formData,
    });

    console.log("📡 Upload response status:", res.status);

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error("❌ Error uploadProfilePicture service:", error);
    return { 
      ok: false, 
      status: 500, 
      data: { message: "Network error" } 
    };
  }
}