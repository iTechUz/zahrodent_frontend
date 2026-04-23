import * as React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Formats a number with space-separated thousands: 300000 → "300 000"
 */
function formatMoney(value: string | number): string {
  const num = String(value).replace(/\s/g, "").replace(/[^\d]/g, "");
  if (!num) return "";
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Extracts raw numeric value from formatted string: "300 000" → "300000"
 */
function parseMoney(formatted: string): string {
  return formatted.replace(/\s/g, "");
}

interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  /** Raw numeric value (unformatted string or number, e.g. "300000") */
  value: string | number;
  /** Called with the raw numeric string (no spaces) */
  onChange: (rawValue: string) => void;
  /** Suffix shown inside the input, e.g. "so'm" */
  suffix?: string;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, suffix = "so'm", placeholder, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseMoney(e.target.value);
      // Only allow digits
      if (/^\d*$/.test(raw)) {
        onChange(raw);
      }
    };

    const displayValue = formatMoney(value);

    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            suffix ? "pr-14" : "",
            className,
          )}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder || "0"}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
MoneyInput.displayName = "MoneyInput";

export { MoneyInput, formatMoney, parseMoney };
