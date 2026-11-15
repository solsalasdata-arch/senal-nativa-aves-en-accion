import React from 'react';

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`ui-card ${className}`} />;
}
