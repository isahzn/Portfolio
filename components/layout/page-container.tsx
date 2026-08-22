import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared page container (docs/04_COMPONENT_LIBARY.MD — layout components).
 * Wraps page content in a consistent max-width and responsive padding.
 */
export function PageContainer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}
