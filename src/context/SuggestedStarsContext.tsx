import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Star } from '../types';

/**
 * SuggestedStarsContext - Global state for highlighted stars in 3D view
 * 
 * Purpose: Provides a way for pages to communicate which stars should be
 * highlighted in the 3D visualization without prop drilling.
 * 
 * Features:
 * - Global state management for suggested/highlighted stars
 * - Context provider for easy consumption across components
 * - Type-safe interface with TypeScript
 * 
 * Confidence Rating: High - Standard React Context pattern
 */

interface SuggestedStarsContextType {
  suggestedStars: Star[];
  setSuggestedStars: (stars: Star[]) => void;
  clearSuggestedStars: () => void;
}

const SuggestedStarsContext = createContext<SuggestedStarsContextType | undefined>(undefined);

interface SuggestedStarsProviderProps {
  children: ReactNode;
}

export function SuggestedStarsProvider({ children }: SuggestedStarsProviderProps) {
  const [suggestedStars, setSuggestedStars] = useState<Star[]>([]);

  const clearSuggestedStars = () => {
    console.log('SuggestedStarsContext: Clearing suggested stars');
    setSuggestedStars([]);
  };

  const handleSetSuggestedStars = (stars: Star[]) => {
    console.log(`SuggestedStarsContext: Setting ${stars.length} suggested stars`);
    setSuggestedStars(stars);
  };

  return (
    <SuggestedStarsContext.Provider 
      value={{ 
        suggestedStars, 
        setSuggestedStars: handleSetSuggestedStars, 
        clearSuggestedStars 
      }}
    >
      {children}
    </SuggestedStarsContext.Provider>
  );
}

export function useSuggestedStars() {
  const context = useContext(SuggestedStarsContext);
  if (context === undefined) {
    throw new Error('useSuggestedStars must be used within a SuggestedStarsProvider');
  }
  return context;
}