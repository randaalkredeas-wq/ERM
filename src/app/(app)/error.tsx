"use client";

import { AlertOctagon, RotateCw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/providers/locale-provider";

export default function AppSegmentError({
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
    <div className="border-border-strong flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed px-6 py-20 text-center">
      <div className="bg-danger-container text-danger flex h-16 w-16 items-center justify-center rounded-2xl">
        <AlertOctagon className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-foreground text-lg font-semibold">
          {dict.errors.errorTitle}
        </h2>
        <p className="text-muted mx-auto mt-1.5 max-w-sm text-sm">
          {dict.errors.errorBody}
        </p>
      </div>
      <Button onClick={reset}>
        <RotateCw className="h-4 w-4" />
        {dict.common.tryAgain}
      </Button>
    </div>
  );
}
