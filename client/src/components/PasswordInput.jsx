import { useState } from 'react';
import { inputClass } from './FormField';

export default function PasswordInput({ value, onChange, required, minLength, className = '', ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        className={`${inputClass} pr-10 ${className}`}
        value={value}
        onChange={onChange}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
      >
        {visible ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.97-1.97C17.61 13.6 19 11.56 19.54 10.49a1 1 0 000-.98C18.27 6.11 15 3 10 3a9.46 9.46 0 00-4.02.89L3.28 2.22zM7.53 6.47l1.55 1.55a2.5 2.5 0 013.9 3.9l1.55 1.55A4.5 4.5 0 007.53 6.47z" />
            <path d="M.46 9.51a1 1 0 000 .98C1.73 13.89 5 17 10 17c1.07 0 2.07-.14 3-.4l-1.6-1.6a5.5 5.5 0 01-6.87-6.87L2.9 6.5A10.1 10.1 0 00.46 9.51z" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10 3C5 3 1.73 6.11.46 9.5a1 1 0 000 .99C1.73 13.89 5 17 10 17s8.27-3.11 9.54-6.5a1 1 0 000-.99C18.27 6.11 15 3 10 3zm0 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
            <path d="M10 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
