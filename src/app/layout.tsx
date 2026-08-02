import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";

import "./globals.css";

import { TooltipProvider } from "@/components/ui/Tooltip";
import { siteConfig } from "@/config/site";
import { LocaleProvider } from "@/providers/locale-provider";
import { MockAuthProvider } from "@/providers/mock-auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.fullName}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider>
            <MockAuthProvider>
              <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            </MockAuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
