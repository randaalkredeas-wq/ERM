"use client";

import { Eye, EyeOff, Loader2, ShieldHalf } from "lucide-react";
import { useActionState, useState } from "react";

import { login, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { siteConfig } from "@/config/site";
import { useLocale } from "@/providers/locale-provider";

const initialState: LoginState = {};

export function LoginForm() {
  const { dict } = useLocale();
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card glass className="w-full max-w-md space-y-6 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="gradient-primary flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg">
          <ShieldHalf className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            {dict.auth.title}
          </h1>
          <p className="text-muted mt-1 text-sm">{siteConfig.fullName}</p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
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
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-foreground mb-1.5 block text-sm font-medium"
          >
            {dict.auth.passwordLabel}
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={dict.auth.passwordPlaceholder}
              required
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
        </div>

        {state.errorCode && (
          <p className="bg-danger-container text-danger rounded-lg px-3 py-2 text-sm">
            {dict.auth.errors[state.errorCode]}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? dict.auth.submitting : dict.auth.submit}
        </Button>
      </form>
    </Card>
  );
}
