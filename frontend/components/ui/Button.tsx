import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'relative font-semibold text-transform-uppercase letter-spacing-wider cursor-pointer overflow-hidden transition-all duration-300';

  const variantStyles = {
    primary: 'glass-button group',
    secondary: 'glass-button-secondary group',
    ghost: 'nav-cta-button',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-8 py-3 text-sm',
    lg: 'px-12 py-4 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      <div className={variant === 'primary' ? 'button-glow' : variant === 'ghost' ? 'nav-cta-glow' : ''} />
    </button>
  );
}
