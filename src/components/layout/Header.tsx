import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-6">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
