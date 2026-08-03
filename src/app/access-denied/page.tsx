"use client";

import { ShieldOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLocale } from "@/providers/locale-provider";
import { useMockAuth } from "@/providers/mock-auth-provider";

export default function AccessDeniedPage() {
  const { dict } = useLocale();
  const { logout } = useMockAuth();
  const router = useRouter();

  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <LanguageToggle className="absolute end-4 top-4" />
      <div className="gradient-primary shadow-primary/30 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg">
        <ShieldOff className="h-9 w-9 text-white" />
      </div>
      <div>
        <h1 className="text-foreground text-2xl font-semibold">
          {dict.accessDenied.title}
        </h1>
        <p className="text-muted mx-auto mt-2 max-w-sm text-sm">
          {dict.accessDenied.body}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">{dict.accessDenied.backToDashboard}</Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          {dict.accessDenied.signInDifferent}
        </Button>
      </div>
    </div>
  );
}
