import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SuggestedStar } from '../types';

/**
 * SuggestedStarsContext - UPDATED: Enhanced with starCatalogRef Support
 * 
 * Purpose: Manages AI-generated suggested stars with detailed logging
 * to trace state updates and identify propagation issues.
 * 
 * UPDATED: All methods now use starCatalogRef.hyg.id for star identification
 * instead of starCatalogId string references.
 * 
 * ENHANCED LOGGING:
 * - Function entry/exit logging with timestamps
 * - State change monitoring with before/after values
 * - Promise resolution/rejection tracking
 * - Context provider lifecycle logging
 * - Detailed error reporting with stack traces
 * - STAR NAMES: Detailed logging of star names retrieved from AI/catalog
 * 
 * Confidence Rating: High - Enhanced with direct catalog reference support
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
  console.log('=== SuggestedStarsProvider: Component initializing ===');
  
  const [suggestedStars, setSuggestedStarsState] = useState<SuggestedStar[]>([]);

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
    
    console.log('SuggestedStarsContext: clearSuggestedStars - setSuggestedStarsState([]) called');
    console.log(`=== SuggestedStarsContext: clearSuggestedStars completed at ${Date.now()} ===`);
  }, [suggestedStars.length]);

  // ENHANCED: Comprehensive state setter with detailed logging including star names
  const handleSetSuggestedStars = useCallback((stars: SuggestedStar[]) => {
    const timestamp = Date.now();
    console.log(`=== SuggestedStarsContext: handleSetSuggestedStars called at ${timestamp} ===`);
    console.log('SuggestedStarsContext: handleSetSuggestedStars - Input stars.length:', stars.length);
    console.log('SuggestedStarsContext: handleSetSuggestedStars - Current state length:', suggestedStars.length);
    
    // ENHANCED: Log star names for debugging
    if (stars.length > 0) {
      console.log('SuggestedStarsContext: handleSetSuggestedStars - NEW STAR NAMES being set:', 
        stars.map(s => s.name || 'Unnamed').join(', '));
      console.log('SuggestedStarsContext: handleSetSuggestedStars - NEW STAR CATALOG IDs being set:', 
        stars.map(s => s.starCatalogRef.hyg.id.toString()).join(', '));
    }
    
    if (suggestedStars.length > 0) {
      console.log('SuggestedStarsContext: handleSetSuggestedStars - PREVIOUS STAR NAMES being replaced:', 
        suggestedStars.map(s => s.name || 'Unnamed').join(', '));
      console.log('SuggestedStarsContext: handleSetSuggestedStars - PREVIOUS STAR CATALOG IDs being replaced:', 
        suggestedStars.map(s => s.starCatalogRef.hyg.id.toString()).join(', '));
    }
    
    console.log('SuggestedStarsContext: handleSetSuggestedStars - Input stars details:', stars.map(s => ({ 
      id: s.id, 
      catalogId: s.starCatalogRef.hyg.id.toString(), 
      name: s.name,
      emotion: s.metadata?.emotion 
    })));
    
    // CRITICAL: Log the exact moment we call setState
    console.log('SuggestedStarsContext: handleSetSuggestedStars - ABOUT TO CALL setSuggestedStarsState');
    console.log('SuggestedStarsContext: handleSetSuggestedStars - setState will be called with:', {
      newLength: stars.length,
      currentLength: suggestedStars.length,
      timestamp: timestamp
    });
    
    setSuggestedStarsState(stars);
    
    console.log('SuggestedStarsContext: handleSetSuggestedStars - setSuggestedStarsState CALLED');
    console.log('SuggestedStarsContext: handleSetSuggestedStars - React should now schedule a re-render');
    console.log(`=== SuggestedStarsContext: handleSetSuggestedStars completed at ${Date.now()} ===`);
  }, [suggestedStars.length]);

  // UPDATED: Use starCatalogRef.hyg.id for comparison
  const getSuggestedStarByCatalogId = useCallback((catalogId: string): SuggestedStar | null => {
    console.log('SuggestedStarsContext: getSuggestedStarByCatalogId called with catalogId:', catalogId);
    console.log('SuggestedStarsContext: getSuggestedStarByCatalogId - Current suggestedStars.length:', suggestedStars.length);
    
    const result = suggestedStars.find(star => star.starCatalogRef.hyg.id.toString() === catalogId) || null;
    
    console.log('SuggestedStarsContext: getSuggestedStarByCatalogId - Result:', result ? `${result.name} (${result.id})` : 'null');
    return result;
  }, [suggestedStars]);

  // UPDATED: Use starCatalogRef.hyg.id for comparison
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

  // ENHANCED: Comprehensive fetch function with detailed logging including star names
  const fetchSuggestionsForEmotion = useCallback(async (emotion: string): Promise<void> => {
    const functionStartTime = Date.now();
    console.log(`=== SuggestedStarsContext: fetchSuggestionsForEmotion START at ${functionStartTime} ===`);
    console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Input emotion:', emotion);
    console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Current state length:', suggestedStars.length);

    try {
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Entering try block');
      
      // ENHANCED: Dynamic import with detailed logging
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - About to import StarService');
      const importStartTime = Date.now();
      
      const { StarService } = await import('../services/starService');
      
      const importEndTime = Date.now();
      console.log(`SuggestedStarsContext: fetchSuggestionsForEmotion - StarService imported in ${importEndTime - importStartTime}ms`);
      
      // ENHANCED: Service call with detailed logging
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - About to call StarService.getSuggestedStarsForEmotion');
      const serviceCallStartTime = Date.now();
      
      const suggestions = await StarService.getSuggestedStarsForEmotion(emotion);
      
      const serviceCallEndTime = Date.now();
      console.log(`SuggestedStarsContext: fetchSuggestionsForEmotion - StarService call completed in ${serviceCallEndTime - serviceCallStartTime}ms`);
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - StarService returned suggestions.length:', suggestions.length);
      
      // ENHANCED: Log star names retrieved from StarService
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
      
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Suggestions details:', suggestions.map(s => ({ 
        id: s.id, 
        catalogId: s.starCatalogRef.hyg.id.toString(), 
        name: s.name,
        emotion: s.metadata?.emotion,
        source: s.metadata?.source
      })));
      
      // CRITICAL: State update with comprehensive logging including star names
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - About to call handleSetSuggestedStars');
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Current state before update:', {
        currentLength: suggestedStars.length,
        currentStarNames: suggestedStars.map(s => s.name || 'Unnamed').join(', '),
        newLength: suggestions.length,
        newStarNames: suggestions.map(s => s.name || 'Unnamed').join(', '),
        timestamp: Date.now()
      });
      
      const stateUpdateStartTime = Date.now();
      handleSetSuggestedStars(suggestions);
      const stateUpdateEndTime = Date.now();
      
      console.log(`SuggestedStarsContext: fetchSuggestionsForEmotion - handleSetSuggestedStars completed in ${stateUpdateEndTime - stateUpdateStartTime}ms`);
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - State update should now be propagating to components');
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
      
      // Clear suggestions on error with logging
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Clearing suggestions due to error');
      handleSetSuggestedStars([]);
      console.log('SuggestedStarsContext: fetchSuggestionsForEmotion - Error handling completed');
      
      // Re-throw the error for upstream handling
      throw error;
    }
  }, [handleSetSuggestedStars, suggestedStars.length]);

  // ENHANCED: State change monitoring with detailed logging including star names
  React.useEffect(() => {
    const timestamp = Date.now();
    console.log(`=== SuggestedStarsContext: State change detected at ${timestamp} ===`);
    console.log('SuggestedStarsContext: State updated - suggestedStars.length:', suggestedStars.length);
    
    if (suggestedStars.length > 0) {
      console.log('SuggestedStarsContext: State updated - CURRENT STAR NAMES in state:', 
        suggestedStars.map(s => s.name || 'Unnamed').join(', '));
      console.log('SuggestedStarsContext: State updated - CURRENT STAR CATALOG IDs in state:', 
        suggestedStars.map(s => s.starCatalogRef.hyg.id.toString()).join(', '));
      console.log('SuggestedStarsContext: State updated - Current suggested stars:', suggestedStars.map(s => ({ 
        id: s.id, 
        catalogId: s.starCatalogRef.hyg.id.toString(), 
        name: s.name,
        emotion: s.metadata?.emotion,
        source: s.metadata?.source
      })));
      console.log('SuggestedStarsContext: State updated - This should trigger re-renders in consuming components');
      console.log('SuggestedStarsContext: State updated - These stars should now be highlighted in 3D view:', 
        suggestedStars.map(s => `${s.name} (ID: ${s.starCatalogRef.hyg.id})`).join(', '));
    } else {
      console.log('SuggestedStarsContext: State updated - NO STAR NAMES in state (empty array)');
      console.log('SuggestedStarsContext: State updated - No stars should be highlighted in 3D view');
    }
    
    console.log(`=== SuggestedStarsContext: State change processing completed at ${Date.now()} ===`);
  }, [suggestedStars]);

  // ENHANCED: Provider lifecycle logging
  React.useEffect(() => {
    console.log('=== SuggestedStarsProvider: Provider mounted ===');
    
    return () => {
      console.log('=== SuggestedStarsProvider: Provider unmounting ===');
    };
  }, []);

  console.log('SuggestedStarsProvider: About to render Provider with context value');
  console.log('SuggestedStarsProvider: Context value suggestedStars.length:', suggestedStars.length);
  if (suggestedStars.length > 0) {
    console.log('SuggestedStarsProvider: Context value STAR NAMES:', 
      suggestedStars.map(s => s.name || 'Unnamed').join(', '));
  }

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
  console.log('useSuggestedStars: Hook called');
  
  const context = useContext(SuggestedStarsContext);
  if (context === undefined) {
    console.error('useSuggestedStars: Hook called outside of SuggestedStarsProvider');
    throw new Error('useSuggestedStars must be used within a SuggestedStarsProvider');
  }
  
  console.log('useSuggestedStars: Returning context with suggestedStars.length:', context.suggestedStars.length);
  if (context.suggestedStars.length > 0) {
    console.log('useSuggestedStars: Returning context with STAR NAMES:', 
      context.suggestedStars.map(s => s.name || 'Unnamed').join(', '));
  }
  return context;
}