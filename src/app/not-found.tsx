"use client";

import { CompassIcon, LayoutDashboard } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/providers/locale-provider";

export default function NotFound() {
  const { dict } = useLocale();

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="gradient-primary shadow-primary/30 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg">
        <CompassIcon className="h-9 w-9 text-white" />
      </div>
      <div>
        <p className="gradient-text text-7xl font-bold">404</p>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">
          {dict.errors.notFoundTitle}
        </h1>
        <p className="text-muted mx-auto mt-2 max-w-sm text-sm">
          {dict.errors.notFoundBody}
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          {dict.common.goToDashboard}
        </Link>
      </Button>
    </div>
  );
}
