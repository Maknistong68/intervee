import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

// Breakpoint for split-screen layout (tablet/DeX)
const LARGE_SCREEN_BREAKPOINT = 800;

export interface ResponsiveLayout {
  width: number;
  height: number;
  isLargeScreen: boolean;
  isLandscape: boolean;
  // Column widths for split layout
  leftColumnWidth: string;
  rightColumnWidth: string;
}

/**
 * Hook for detecting screen dimensions and providing responsive layout values.
 * Enables split-screen layout on tablet/Samsung DeX devices.
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const handleChange = ({ window }: { window: ScaledSize }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    };

    const subscription = Dimensions.addEventListener('change', handleChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const { width, height } = dimensions;
  const isLargeScreen = width >= LARGE_SCREEN_BREAKPOINT;
  const isLandscape = width > height;

  return {
    width,
    height,
    isLargeScreen,
    isLandscape,
    // 60% left, 40% right for split layout
    leftColumnWidth: '60%',
    rightColumnWidth: '40%',
  };
}

export default useResponsiveLayout;
