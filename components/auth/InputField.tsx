"use client";

import React, { forwardRef } from "react";
import { LucideIcon } from "lucide-react";

interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  icon?: LucideIcon;
  leftIcon?: LucideIcon; /** Icon to display inside the input on the left */
  error?: string;
  required?: boolean;
  isTextArea?: boolean;
}

const InputField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputFieldProps
>(
  (
    {
      label,
      icon: LabelIcon,
      leftIcon: LeftIcon,
      error,
      required,
      isTextArea,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseClassName = `
      w-full px-4 py-3 rounded-3xl placeholder-[#929292]
              border-[1px] border-[#929292]
      focus:outline-none focus:ring-2 focus:ring-[#00A8CC]
      transition-all duration-200
      ${error ? "ring-2 ring-red-500" : ""}
      ${LeftIcon ? "pl-11" : ""}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
            {LabelIcon && <LabelIcon className="w-5 h-5 text-black" />}{" "}
            {/* Icon beside label */}
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}{" "}
            {/* Required asterisk in black */}
          </label>
        )}

        {isTextArea ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={baseClassName}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <div className="relative">
            {LeftIcon && (
              <LeftIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              className={baseClassName}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
