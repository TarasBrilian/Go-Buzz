import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'ending' | 'completed';
  className?: string;
}

export default function Badge({
  children,
  variant = 'active',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    active: 'status-active',
    ending: 'status-ending',
    completed: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
  };

  return (
    <span className={`campaign-status ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
