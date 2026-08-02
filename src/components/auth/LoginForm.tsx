"use client";

import { Eye, EyeOff, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { BrandMark } from "@/components/auth/BrandMark";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { siteConfig } from "@/config/site";
import { DEMO_ACCOUNT_PASSWORD, DEMO_ACCOUNTS } from "@/lib/mock-auth";
import { useLocale } from "@/providers/locale-provider";
import { useMockAuth, type LoginErrorCode } from "@/providers/mock-auth-provider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const { dict } = useLocale();
  const router = useRouter();
  const { login } = useMockAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorCode, setErrorCode] = useState<LoginErrorCode | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate() {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = dict.auth.validation.emailRequired;
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = dict.auth.validation.emailInvalid;
    }
    if (!password.trim()) {
      errors.password = dict.auth.validation.passwordRequired;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorCode(null);
    if (!validate()) {
      return;
    }

    setPending(true);
    window.setTimeout(() => {
      const result = login(email, password, rememberMe);
      if (result.success) {
        router.push("/dashboard");
        return;
      }
      setPending(false);
      setErrorCode(result.errorCode ?? "invalid_credentials");
    }, 600);
  }

  function fillDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_ACCOUNT_PASSWORD);
    setErrorCode(null);
    setFieldErrors({});
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-stretch gap-6 lg:flex-row lg:items-start">
      <Card glass className="w-full max-w-md space-y-6 p-8">
        <BrandMark title={dict.auth.title} subtitle={siteConfig.fullName} />

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
              name="email"
              type="email"
              autoComplete="email"
              placeholder={dict.auth.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className="text-danger mt-1 text-xs">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="password"
                className="text-foreground text-sm font-medium"
              >
                {dict.auth.passwordLabel}
              </label>
              <Link
                href="/forgot-password"
                className="text-primary text-xs font-medium hover:underline"
              >
                {dict.auth.forgotPasswordLink}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={dict.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
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
                <span className="sr-only">{dict.auth.passwordLabel}</span>
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-danger mt-1 text-xs">{fieldErrors.password}</p>
            )}
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="text-foreground">{dict.auth.rememberMe}</span>
          </label>

          {errorCode && (
            <p className="bg-danger-container text-danger rounded-lg px-3 py-2 text-sm">
              {dict.auth.errors[errorCode]}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? dict.auth.submitting : dict.auth.submit}
          </Button>
        </form>
      </Card>

      <Card className="w-full max-w-md space-y-3 p-6">
        <div className="flex items-center gap-2">
          <Info className="text-primary h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">
            {dict.auth.demoAccountsTitle}
          </h2>
        </div>
        <p className="text-muted text-xs">
          {dict.auth.demoAccountsHint.replace(
            "{password}",
            DEMO_ACCOUNT_PASSWORD,
          )}
        </p>
        <div className="space-y-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => fillDemoAccount(account.email)}
              className="border-border hover:border-primary/40 hover:bg-surface-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-start transition-colors"
            >
              <span className="min-w-0">
                <span className="text-foreground block truncate text-sm font-medium">
                  {account.name}
                </span>
                <span className="text-muted block truncate text-xs">
                  {account.email}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
