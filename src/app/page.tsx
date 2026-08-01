import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/config/site";

const features = [
  {
    title: "Next.js",
    description: "App Router, server components, and file-based routing.",
  },
  {
    title: "TypeScript",
    description: "Strict type-checking configured out of the box.",
  },
  {
    title: "Tailwind CSS",
    description: "Utility-first styling with a shared design system.",
  },
];

export default function Home() {
  return (
    <Container className="flex flex-col items-center gap-12 py-24 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-xl text-lg text-gray-600">
          {siteConfig.description}
        </p>
        <div className="flex gap-3">
          <Button>Get Started</Button>
          <Button variant="outline">Documentation</Button>
        </div>
      </div>

      <div className="grid w-full gap-6 text-left sm:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <h2 className="text-base font-semibold text-gray-900">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
          </Card>
        ))}
      </div>
    </Container>
  );
}
