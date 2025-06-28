import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HygStarData, SuggestedStar } from '../types';

/**
 * SuggestedStarsContext - Enhanced with HygStarData Integration
 * 
 * Purpose: Manages suggested stars from AI and their mapping to the central StarsCatalog.
 * Provides global state for highlighted stars and camera focus control.
 * 
 * Key Features:
 * - Manages SuggestedStar objects with starCatalogId links
 * - Provides selectedStar state (always HygStarData from catalog)
 * - Camera focus control for 3D visualization
 * - Deep comparison to prevent infinite loops
 * 
 * Confidence Rating: High - Clean integration with new architecture
 */

interface SuggestedStarsContextType {
  // Suggested stars from AI (volatile)
  suggestedStars: SuggestedStar[];
  setSuggestedStars: (stars: SuggestedStar[]) => void;
  clearSuggestedStars: () => void;
  
  // Selected star from catalog (immutable source)
  selectedStar: HygStarData | null;
  setSelectedStar: (star: HygStarData | null) => void;
  
  // Camera focus control
  focusedStarIndex: number | null;
  setFocusedStarIndex: (index: number | null) => void;
  triggerStarFocus: (star: HygStarData, index: number) => void;
  
  // Utility functions
  getSuggestedStarByCatalogId: (catalogId: string) => SuggestedStar | null;
  isStarSuggested: (catalogId: string) => boolean;
}

const SuggestedStarsContext = createContext<SuggestedStarsContextType | undefined>(undefined);

interface SuggestedStarsProviderProps {
  children: ReactNode;
}

/**
 * Deep comparison function for SuggestedStar arrays
 */
function areSuggestedStarsEqual(stars1: SuggestedStar[], stars2: SuggestedStar[]): boolean {
  if (stars1.length !== stars2.length) {
    return false;
  }

  for (let i = 0; i < stars1.length; i++) {
    const star1 = stars1[i];
    const star2 = stars2[i];

    if (
      star1.id !== star2.id ||
      star1.name !== star2.name ||
      star1.starCatalogId !== star2.starCatalogId ||
      JSON.stringify(star1.metadata) !== JSON.stringify(star2.metadata)
    ) {
      return false;
    }
  }

  return true;
}

export function SuggestedStarsProvider({ children }: SuggestedStarsProviderProps) {
  const [suggestedStars, setSuggestedStarsState] = useState<SuggestedStar[]>([]);
  const [selectedStar, setSelectedStar] = useState<HygStarData | null>(null);
  const [focusedStarIndex, setFocusedStarIndex] = useState<number | null>(null);

  const clearSuggestedStars = useCallback(() => {
    console.log('SuggestedStarsContext: Clearing suggested stars');
    setSuggestedStarsState([]);
    setFocusedStarIndex(null);
  }, []);

  const handleSetSuggestedStars = useCallback((stars: SuggestedStar[]) => {
    console.log(`SuggestedStarsContext: Attempting to set ${stars.length} suggested stars`);
    
    // Deep comparison to prevent infinite loops
    if (areSuggestedStarsEqual(suggestedStars, stars)) {
      console.log('SuggestedStarsContext: Suggested stars are equal, skipping update');
      return;
    }
    
    console.log('SuggestedStarsContext: Suggested stars are different, updating state');
    setSuggestedStarsState(stars);
  }, [suggestedStars]);

  const triggerStarFocus = useCallback((star: HygStarData, index: number) => {
    console.log(`SuggestedStarsContext: Triggering focus on star ${star.hyg.proper || star.hyg.id} at index ${index}`);
    setSelectedStar(star);
    setFocusedStarIndex(index);
  }, []);

  const getSuggestedStarByCatalogId = useCallback((catalogId: string): SuggestedStar | null => {
    return suggestedStars.find(star => star.starCatalogId === catalogId) || null;
  }, [suggestedStars]);

  const isStarSuggested = useCallback((catalogId: string): boolean => {
    return suggestedStars.some(star => star.starCatalogId === catalogId);
  }, [suggestedStars]);

  return (
    <SuggestedStarsContext.Provider 
      value={{ 
        suggestedStars, 
        setSuggestedStars: handleSetSuggestedStars, 
        clearSuggestedStars,
        selectedStar,
        setSelectedStar,
        focusedStarIndex,
        setFocusedStarIndex,
        triggerStarFocus,
        getSuggestedStarByCatalogId,
        isStarSuggested
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