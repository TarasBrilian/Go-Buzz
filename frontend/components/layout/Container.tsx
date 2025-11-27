import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export default function Container({
  children,
  className = '',
  size = 'lg',
}: ContainerProps) {
  const sizeStyles = {
    sm: 'max-w-4xl',
    md: 'max-w-6xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`container mx-auto px-6 ${sizeStyles[size]} ${className}`}>
      {children}
    </div>
  );
}
