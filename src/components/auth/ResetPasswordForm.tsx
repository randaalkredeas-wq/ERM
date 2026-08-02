"use client";

import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { BrandMark } from "@/components/auth/BrandMark";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useLocale } from "@/providers/locale-provider";

export function ResetPasswordForm() {
  const { dict } = useLocale();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (password.trim().length < 6) {
      nextErrors.password = dict.resetPassword.validation.tooShort;
    }
    if (confirmPassword !== password) {
      nextErrors.confirm = dict.resetPassword.validation.mismatch;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      setDone(true);
    }, 700);
  }

  if (done) {
    return (
      <Card glass className="w-full max-w-md space-y-5 p-8 text-center">
        <span className="bg-success-container text-success mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            {dict.resetPassword.successTitle}
          </h1>
          <p className="text-muted mt-2 text-sm">
            {dict.resetPassword.successBody}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">{dict.resetPassword.backToLogin}</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card glass className="w-full max-w-md space-y-6 p-8">
      <BrandMark
        title={dict.resetPassword.title}
        subtitle={
          email
            ? dict.resetPassword.subtitleWithEmail.replace("{email}", email)
            : dict.resetPassword.subtitle
        }
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="newPassword"
            className="text-foreground mb-1.5 block text-sm font-medium"
          >
            {dict.resetPassword.newPasswordLabel}
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              className="pe-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">{dict.resetPassword.newPasswordLabel}</span>
            </button>
          </div>
          {errors.password && (
            <p className="text-danger mt-1 text-xs">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="text-foreground mb-1.5 block text-sm font-medium"
          >
            {dict.resetPassword.confirmPasswordLabel}
          </label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(errors.confirm)}
          />
          {errors.confirm && (
            <p className="text-danger mt-1 text-xs">{errors.confirm}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? dict.resetPassword.submitting : dict.resetPassword.submit}
        </Button>
      </form>
    </Card>
  );
}
