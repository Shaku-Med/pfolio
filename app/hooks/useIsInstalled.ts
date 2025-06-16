'use client';

import { useEffect, useState } from 'react';

// Extend Navigator interface to include standalone property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export const useIsInstalled = () => {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Check if running in a PWA
    const isPWA = window.navigator.standalone || isStandalone;
    
    setIsInstalled(isPWA);
  }, []);

  return isInstalled;
}; 