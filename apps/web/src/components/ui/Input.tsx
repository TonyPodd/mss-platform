'use client';

import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const containerClass = [styles.container, fullWidth && styles.fullWidth, className]
      .filter(Boolean)
      .join(' ');

    const inputClass = [styles.input, error && styles.error].filter(Boolean).join(' ');

    return (
      <div className={containerClass}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={inputClass} {...props} />
        {error && <span className={styles.errorText}>{error}</span>}
        {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
