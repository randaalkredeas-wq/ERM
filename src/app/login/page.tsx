"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthPageBackground } from "@/components/auth/AuthPageBackground";
import { LoginForm } from "@/components/auth/LoginForm";
import { useMockAuth } from "@/providers/mock-auth-provider";

export default function LoginPage() {
  const { status } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null;
  }

  return (
    <AuthPageBackground>
      <LoginForm />
    </AuthPageBackground>
  );
}
