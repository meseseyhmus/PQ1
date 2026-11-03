import { ChangeEvent } from "react";

export interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function Input({ type = "text", placeholder, value, onChange, disabled, className, label }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-[--muted] mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border border-[--border] rounded-xl
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50
          transition-colors
          ${className}
        `}
      />
    </div>
  );
}