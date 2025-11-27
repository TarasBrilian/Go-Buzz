import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'holographic' | 'data-stream';
}

export default function Panel({
  children,
  className = '',
  variant = 'default',
}: PanelProps) {
  const variantStyles = {
    default: 'app-content-panel',
    holographic: 'holo-panel',
    'data-stream': 'data-stream-panel',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {variant === 'default' && (
        <>
          <div className="panel-corner panel-corner-tl" />
          <div className="panel-corner panel-corner-tr" />
          <div className="panel-corner panel-corner-bl" />
          <div className="panel-corner panel-corner-br" />
        </>
      )}
      {variant === 'holographic' && <div className="hex-pattern" />}
      {variant === 'data-stream' && <div className="data-line" />}
      {children}
    </div>
  );
}
