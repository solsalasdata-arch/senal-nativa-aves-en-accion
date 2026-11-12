import React from 'react';

interface AvatarIconProps {
  /** Emoji clásico o ruta de imagen (p.ej. '/assets/characters/yunga-nino.jpg') */
  icon?: string;
  className?: string;
  alt?: string;
}

/**
 * Renderiza el avatar del explorador: imagen PNG/JPG cuando `icon` es una ruta,
 * o el emoji/texto original para perfiles antiguos.
 */
export const AvatarIcon: React.FC<AvatarIconProps> = ({ icon, className, alt = '' }) => {
  if (icon && icon.startsWith('/')) {
    return (
      <img
        src={icon}
        alt={alt}
        className={`object-cover object-top rounded-full ${className || ''}`}
        draggable={false}
      />
    );
  }
  return <span className={className}>{icon || '🧢'}</span>;
};
