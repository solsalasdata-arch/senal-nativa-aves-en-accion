import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../utils/i18n';
import { IconButton } from './IconButton';

export interface SheetHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  titleId?: string;
}

export function SheetHeader({ title, subtitle, icon, onClose, titleId }: SheetHeaderProps) {
  const { tx } = useLanguage();
  return <header className="flex items-center gap-3 border-b border-white/15 p-4 text-ink">
    {icon && <span aria-hidden="true" className="shrink-0">{icon}</span>}
    <div className="min-w-0 flex-1"><h2 id={titleId} className="text-lg font-semibold leading-snug">{title}</h2>{subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}</div>
    <IconButton label={tx('Cerrar', 'Close')} onClick={onClose}><X aria-hidden="true" className="h-5 w-5" /></IconButton>
  </header>;
}

export const ModalHeader = SheetHeader;
