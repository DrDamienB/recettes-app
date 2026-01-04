import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = false,
      className = "",
      id,
      required,
      ...props
    },
    ref
  ) => {
    // Utiliser useId pour générer un ID stable entre serveur et client
    const generatedId = useId();
    const inputId = id || generatedId;

    const baseInputStyles =
      "px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-[#21262d] disabled:cursor-not-allowed bg-white dark:bg-[#0f1419] text-gray-900 dark:text-[#e6edf3]";

    const errorStyles = error
      ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
      : "border-gray-300 dark:border-[#30363d]";

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <div className={`flex flex-col gap-1 ${widthStyle}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-[#e6edf3]"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`${baseInputStyles} ${errorStyles} ${widthStyle} ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500 dark:text-[#8b949e]">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
