"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Avatar({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage(
  props: ComponentProps<typeof AvatarPrimitive.Image>,
) {
  return (
    <AvatarPrimitive.Image
      className="aspect-square h-full w-full object-cover"
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "bg-primary-container text-on-primary-container flex h-full w-full items-center justify-center text-xs font-semibold",
        className,
      )}
      {...props}
    />
  );
}
