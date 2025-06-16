'use client'
import { useEffect, useState } from 'react';

interface MobileInfo {
  status: boolean;
  width: number;
  height: number;
}

export const useMobileDetector = (showInfo?: boolean): boolean | MobileInfo => {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    status: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      setMobileInfo({
        status: isMobile,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return showInfo ? mobileInfo : mobileInfo.status;
}; 