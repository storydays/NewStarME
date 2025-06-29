import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SuggestedStar } from '../types';

/**
 * SuggestedStarsContext - FIXED: State Update Issue
 * 
 * Purpose: Manages AI-generated suggested stars with proper state propagation.
 * 
 * CRITICAL FIX:
 * - Fixed state update not propagating to App component
 * - Simplified comparison logic to prevent false equality checks
 * - Added explicit state update confirmation logs
 * - Removed complex caching that was preventing updates
 * 
 * Confidence Rating: High - Targeted fix for state propagation
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

export function SuggestedStarsProvider({ children }: SuggestedStarsProviderProps) {
  const [suggestedStars, setSuggestedStarsState] = useState<SuggestedStar[]>([]);

  const clearSuggestedStars = useCallback(() => {
    console.log('SuggestedStarsContext: Clearing suggested stars');
    setSuggestedStarsState([]);
  }, []);

  // FIXED: Simplified state setter without complex comparison
  const handleSetSuggestedStars = useCallback((stars: SuggestedStar[]) => {
    console.log(`SuggestedStarsContext: Setting ${stars.length} suggested stars`);
    console.log('SuggestedStarsContext: Stars being set:', stars.map(s => ({ id: s.id, catalogId: s.starCatalogId, name: s.name })));
    
    // CRITICAL FIX: Always update state - let React handle optimization
    setSuggestedStarsState(stars);
    
    // CONFIRMATION: Log after state update call
    console.log('SuggestedStarsContext: setSuggestedStarsState called - state should update now');
  }, []);

  const getSuggestedStarByCatalogId = useCallback((catalogId: string): SuggestedStar | null => {
    return suggestedStars.find(star => star.starCatalogId === catalogId) || null;
  }, [suggestedStars]);

  const isStarSuggested = useCallback((catalogId: string): boolean => {
    return suggestedStars.some(star => star.starCatalogId === catalogId);
  }, [suggestedStars]);

  // FIXED: Simplified fetch function without internal caching
  const fetchSuggestionsForEmotion = useCallback(async (emotion: string): Promise<void> => {
    try {
      console.log(`SuggestedStarsContext: Starting fetch for emotion: ${emotion}`);
      
      // Import StarService dynamically to avoid circular dependencies
      const { StarService } = await import('../services/starService');
      const suggestions = await StarService.getSuggestedStarsForEmotion(emotion);
      
      console.log(`SuggestedStarsContext: StarService returned ${suggestions.length} suggestions`);
      console.log('SuggestedStarsContext: Suggestions received:', suggestions.map(s => ({ id: s.id, catalogId: s.starCatalogId, name: s.name })));
      
      // CRITICAL FIX: Direct state update without comparison
      console.log('SuggestedStarsContext: About to call handleSetSuggestedStars');
      handleSetSuggestedStars(suggestions);
      console.log('SuggestedStarsContext: handleSetSuggestedStars completed');
      
    } catch (error) {
      console.error('SuggestedStarsContext: Error fetching suggestions:', error);
      // Clear suggestions on error
      handleSetSuggestedStars([]);
    }
  }, [handleSetSuggestedStars]);

  // DEBUGGING: Log current state whenever it changes
  React.useEffect(() => {
    console.log('SuggestedStarsContext: State updated - suggestedStars length:', suggestedStars.length);
    if (suggestedStars.length > 0) {
      console.log('SuggestedStarsContext: Current suggested stars:', suggestedStars.map(s => ({ id: s.id, catalogId: s.starCatalogId, name: s.name })));
    }
  }, [suggestedStars]);

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