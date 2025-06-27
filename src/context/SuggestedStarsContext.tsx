import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Star } from '../types';

/**
 * SuggestedStarsContext - Enhanced with camera focus support
 * 
 * Purpose: Provides a way for pages to communicate which stars should be
 * highlighted in the 3D visualization and trigger camera focus animations.
 * 
 * Features:
 * - Global state management for suggested/highlighted stars
 * - Camera focus trigger for smooth star-to-star navigation
 * - Context provider for easy consumption across components
 * - Type-safe interface with TypeScript
 * 
 * Confidence Rating: High - Enhanced context with camera integration
 */

interface SuggestedStarsContextType {
  suggestedStars: Star[];
  setSuggestedStars: (stars: Star[]) => void;
  clearSuggestedStars: () => void;
  focusedStarIndex: number | null;
  setFocusedStarIndex: (index: number | null) => void;
  triggerStarFocus: (star: Star, index: number) => void;
}

const SuggestedStarsContext = createContext<SuggestedStarsContextType | undefined>(undefined);

interface SuggestedStarsProviderProps {
  children: ReactNode;
}

export function SuggestedStarsProvider({ children }: SuggestedStarsProviderProps) {
  const [suggestedStars, setSuggestedStars] = useState<Star[]>([]);
  const [focusedStarIndex, setFocusedStarIndex] = useState<number | null>(null);

  const clearSuggestedStars = () => {
    console.log('SuggestedStarsContext: Clearing suggested stars');
    setSuggestedStars([]);
    setFocusedStarIndex(null);
  };

  const handleSetSuggestedStars = (stars: Star[]) => {
    console.log(`SuggestedStarsContext: Setting ${stars.length} suggested stars`);
    setSuggestedStars(stars);
    // Auto-focus first star when stars are set
    if (stars.length > 0) {
      setFocusedStarIndex(0);
    }
  };

  const triggerStarFocus = (star: Star, index: number) => {
    console.log(`SuggestedStarsContext: Triggering focus on star ${star.scientific_name} at index ${index}`);
    setFocusedStarIndex(index);
  };

  return (
    <SuggestedStarsContext.Provider 
      value={{ 
        suggestedStars, 
        setSuggestedStars: handleSetSuggestedStars, 
        clearSuggestedStars,
        focusedStarIndex,
        setFocusedStarIndex,
        triggerStarFocus
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