import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

interface AnimationContextProps {
  isReducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const AnimationContext = createContext<AnimationContextProps | undefined>(undefined);

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    // Check if the user has set a preference for reduced motion
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('reducedMotion');
      if (savedPreference !== null) {
        return savedPreference === 'true';
      }
      
      // Check for system preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      return mediaQuery.matches;
    }
    return false;
  });

  const toggleReducedMotion = () => {
    const newValue = !isReducedMotion;
    setIsReducedMotion(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reducedMotion', String(newValue));
    }
  };

  return (
    <AnimationContext.Provider value={{ isReducedMotion, toggleReducedMotion }}>
      <MotionConfig reducedMotion={isReducedMotion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </AnimationContext.Provider>
  );
};

export const useAnimation = (): AnimationContextProps => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

export default AnimationProvider; 