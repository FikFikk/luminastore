import AuthLayout from "@/app/components/auth/AuthLayout";
import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";
import { buildPageMetadata } from "@/services/metadataHelper";

export async function generateMetadata() {
  return buildPageMetadata("Forgot Password");
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout backgroundGradient="linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%)">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}