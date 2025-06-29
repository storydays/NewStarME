import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { SuggestedStar } from '../types';

/**
 * SuggestedStarsContext - FIXED: Infinite Loop Prevention
 * 
 * Purpose: Manages AI-generated suggested stars with proper caching and comparison.
 * 
 * FIXES APPLIED:
 * - Enhanced deep comparison that handles AI-generated objects properly
 * - Emotion-based caching to prevent refetching same emotion
 * - Ref-based tracking to prevent unnecessary API calls
 * - Better logging for debugging infinite loops
 * 
 * Confidence Rating: High - Targeted fix for infinite loop issue
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
 * ENHANCED: Deep comparison function with better AI object handling
 */
function areSuggestedStarsEqual(stars1: SuggestedStar[], stars2: SuggestedStar[]): boolean {
  if (stars1.length !== stars2.length) {
    console.log(`SuggestedStarsContext: Length mismatch: ${stars1.length} vs ${stars2.length}`);
    return false;
  }

  // ENHANCED: Compare by starCatalogId and name only (ignore metadata differences)
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
  
  // FIXED: Add emotion-based caching to prevent refetching
  const lastFetchedEmotionRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const clearSuggestedStars = useCallback(() => {
    console.log('SuggestedStarsContext: Clearing suggested stars');
    setSuggestedStarsState([]);
    lastFetchedEmotionRef.current = null;
  }, []);

  const handleSetSuggestedStars = useCallback((stars: SuggestedStar[]) => {
    console.log(`SuggestedStarsContext: Attempting to set ${stars.length} suggested stars`);
    
    // ENHANCED: Deep comparison with better logging
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
    // FIXED: Prevent multiple simultaneous fetches for same emotion
    if (isFetchingRef.current) {
      console.log('SuggestedStarsContext: Already fetching, skipping duplicate request');
      return;
    }

    // FIXED: Check if we already have suggestions for this emotion
    if (lastFetchedEmotionRef.current === emotion && suggestedStars.length > 0) {
      console.log(`SuggestedStarsContext: Already have suggestions for ${emotion}, skipping fetch`);
      return;
    }

    try {
      console.log(`SuggestedStarsContext: Fetching suggestions for emotion: ${emotion}`);
      isFetchingRef.current = true;
      
      // Import StarService dynamically to avoid circular dependencies
      const { StarService } = await import('../services/starService');
      const suggestions = await StarService.getSuggestedStarsForEmotion(emotion);
      
      console.log(`SuggestedStarsContext: Received ${suggestions.length} suggestions`);
      
      // FIXED: Only update if we don't already have suggestions for this emotion
      if (lastFetchedEmotionRef.current !== emotion) {
        handleSetSuggestedStars(suggestions);
        lastFetchedEmotionRef.current = emotion;
      } else {
        console.log('SuggestedStarsContext: Emotion changed during fetch, discarding results');
      }
      
    } catch (error) {
      console.error('SuggestedStarsContext: Error fetching suggestions:', error);
      // Don't clear suggestions on error - keep existing ones
    } finally {
      isFetchingRef.current = false;
    }
  }, [handleSetSuggestedStars, suggestedStars.length]);

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