"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password }),
        });


      const data = await res.json();

      if (res.ok) {
        Cookies.set("token", data.access_token, { expires: 1 });

        setMessage("Login successful ✅");
        router.push("/");
      } else {
        setMessage(data.message || "Login gagal");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage("Terjadi error: " + err.message);
      } else {
        setMessage("Terjadi error yang tidak diketahui");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow w-80 mx-auto mt-20">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input
        type="email"
        placeholder="Email"
        className="w-full mb-3 p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full mb-3 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Login
      </button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </form>
  );
}

export default LoginPage;
