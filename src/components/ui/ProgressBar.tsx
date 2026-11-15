import React from 'react';

export interface ProgressBarProps {
  value: number;
  label: string;
  className?: string;
}

export function ProgressBar({ value, label, className = '' }: ProgressBarProps) {
  const progress = Number.isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
  return <div className={`ui-progress ${className}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="ui-progress-bar" style={{ width: `${progress}%` }} /></div>;
}
