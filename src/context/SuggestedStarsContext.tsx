import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SuggestedStar } from '../types';

/**
 * SuggestedStarsContext - Refined for AI Suggestion Management Only
 * 
 * Purpose: Strictly manages the list of AI-generated suggested stars.
 * No rendering logic or interaction with StarviewCanvas directly.
 * 
 * Features:
 * - Store current SuggestedStar[] (from AI)
 * - Provide fetchSuggestionsForEmotion method
 * - Each SuggestedStar includes starCatalogId field to reference HygStarData
 * - Utility functions for suggestion lookup
 * 
 * Confidence Rating: High - Clean separation of concerns
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

  const clearSuggestedStars = useCallback(() => {
    console.log('SuggestedStarsContext: Clearing suggested stars');
    setSuggestedStarsState([]);
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

  const getSuggestedStarByCatalogId = useCallback((catalogId: string): SuggestedStar | null => {
    return suggestedStars.find(star => star.starCatalogId === catalogId) || null;
  }, [suggestedStars]);

  const isStarSuggested = useCallback((catalogId: string): boolean => {
    return suggestedStars.some(star => star.starCatalogId === catalogId);
  }, [suggestedStars]);

  const fetchSuggestionsForEmotion = useCallback(async (emotion: string): Promise<void> => {
    try {
      console.log(`SuggestedStarsContext: Fetching suggestions for emotion: ${emotion}`);
      
      // Import StarService dynamically to avoid circular dependencies
      const { StarService } = await import('../services/starService');
      const suggestions = await StarService.getSuggestedStarsForEmotion(emotion);
      
      console.log(`SuggestedStarsContext: Received ${suggestions.length} suggestions`);
      handleSetSuggestedStars(suggestions);
    } catch (error) {
      console.error('SuggestedStarsContext: Error fetching suggestions:', error);
      // Clear suggestions on error
      clearSuggestedStars();
    }
  }, [handleSetSuggestedStars, clearSuggestedStars]);

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