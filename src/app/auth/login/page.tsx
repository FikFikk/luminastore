"use client";

import React from "react";
import LoginForm from "@/app/components/auth/LoginForm";
import AuthLayout from "@/app/components/auth/AuthLayout";

function LoginPage() {
  return (
    <AuthLayout backgroundGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
      <LoginForm />
    </AuthLayout>
  );
}

export default LoginPage;
