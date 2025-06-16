'use client';

import { useEffect, useState } from 'react';
import { useIsInstalled } from './useIsInstalled';
import { useMobileDetector } from './useMobileDetector';
import { isMobile as isMobileDevice } from 'react-device-detect';

export const useDeviceStatus = () => {
  const isInstalled = useIsInstalled();
  const isMobileFromHook = useMobileDetector();
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    // Check orientation
    const checkOrientation = () => {
      const isPortraitMode = window.matchMedia('(orientation: portrait)').matches;
      setIsPortrait(isPortraitMode);
    };

    // Initial check
    checkOrientation();

    // Add event listeners for orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Combine multiple mobile detection methods for better accuracy
  const isMobile = isMobileFromHook && isMobileDevice;

  // Create a save object that contains all conditions
  const save = {
    isInstalled,
    isMobile,
    isPortrait,
    isMobileInstalledPortrait: isInstalled && isMobile && isPortrait
  };

  return {
    ...save,
    save: Object.values(save).every(Boolean) // Returns true only if all conditions are true
  };
}; 