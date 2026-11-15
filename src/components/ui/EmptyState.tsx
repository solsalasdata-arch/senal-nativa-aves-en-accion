import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return <div className="flex flex-col items-center gap-3 p-6 text-center text-ink">
    {icon && <span aria-hidden="true" className="text-action-turquoise">{icon}</span>}
    <h3 className="text-lg font-semibold">{title}</h3><p className="text-sm text-ink-muted">{text}</p>{action}
  </div>;
}
