"use client";

import { Clock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLocale } from "@/providers/locale-provider";

export default function SessionExpiredPage() {
  const { dict } = useLocale();

  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <LanguageToggle className="absolute end-4 top-4" />
      <div className="gradient-primary shadow-primary/30 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg">
        <Clock className="h-9 w-9 text-white" />
      </div>
      <div>
        <h1 className="text-foreground text-2xl font-semibold">
          {dict.sessionExpired.title}
        </h1>
        <p className="text-muted mx-auto mt-2 max-w-sm text-sm">
          {dict.sessionExpired.body}
        </p>
      </div>
      <Button asChild>
        <Link href="/login">{dict.sessionExpired.cta}</Link>
      </Button>
    </div>
  );
}
