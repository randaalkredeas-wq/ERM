import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/dal";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div
      className="bg-background flex min-h-screen items-center justify-center p-4"
      style={{ backgroundImage: "var(--sidebar-bg)" }}
    >
      <LoginForm />
    </div>
  );
}
