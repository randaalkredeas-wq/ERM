import { Suspense } from "react";

import { AuthPageBackground } from "@/components/auth/AuthPageBackground";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthPageBackground>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageBackground>
  );
}
