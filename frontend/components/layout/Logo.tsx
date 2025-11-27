import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'small' | 'large';
  linkTo?: string;
}

export default function Logo({ size = 'large', linkTo = '/' }: LogoProps) {
  const isSmall = size === 'small';

  return (
    <div className="flex items-center gap-2">
      <Link href={linkTo}>
        <div className={isSmall ? 'app-logo-text' : 'nav-logo-text'}>
          <span className={`font-bold text-white tracking-wider ${isSmall ? 'text-lg' : 'text-xl'}`}>
            GO
          </span>
          <span className={`font-bold text-[#3AE8FF] tracking-wider ${isSmall ? 'text-lg' : 'text-xl'}`}>
            {' '}BUZZ
          </span>
        </div>
      </Link>
    </div>
  );
}
