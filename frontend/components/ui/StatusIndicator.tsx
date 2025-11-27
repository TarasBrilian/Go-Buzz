import React from 'react';

interface StatusIndicatorProps {
  label: string;
  variant?: 'online' | 'live' | 'offline' | 'expired' | 'ending';
  className?: string;
}

export default function StatusIndicator({
  label,
  variant = 'online',
  className = '',
}: StatusIndicatorProps) {
  const colorStyles = {
    online: 'text-[#3AE8FF] bg-[#3AE8FF]',
    live: 'text-[#3AE8FF] bg-[#3AE8FF]',
    offline: 'text-gray-500 bg-gray-500',
    expired: 'text-orange-400 bg-orange-400',
    ending: 'text-orange-400 bg-orange-400',
  };

  return (
    <div className={`flex items-center gap-2 text-sm font-mono ${className}`}>
      <div className={`w-2 h-2 ${colorStyles[variant].split(' ')[1]} rounded-full animate-pulse`} />
      <span className={colorStyles[variant].split(' ')[0]}>{label}</span>
    </div>
  );
}
