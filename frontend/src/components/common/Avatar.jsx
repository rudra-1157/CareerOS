import React, { useState } from 'react';

const Avatar = ({
  initials = 'CO',
  name = '',
  src = null,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  status = null,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: 'w-7 h-7 text-xs font-medium',
    md: 'w-8 h-8 text-xs font-semibold',
    lg: 'w-10 h-10 text-sm font-bold',
    xl: 'w-12 h-12 text-base font-bold',
    '2xl': 'w-24 h-24 text-2xl font-bold'
  };

  const statusColors = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-slate-400'
  };

  const getInitials = () => {
    if (initials && initials !== 'CO' && initials !== '?') return initials;
    if (name) {
      const parts = name.trim().split(' ').filter(Boolean);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    }
    return initials || 'CO';
  };

  const resolveImageSource = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    // Relative upload url from FastAPI backend
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const resolvedSrc = resolveImageSource(src);

  return (
    <div className="relative inline-block shrink-0">
      {resolvedSrc && !imageError ? (
        <img
          src={resolvedSrc}
          alt={name || 'Avatar'}
          onError={() => setImageError(true)}
          className={`${sizeMap[size] || sizeMap.md} rounded-full object-cover border border-[var(--color-card-border)] shadow-sm ${className}`}
        />
      ) : (
        <div
          className={`${sizeMap[size] || sizeMap.md} rounded-full flex items-center justify-center bg-[var(--color-secondary-bg)] text-[var(--color-primary-accent)] border border-[var(--color-card-border)] font-bold select-none ${className}`}
        >
          {getInitials()}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
            statusColors[status] || statusColors.online
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
