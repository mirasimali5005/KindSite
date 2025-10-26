import * as React from "react";
import { cn } from "../../lib/utils";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  /** Show the "mixed" visual state */
  indeterminate?: boolean;
  /** Visual size */
  size?: "sm" | "md" | "lg";
};

const sizes: Record<NonNullable<CheckboxProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate = false, size = "md", ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);

    // Allow both forwarded ref and local ref
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <input
        ref={innerRef}
        type="checkbox"
        className={cn(
          sizes[size],
          // native checkbox + Tailwind accent color
          "rounded-sm border border-gray-300 align-middle",
          "accent-black",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

export default Checkbox;
