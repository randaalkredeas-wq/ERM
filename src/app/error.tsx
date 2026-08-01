"use client";

import { AlertOctagon, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/providers/locale-provider";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dict } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-danger-container text-danger flex h-20 w-20 items-center justify-center rounded-3xl">
        <AlertOctagon className="h-9 w-9" />
      </div>
      <div>
        <h1 className="text-foreground text-2xl font-semibold">
          {dict.errors.errorTitle}
        </h1>
        <p className="text-muted mx-auto mt-2 max-w-sm text-sm">
          {dict.errors.errorBody}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={reset}>
          <RotateCw className="h-4 w-4" />
          {dict.common.tryAgain}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">{dict.common.goToDashboard}</Link>
        </Button>
      </div>
    </div>
  );
}
