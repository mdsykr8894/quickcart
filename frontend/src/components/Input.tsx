import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col mb-4">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 bg-white border rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-orange-500 focus:ring-orange-100 placeholder:text-gray-400 transition-all ${
            error 
              ? 'border-red-500 focus:ring-red-100 focus:border-red-500' 
              : 'border-gray-200 focus:border-orange-500'
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-red-600 mt-1.5" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-gray-400 mt-1">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
