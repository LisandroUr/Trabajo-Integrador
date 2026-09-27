'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function MercadoLibreLogo({
  className = '',
  size = 'md'
}: LogoProps) {
  const iconSize = size === 'sm' ? 26 : size === 'lg' ? 38 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-[22px]';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none cursor-pointer ${className}`}>
      {/* Storefront Awning Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Awning stripes / scallops */}
        <path
          d="M5 14L8 7H32L35 14"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 14C5 16.5 8 16.5 8 14C8 16.5 12 16.5 12 14C12 16.5 16 16.5 16 14C16 16.5 20 16.5 20 14C20 16.5 24 16.5 24 14C24 16.5 28 16.5 28 14C28 16.5 32 16.5 32 14C32 16.5 35 16.5 35 14"
          fill="#38bdf8"
          stroke="#38bdf8"
          strokeWidth="1.5"
        />
        {/* Awning body */}
        <path
          d="M8 7L5 14H35L32 7H8Z"
          fill="#38bdf8"
        />
        {/* Store base */}
        <path
          d="M7 16V33H33V16"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 4-pane window on left */}
        <rect x="11" y="20" width="8" height="8" rx="1" stroke="#38bdf8" strokeWidth="2" fill="none" />
        <line x1="15" y1="20" x2="15" y2="28" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="11" y1="24" x2="19" y2="24" stroke="#38bdf8" strokeWidth="1.5" />
        {/* Door on right */}
        <rect x="23" y="20" width="6" height="13" rx="1" fill="#38bdf8" />
      </svg>

      {/* Brand Text: VIDRIERA DIGITAL */}
      <span className={`font-black tracking-tight ${textSize} leading-none flex items-center gap-1.5`}>
        <span className="text-[#111827]">VIDRIERA</span>
        <span className="text-[#38bdf8]">DIGITAL</span>
      </span>
    </div>
  );
}

export { MercadoLibreLogo as VidrieraLogo };
