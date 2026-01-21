import React from 'react';

// Un avatar simple de compañero (puedes cambiar el SVG por otro personaje o emoji)
export default function CompanionAvatar({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Avatar compañero"
    >
      <circle cx="24" cy="24" r="24" fill="#fbbf24" />
      <ellipse cx="24" cy="30" rx="10" ry="6" fill="#fff" />
      <ellipse cx="18" cy="20" rx="3" ry="4" fill="#fff" />
      <ellipse cx="30" cy="20" rx="3" ry="4" fill="#fff" />
      <circle cx="18" cy="21" r="1.2" fill="#333" />
      <circle cx="30" cy="21" r="1.2" fill="#333" />
      <path d="M20 28 Q24 32 28 28" stroke="#333" strokeWidth="2" fill="none" />
    </svg>
  );
}
