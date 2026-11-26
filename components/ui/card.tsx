import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLElement> { children: ReactNode; as?: "article" | "section" | "div"; }

export function Card({ children, as: Element = "div", className = "", ...props }: CardProps) {
  return <Element className={`ui-card${className ? ` ${className}` : ""}`} {...props}>{children}</Element>;
}
