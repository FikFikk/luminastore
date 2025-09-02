import AuthLayout from "@/app/components/auth/AuthLayout";
import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout backgroundGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
      <RegisterForm />
    </AuthLayout>
  );
}