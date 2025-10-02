import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 54 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>App Translate Logo</title>
      <path
        d="M27 0L14.625 21.75L27 16.5L39.375 21.75L27 0Z"
        fill="#C4E8F2"
      />
      <path
        d="M14.625 21.75L27 44L0 21.75H14.625Z"
        fill="#004D66"
      />
      <path
        d="M27 16.5V44L14.625 21.75L27 16.5Z"
        fill="#1982A6"
      />
      <path
        d="M39.375 21.75L27 44L54 21.75H39.375Z"
        fill="#003342"
      />
      <path
        d="M27 16.5V44L39.375 21.75L27 16.5Z"
        fill="#006685"
      />
    </svg>
  );
}
