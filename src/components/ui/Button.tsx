import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', fullWidth = false, icon, children, className = '', type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} className={`ui-btn ui-btn-${variant} ${size === 'lg' ? 'min-h-12 px-6 py-3 text-base' : 'text-sm'} ${fullWidth ? 'w-full' : ''} ${className}`}><span aria-hidden="true" className={icon ? 'inline-flex shrink-0' : 'hidden'}>{icon}</span>{children}</button>;
}
