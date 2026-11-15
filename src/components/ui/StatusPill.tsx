import React from 'react';

export interface StatusPillProps {
  icon?: React.ReactNode;
  text: string;
  tone?: 'neutral' | 'success' | 'warning' | 'info';
}

const tones = {
  neutral: '',
  success: 'text-emerald-200 border-emerald-400/50',
  warning: 'text-amber-200 border-amber-400/50',
  info: 'text-cyan-200 border-cyan-400/50',
};

export function StatusPill({ icon, text, tone = 'neutral' }: StatusPillProps) {
  return <span className={`ui-chip ${tones[tone]}`}>{icon && <span aria-hidden="true" className="inline-flex shrink-0">{icon}</span>}{text}</span>;
}
