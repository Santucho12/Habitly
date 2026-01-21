import React from 'react';

export default function AppLogo({ className = '', size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo Habitly"
    >
      <circle cx="24" cy="24" r="24" fill="#2563eb" />
      <path d="M14 32c2-6 6-12 10-12s8 6 10 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="20" r="4" fill="#fff" />
    </svg>
  );
}
