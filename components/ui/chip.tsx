import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

interface ChipBaseProps { children: ReactNode; selected?: boolean; leadingIcon?: ReactNode; }
type InteractiveChipProps = ChipBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"]; };
type StaticChipProps = ChipBaseProps & HTMLAttributes<HTMLSpanElement> & { onClick?: never; };

export function Chip(props: InteractiveChipProps | StaticChipProps) {
  const { children, selected = false, leadingIcon, className = "", ...rest } = props;
  const classes = `ui-chip${selected ? " ui-chip-selected" : ""}${className ? ` ${className}` : ""}`;
  if ("onClick" in props && props.onClick) {
    const { onClick, ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
    return <button type="button" className={classes} aria-pressed={selected} onClick={onClick} {...buttonProps}>{leadingIcon}{children}</button>;
  }
  return <span className={`${classes} ui-chip-static`} {...(rest as HTMLAttributes<HTMLSpanElement>)}>{leadingIcon}{children}</span>;
}
