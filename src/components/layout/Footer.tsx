import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <Container className="flex h-16 items-center justify-center text-sm text-gray-500">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </Container>
    </footer>
  );
}
