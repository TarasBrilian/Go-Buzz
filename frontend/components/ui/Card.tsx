import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  withCorners?: boolean;
  withPulse?: boolean;
}

export default function Card({
  children,
  className = '',
  withCorners = false,
  withPulse = false,
}: CardProps) {
  return (
    <div className={`feature-card group ${className}`}>
      {withCorners && (
        <>
          <div className="card-corner card-corner-tl" />
          <div className="card-corner card-corner-tr" />
          <div className="card-corner card-corner-bl" />
          <div className="card-corner card-corner-br" />
        </>
      )}
      {children}
      {withPulse && <div className="card-pulse" />}
    </div>
  );
}
