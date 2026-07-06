import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
}

export function Card({ className, gradient, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700/60 dark:bg-gray-900",
        gradient && "bg-gradient-to-br from-teal-50 to-violet-50 dark:from-teal-950/40 dark:to-violet-950/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props}>
      {children}
    </p>
  );
}
