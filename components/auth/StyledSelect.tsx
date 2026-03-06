"use client";

import React from "react";
import styles from "./StyledSelect.module.css";

interface Option {
  value: string;
  label: string;
}

interface StyledSelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  variant?: 'A' | 'B' | 'C';
  leftIcon?: React.ReactNode;
}

export default function StyledSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "",
  variant = 'A',
  leftIcon,
}: StyledSelectProps) {
  const variantClass = variant === 'A' ? styles.selectA : variant === 'B' ? styles.selectB : styles.selectC;
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}
        <select
          className={`${styles.select} ${variantClass}`}
          value={value || ""}
          onChange={(e) => onChange && onChange(e.target.value)}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <svg className={styles.arrow} viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M1 1L6 6L11 1" className="stroke-brand-navy" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
