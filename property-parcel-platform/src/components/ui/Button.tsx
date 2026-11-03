import { ReactNode } from "react";

export interface ButtonProps {
  className?: string;
  variant?: "default" | "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Button({
  className,
  variant = "default",
  size = "md",
  disabled,
  onClick,
  children,
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-transition duration-200";

  const variantClasses = {
    default: "border border-[--border] text-[--foreground] hover:bg-[--muted]",
    primary: "bg-[var(--primary)] text-[--primary-foreground] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]",
    secondary: "bg-[--card] text-[--foreground] hover:bg-[--muted]",
    ghost: "hover:bg-[--muted] hover:text-[--foreground]",
  };

  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}