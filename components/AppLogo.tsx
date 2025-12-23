
import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { AppSettings } from '../types';

interface AppLogoProps {
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className = "h-8" }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const s = await dataService.getAppSettings();
      setSettings(s);
    };

    fetchSettings();

    const handleUpdate = (e: any) => {
      setSettings(e.detail);
    };

    window.addEventListener('eagle_settings_updated', handleUpdate);
    return () => window.removeEventListener('eagle_settings_updated', handleUpdate);
  }, []);

  if (!settings) return <div className={`${className} bg-white/5 animate-pulse rounded`}></div>;

  return (
    <img 
      src={settings.logoUrl} 
      alt="Eagle Hub" 
      className={`${className} object-contain transition-opacity duration-300`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=200';
      }}
    />
  );
};

export default AppLogo;
