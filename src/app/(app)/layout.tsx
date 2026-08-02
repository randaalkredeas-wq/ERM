"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { useMockAuth } from "@/providers/mock-auth-provider";

export default function AppGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, status } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "expired") {
      router.replace("/session-expired");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status !== "authenticated" || !user) {
    return null;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
