import React from 'react';

const Avatar = ({
  initials = 'RP',
  name = '',
  src = null,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  status = null, // 'online' | 'busy' | 'offline'
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-12 h-12 text-base font-extrabold',
    xl: 'w-16 h-16 text-xl font-black'
  };

  const statusColors = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-gray-400'
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeMap[size]} rounded-full object-cover border-2 border-white shadow-sm ${className}`}
        />
      ) : (
        <div
          className={`${sizeMap[size]} rounded-full flex items-center justify-center bg-[#dce5ff] text-[#29458e] border-2 border-white shadow-sm select-none ${className}`}
        >
          {initials || (name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CO')}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-white ${statusColors[status] || statusColors.online}`}
        />
      )}
    </div>
  );
};

export default Avatar;
