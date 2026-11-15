import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className = '', type = 'button', ...props }: IconButtonProps) {
  return <button {...props} type={type} aria-label={label} title={label} className={`ui-icon-btn ${className}`} />;
}
