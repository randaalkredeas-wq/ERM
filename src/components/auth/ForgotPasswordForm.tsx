"use client";

import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { BrandMark } from "@/components/auth/BrandMark";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useLocale } from "@/providers/locale-provider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const { dict } = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !EMAIL_PATTERN.test(email.trim())) {
      setError(dict.forgotPassword.validation.emailInvalid);
      return;
    }
    setError(null);
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      setSent(true);
    }, 700);
  }

  if (sent) {
    return (
      <Card glass className="w-full max-w-md space-y-5 p-8 text-center">
        <span className="bg-success-container text-success mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
          <MailCheck className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            {dict.forgotPassword.sentTitle}
          </h1>
          <p className="text-muted mt-2 text-sm">
            {dict.forgotPassword.sentBody.replace("{email}", email)}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
            {dict.forgotPassword.continueToReset}
          </Link>
        </Button>
        <Link
          href="/login"
          className="text-muted hover:text-foreground flex items-center justify-center gap-1.5 text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {dict.forgotPassword.backToLogin}
        </Link>
      </Card>
    );
  }

  return (
    <Card glass className="w-full max-w-md space-y-6 p-8">
      <BrandMark
        title={dict.forgotPassword.title}
        subtitle={dict.forgotPassword.subtitle}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="text-foreground mb-1.5 block text-sm font-medium"
          >
            {dict.auth.emailLabel}
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={dict.auth.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(error)}
          />
          {error && <p className="text-danger mt-1 text-xs">{error}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? dict.forgotPassword.submitting : dict.forgotPassword.submit}
        </Button>

        <Link
          href="/login"
          className="text-muted hover:text-foreground flex items-center justify-center gap-1.5 text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {dict.forgotPassword.backToLogin}
        </Link>
      </form>
    </Card>
  );
}
