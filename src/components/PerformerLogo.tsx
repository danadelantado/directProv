import React from 'react';
import logoImg from '../assets/images/logo01.png';
import logoBlanco from '../assets/images/logoPerformer.webp';

interface PerformerLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}

export const PerformerLogo: React.FC<PerformerLogoProps> = ({ 
  size = 'md', 
  variant = 'dark', 
  showTagline = false 
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  const currentLogo = variant === 'light' ? logoBlanco : logoImg;

  return (
    <div className="flex items-center space-x-2">
      <img 
        src={currentLogo} 
        alt="Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`} 
      />
      
      {showTagline && (
        <div className="hidden sm:flex flex-col text-left leading-tight ml-2">
          <span className={`text-[13px] font-black tracking-wide ${variant === 'dark' ? 'text-slate-900' : 'text-white'}`}>
            Performer
          </span>
          <span className={`text-[10px] font-bold tracking-widest uppercase ${variant === 'dark' ? 'text-[#310052]' : 'text-slate-300'}`}>
            Logistics
          </span>
        </div>
      )}
    </div>
  );
};