import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  iconOnly?: boolean;
  children: ReactNode;
}

export function Button({ variant = "primary", iconOnly = false, className = "", children, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`ui-button ui-button-${variant}${iconOnly ? " ui-button-icon" : ""}${className ? ` ${className}` : ""}`} {...props}>{children}</button>;
}
