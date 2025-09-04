import Cookies from "js-cookie";

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T;
}

export interface LoginResponse {
  access_token?: string;
  message: string;
}

type LogoutResponse = {
  success: boolean;
  message: string;
};


export interface RegisterResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface SetPasswordResponse {
  message: string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE!}/auth`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

// LOGIN
export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ Email: email, Password: password }),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// FORGOT PASSWORD
export async function forgotPassword(email: string): Promise<ApiResponse<ForgotPasswordResponse>> {
  const res = await fetch(`${API_BASE}/forgot_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ Email: email }),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// REGISTER
export async function register(payload: {
  FirstName: string;
  Surname: string;
  Email: string;
  Password: string;
  PhoneNumber?: string;
}): Promise<ApiResponse<RegisterResponse>> {
  const formData = new FormData();
  formData.append("FirstName", payload.FirstName);
  formData.append("Surname", payload.Surname);
  formData.append("Email", payload.Email);
  formData.append("Password", payload.Password);
  if (payload.PhoneNumber) {
    formData.append("PhoneNumber", payload.PhoneNumber);
  }

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: formData,
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// LOGOUT
export async function logout(): Promise<ApiResponse<LogoutResponse>> {
  const token = Cookies.get("token");
  if (!token) {
    return { 
      ok: false, 
      status: 401, 
      data: { success: false, message: "Token not found" } 
    };
  }

  const res = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-api-key": API_KEY,
    },
  });

  const data: LogoutResponse = await res.json();

  return { ok: res.ok, status: res.status, data };
}


// SET PASSWORD
export async function setPassword(payload: {
  Email: string;
  Timestamp: number;
  Token: string;
  NewPassword: string;
}): Promise<ApiResponse<SetPasswordResponse>> {
  const res = await fetch(`${API_BASE}/set_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
