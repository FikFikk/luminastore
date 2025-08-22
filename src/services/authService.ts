// services/authService.ts

export interface ForgotPasswordResponse {
  message: string;
}

const API_BASE = "http://localhost:8080/api/auth";

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const res = await fetch(`${API_BASE}/forgot_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ Email: email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}
