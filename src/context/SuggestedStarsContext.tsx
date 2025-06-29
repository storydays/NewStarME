import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SuggestedStar } from '../types';

/**
 * SuggestedStarsContext - SIMPLIFIED: Removed Internal Caching Logic
 * 
 * Purpose: Manages AI-generated suggested stars with simplified state management.
 * 
 * FIXES APPLIED:
 * - Removed internal caching logic (isFetchingRef, lastFetchedEmotionRef)
 * - Simplified fetchSuggestionsForEmotion to always attempt fetch
 * - Added confirmation log before setSuggestedStarsState call
 * - Relies on StarSelection component to manage when to invoke fetch
 * 
 * Confidence Rating: High - Simplified approach with clear logging
 */

interface SuggestedStarsContextType {
  suggestedStars: SuggestedStar[];
  setSuggestedStars: (stars: SuggestedStar[]) => void;
  clearSuggestedStars: () => void;
  getSuggestedStarByCatalogId: (catalogId: string) => SuggestedStar | null;
  isStarSuggested: (catalogId: string) => boolean;
  fetchSuggestionsForEmotion: (emotion: string) => Promise<void>;
}

const SuggestedStarsContext = createContext<SuggestedStarsContextType | undefined>(undefined);

interface SuggestedStarsProviderProps {
  children: ReactNode;
}

/**
 * Enhanced deep comparison function with better AI object handling
 */
function areSuggestedStarsEqual(stars1: SuggestedStar[], stars2: SuggestedStar[]): boolean {
  if (stars1.length !== stars2.length) {
    console.log(`SuggestedStarsContext: Length mismatch: ${stars1.length} vs ${stars2.length}`);
    return false;
  }

  // Compare by starCatalogId and name only (ignore metadata differences)
  // This prevents AI-generated objects with different timestamps from being considered different
  for (let i = 0; i < stars1.length; i++) {
    const star1 = stars1[i];
    const star2 = stars2[i];

    if (
      star1.starCatalogId !== star2.starCatalogId ||
      star1.name !== star2.name
    ) {
      console.log(`SuggestedStarsContext: Star difference at index ${i}:`, {
        star1: { id: star1.starCatalogId, name: star1.name },
        star2: { id: star2.starCatalogId, name: star2.name }
      });
      return false;
    }
  }

  console.log('SuggestedStarsContext: Stars are equal based on catalog IDs and names');
  return true;
}

export function SuggestedStarsProvider({ children }: SuggestedStarsProviderProps) {
  const [suggestedStars, setSuggestedStarsState] = useState<SuggestedStar[]>([]);

  const clearSuggestedStars = useCallback(() => {
    console.log('SuggestedStarsContext: Clearing suggested stars');
    setSuggestedStarsState([]);
  }, []);

  const handleSetSuggestedStars = useCallback((stars: SuggestedStar[]) => {
    console.log(`SuggestedStarsContext: Attempting to set ${stars.length} suggested stars`);
    
    // Enhanced comparison with better logging
    if (areSuggestedStarsEqual(suggestedStars, stars)) {
      console.log('SuggestedStarsContext: Suggested stars are equal, skipping update');
      return;
    }
    
    // CONFIRMATION LOG: This log will explicitly confirm if setSuggestedStarsState is called
    console.log('SuggestedStarsContext: Stars are different, calling setSuggestedStarsState with:', stars);
    setSuggestedStarsState(stars);
    console.log('SuggestedStarsContext: setSuggestedStarsState called successfully');
  }, [suggestedStars]);

  const getSuggestedStarByCatalogId = useCallback((catalogId: string): SuggestedStar | null => {
    return suggestedStars.find(star => star.starCatalogId === catalogId) || null;
  }, [suggestedStars]);

  const isStarSuggested = useCallback((catalogId: string): boolean => {
    return suggestedStars.some(star => star.starCatalogId === catalogId);
  }, [suggestedStars]);

  // SIMPLIFIED: Removed internal caching logic - always attempt to fetch
  const fetchSuggestionsForEmotion = useCallback(async (emotion: string): Promise<void> => {
    try {
      console.log(`SuggestedStarsContext: Fetching suggestions for emotion: ${emotion}`);
      
      // Import StarService dynamically to avoid circular dependencies
      const { StarService } = await import('../services/starService');
      const suggestions = await StarService.getSuggestedStarsForEmotion(emotion);
      
      console.log(`SuggestedStarsContext: Received ${suggestions.length} suggestions from StarService`);
      
      // Always call handleSetSuggestedStars - let it decide whether to update
      handleSetSuggestedStars(suggestions);
      
    } catch (error) {
      console.error('SuggestedStarsContext: Error fetching suggestions:', error);
      // Don't clear suggestions on error - keep existing ones
    }
  }, [handleSetSuggestedStars]);

  return (
    <SuggestedStarsContext.Provider 
      value={{ 
        suggestedStars, 
        setSuggestedStars: handleSetSuggestedStars, 
        clearSuggestedStars,
        getSuggestedStarByCatalogId,
        isStarSuggested,
        fetchSuggestionsForEmotion
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