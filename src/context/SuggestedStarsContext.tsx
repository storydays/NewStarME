import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Star } from '../types';

/**
 * SuggestedStarsContext - Enhanced with Deep Comparison to Prevent Infinite Loops
 * 
 * Purpose: Provides a way for pages to communicate which stars should be
 * highlighted in the 3D visualization and trigger camera focus animations.
 * 
 * Key Enhancement: Added deep comparison logic to prevent infinite re-render loops
 * when the same star data is set repeatedly with different array references.
 * 
 * Features:
 * - Global state management for suggested/highlighted stars
 * - Camera focus trigger for smooth star-to-star navigation
 * - Deep comparison to prevent unnecessary updates
 * - Context provider for easy consumption across components
 * - Type-safe interface with TypeScript
 * 
 * Confidence Rating: High - Enhanced context with deep comparison to fix infinite loops
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

/**
 * Deep comparison function for Star arrays
 * Compares essential properties to determine if arrays are functionally equivalent
 */
function areStarsDeepEqual(stars1: Star[], stars2: Star[]): boolean {
  if (stars1.length !== stars2.length) {
    return false;
  }

  for (let i = 0; i < stars1.length; i++) {
    const star1 = stars1[i];
    const star2 = stars2[i];

    // Compare essential star properties
    if (
      star1.id !== star2.id ||
      star1.scientific_name !== star2.scientific_name ||
      star1.emotion_id !== star2.emotion_id ||
      star1.visual_data.size !== star2.visual_data.size ||
      star1.visual_data.color !== star2.visual_data.color ||
      star1.visual_data.brightness !== star2.visual_data.brightness
    ) {
      return false;
    }

    // Compare gradientEnd if it exists (added by StarSelection)
    const gradientEnd1 = (star1.visual_data as any).gradientEnd;
    const gradientEnd2 = (star2.visual_data as any).gradientEnd;
    if (gradientEnd1 !== gradientEnd2) {
      return false;
    }
  }

  return true;
}

export function SuggestedStarsProvider({ children }: SuggestedStarsProviderProps) {
  const [suggestedStars, setSuggestedStarsState] = useState<Star[]>([]);
  const [focusedStarIndex, setFocusedStarIndex] = useState<number | null>(null);

  const clearSuggestedStars = useCallback(() => {
    console.log('SuggestedStarsContext: Clearing suggested stars');
    setSuggestedStarsState([]);
    setFocusedStarIndex(null);
  }, []);

  const handleSetSuggestedStars = useCallback((stars: Star[]) => {
    console.log(`SuggestedStarsContext: Attempting to set ${stars.length} suggested stars`);
    
    // CRITICAL FIX: Deep comparison to prevent infinite loops
    if (areStarsDeepEqual(suggestedStars, stars)) {
      console.log('SuggestedStarsContext: Stars are deeply equal, skipping update to prevent infinite loop');
      return;
    }
    
    console.log('SuggestedStarsContext: Stars are different, updating state');
    setSuggestedStarsState(stars);
    
    // REMOVED: Auto-focus first star when stars are set
    // This was causing the navigation to reset to index 0 on every update
    // The initial focus is now managed by useStarNavigation hook
  }, [suggestedStars]);

  const triggerStarFocus = useCallback((star: Star, index: number) => {
    console.log(`SuggestedStarsContext: Triggering focus on star ${star.scientific_name} at index ${index}`);
    setFocusedStarIndex(index);
  }, []);

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