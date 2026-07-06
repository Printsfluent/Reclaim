import { cn } from "@/lib/utils/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    const variants = {
      primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm",
      secondary: "bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-100 dark:hover:bg-violet-800",
      ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
      danger: "bg-red-600 text-white hover:bg-red-700",
      outline: "border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
