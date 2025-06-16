'use client';

import { useEffect } from 'react';
import { useIsInstalled } from '../hooks/useIsInstalled';

const ViewportManager = () => {
  const isInstalled = useIsInstalled();

  useEffect(() => {
    const updateViewport = () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) return;

      const isLandscape = window.screen.orientation?.type?.includes('landscape') || 
                         window.matchMedia('(orientation: landscape)').matches;
      
      if (!isInstalled || (isInstalled && isLandscape)) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover');
      } else {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
      }
    };

    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', updateViewport);
    }
    
    window.addEventListener('orientationchange', updateViewport);
    window.addEventListener('resize', updateViewport);

    updateViewport();

    return () => {
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', updateViewport);
      }
      window.removeEventListener('orientationchange', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, [isInstalled]);

  return null;
};

export default ViewportManager; 