import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SuggestedStar } from '../types';

/**
 * SuggestedStarsContext - Enhanced with Loading State and Centralized Management
 * 
 * Purpose: Manages AI-generated suggested stars with loading state tracking
 * and centralized fetch logic for use by App component.
 * 
 * ENHANCED: Added isLoading state management as recommended in the plan
 * 
 * Features:
 * - Loading state tracking for UI feedback
 * - Centralized fetch logic with error handling
 * - Direct catalog reference support via starCatalogRef
 * - Comprehensive logging for debugging
 * 
 * Confidence Rating: High - Enhanced with loading state management
 */

interface SuggestedStarsContextType {
  suggestedStars: SuggestedStar[];
  isLoading: boolean;
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
  console.log('=== SuggestedStarsProvider: Component initializing ===');
  
  const [suggestedStars, setSuggestedStarsState] = useState<SuggestedStar[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log('SuggestedStarsProvider: Initial state set, suggestedStars.length:', suggestedStars.length);

  const clearSuggestedStars = useCallback(() => {
    const timestamp = Date.now();
    console.log(`=== SuggestedStarsContext: clearSuggestedStars called at ${timestamp} ===`);
    console.log('SuggestedStarsContext: clearSuggestedStars - Current state length:', suggestedStars.length);
    
    if (suggestedStars.length > 0) {
      console.log('SuggestedStarsContext: clearSuggestedStars - Clearing these star names:', 
        suggestedStars.map(s => s.name || 'Unnamed').join(', '));
    }
    
    setSuggestedStarsState([]);
    setIsLoading(false);
    
    console.log('SuggestedStarsContext: clearSuggestedStars - setSuggestedStarsState([]) called');
    console.log(`=== SuggestedStarsContext: clearSuggestedStars completed at ${Date.now()} ===`);
  }, [suggestedStars.length]);

  const handleSetSuggestedStars = useCallback((stars: SuggestedStar[]) => {
    const timestamp = Date.now();
    console.log(`=== SuggestedStarsContext: handleSetSuggestedStars called at ${timestamp} ===`);
    console.log('SuggestedStarsContext: handleSetSuggestedStars - Input stars.length:', stars.length);
    console.log('SuggestedStarsContext: handleSetSuggestedStars - Current state length:', suggestedStars.length);
    
    if (stars.length > 0) {
      console.log('SuggestedStarsContext: handleSetSuggestedStars - NEW STAR NAMES being set:', 
        stars.map(s => s.name || 'Unnamed').join(', '));
      console.log('SuggestedStarsContext: handleSetSuggestedStars - NEW STAR CATALOG IDs being set:', 
        stars.map(s => s.starCatalogRef.hyg.id.toString()).join(', '));
    }
    
    setSuggestedStarsState(stars);
    
    console.log('SuggestedStarsContext: handleSetSuggestedStars - setSuggestedStarsState CALLED');
    console.log(`=== SuggestedStarsContext: handleSetSuggestedStars completed at ${Date.now()} ===`);
  }, [suggestedStars.length]);

  const getSuggestedStarByCatalogId = useCallback((catalogId: string): SuggestedStar | null => {
    console.log('SuggestedStarsContext: getSuggestedStarByCatalogId called with catalogId:', catalogId);
    console.log('SuggestedStarsContext: getSuggestedStarByCatalogId - Current suggestedStars.length:', suggestedStars.length);
    
    const result = suggestedStars.find(star => star.starCatalogRef.hyg.id.toString() === catalogId) || null;
    
    console.log('SuggestedStarsContext: getSuggestedStarByCatalogId - Result:', result ? `${result.name} (${result.id})` : 'null');
    return result;
  }, [suggestedStars]);

  const isStarSuggested = useCallback((catalogId: string): boolean => {
    console.log('SuggestedStarsContext: isStarSuggested called with catalogId:', catalogId);
    console.log('SuggestedStarsContext: isStarSuggested - Current suggestedStars.length:', suggestedStars.length);
    
    const result = suggestedStars.some(star => star.starCatalogRef.hyg.id.toString() === catalogId);
    
    console.log('SuggestedStarsContext: isStarSuggested - Result:', result);
    if (result) {
      const matchedStar = suggestedStars.find(star => star.starCatalogRef.hyg.id.toString() === catalogId);
      console.log('SuggestedStarsContext: isStarSuggested - Matched star name:', matchedStar?.name || 'Unnamed');
    }
    return result;
  }, [suggestedStars]);

  // ENHANCED: Comprehensive fetch function with loading state management
  const fetchSuggestionsForEmotion = useCallback(async (emotion: string): Promise<void> => {
    const functionStartTime = Date.now();
    console.log(`=== SuggestedStarsContext: fetchSuggestionsForEmotion START at ${functionStartTime} ===`);
    console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Input emotion:', emotion);
    console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Current state length:', suggestedStars.length);

    try {
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Setting isLoading to true');
      setIsLoading(true);
      
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Entering try block');
      
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - About to import StarService');
      const importStartTime = Date.now();
      
      const { StarService } = await import('../services/starService');
      
      const importEndTime = Date.now();
      console.log(`SuggestedStarsContext: fetchSuggestionsForEmotion - StarService imported in ${importEndTime - importStartTime}ms`);
      
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - About to call StarService.getSuggestedStarsForEmotion');
      const serviceCallStartTime = Date.now();
      
      const suggestions = await StarService.getSuggestedStarsForEmotion(emotion);
      
      const serviceCallEndTime = Date.now();
      console.log(`SuggestedStarsContext: fetchSuggestionsForEmotion - StarService call completed in ${serviceCallEndTime - serviceCallStartTime}ms`);
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - StarService returned suggestions.length:', suggestions.length);
      
      if (suggestions.length > 0) {
        console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - STAR NAMES retrieved from StarService:', 
          suggestions.map(s => s.name || 'Unnamed').join(', '));
        console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - STAR CATALOG IDs retrieved from StarService:', 
          suggestions.map(s => s.starCatalogRef.hyg.id.toString()).join(', '));
        console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - STAR SOURCES retrieved from StarService:', 
          suggestions.map(s => s.metadata?.source || 'unknown').join(', '));
      } else {
        console.warn('SuggestedStarsContext: fetchSuggestionsForEmotion - NO STAR NAMES retrieved from StarService!');
      }
      
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - About to call handleSetSuggestedStars');
      const stateUpdateStartTime = Date.now();
      handleSetSuggestedStars(suggestions);
      const stateUpdateEndTime = Date.now();
      
      console.log(`SuggestedStarsContext: fetchSuggestionsForEmotion - handleSetSuggestedStars completed in ${stateUpdateEndTime - stateUpdateStartTime}ms`);
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - FINAL STAR NAMES that should appear in UI:', 
        suggestions.map(s => s.name || 'Unnamed').join(', '));
      
      const functionEndTime = Date.now();
      console.log(`=== SuggestedStarsContext: fetchSuggestionsForEmotion SUCCESS in ${functionEndTime - functionStartTime}ms ===`);
      
    } catch (error) {
      const errorTime = Date.now();
      console.error(`=== SuggestedStarsContext: fetchSuggestionsForEmotion ERROR at ${errorTime} ===`);
      console.error('SuggestedStarsContext: fetchSuggestionsForEmotion - Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: typeof error,
        emotion: emotion,
        timestamp: errorTime
      });
      
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Clearing suggestions due to error');
      handleSetSuggestedStars([]);
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Error handling completed');
      
      throw error;
    } finally {
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Setting isLoading to false');
      setIsLoading(false);
    }
  }, [handleSetSuggestedStars, suggestedStars.length]);

  // State change monitoring
  React.useEffect(() => {
    const timestamp = Date.now();
    console.log(`=== SuggestedStarsContext: State change detected at ${timestamp} ===`);
    console.log('SuggestedStarsContext: State updated - suggestedStars.length:', suggestedStars.length);
    console.log('SuggestedStarsContext: State updated - isLoading:', isLoading);
    
    if (suggestedStars.length > 0) {
      console.log('SuggestedStarsContext: State updated - CURRENT STAR NAMES in state:', 
        suggestedStars.map(s => s.name || 'Unnamed').join(', '));
    } else {
      console.log('SuggestedStarsContext: State updated - NO STAR NAMES in state (empty array)');
    }
  }, [suggestedStars, isLoading]);

  console.log('SuggestedStarsProvider: About to render Provider with context value');
  console.log('SuggestedStarsProvider: Context value suggestedStars.length:', suggestedStars.length);
  console.log('SuggestedStarsProvider: Context value isLoading:', isLoading);

  return (
    <SuggestedStarsContext.Provider 
      value={{ 
        suggestedStars, 
        isLoading,
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
  console.log('useSuggestedStars: Hook called');
  
  const context = useContext(SuggestedStarsContext);
  if (context === undefined) {
    console.error('useSuggestedStars: Hook called outside of SuggestedStarsProvider');
    throw new Error('useSuggestedStars must be used within a SuggestedStarsProvider');
  }
  
  console.log('useSuggestedStars: Returning context with suggestedStars.length:', context.suggestedStars.length);
  console.log('useSuggestedStars: Returning context with isLoading:', context.isLoading);
  if (context.suggestedStars.length > 0) {
    console.log('useSuggestedStars: Returning context with STAR NAMES:', 
      context.suggestedStars.map(s => s.name || 'Unnamed').join(', '));
  }
  return context;
}