import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Star, HygRecord } from '../types';

/**
 * SuggestedStarsContext - Enhanced with Centralized Selection State
 * 
 * Purpose: Provides centralized state management for star selection, modal display,
 * and camera focus to prevent synchronization issues between components.
 * 
 * Key Enhancement: Added selectedHygRecord and selectedModalStar to centralize
 * selection state and prevent conflicts between 3D view and modal display.
 * 
 * Features:
 * - Global state management for suggested/highlighted stars
 * - Centralized selected star state for 3D view (HygRecord)
 * - Centralized modal star state for modal display (Star)
 * - Camera focus trigger for smooth star-to-star navigation
 * - Deep comparison to prevent unnecessary updates
 * - Context provider for easy consumption across components
 * 
 * Confidence Rating: High - Centralized state management to fix synchronization issues
 */

interface SuggestedStarsContextType {
  suggestedStars: Star[];
  setSuggestedStars: (stars: Star[]) => void;
  clearSuggestedStars: () => void;
  focusedStarIndex: number | null;
  setFocusedStarIndex: (index: number | null) => void;
  triggerStarFocus: (star: Star, index: number) => void;
  // NEW: Centralized selection state
  selectedHygRecord: HygRecord | null;
  setSelectedHygRecord: (star: HygRecord | null) => void;
  selectedModalStar: Star | null;
  setSelectedModalStar: (star: Star | null) => void;
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
  
  // NEW: Centralized selection state
  const [selectedHygRecord, setSelectedHygRecord] = useState<HygRecord | null>(null);
  const [selectedModalStar, setSelectedModalStar] = useState<Star | null>(null);

  const clearSuggestedStars = useCallback(() => {
    console.log('SuggestedStarsContext: Clearing suggested stars and selections');
    setSuggestedStarsState([]);
    setFocusedStarIndex(null);
    setSelectedHygRecord(null);
    setSelectedModalStar(null);
  }, []);

  const handleSetSuggestedStars = useCallback((stars: Star[]) => {
    console.log(`SuggestedStarsContext: Attempting to set ${stars.length} suggested stars`);
    
    // Deep comparison to prevent infinite loops
    if (areStarsDeepEqual(suggestedStars, stars)) {
      console.log('SuggestedStarsContext: Stars are deeply equal, skipping update to prevent infinite loop');
      return;
    }
    
    console.log('SuggestedStarsContext: Stars are different, updating state');
    setSuggestedStarsState(stars);
  }, [suggestedStars]);

  const triggerStarFocus = useCallback((star: Star, index: number) => {
    console.log(`SuggestedStarsContext: Triggering focus on star ${star.scientific_name} at index ${index}`);
    setFocusedStarIndex(index);
  }, []);

  // NEW: Enhanced setters with logging
  const handleSetSelectedHygRecord = useCallback((star: HygRecord | null) => {
    console.log('SuggestedStarsContext: Setting selected HYG record:', star?.proper || star?.id || 'null');
    setSelectedHygRecord(star);
  }, []);

  const handleSetSelectedModalStar = useCallback((star: Star | null) => {
    console.log('SuggestedStarsContext: Setting selected modal star:', star?.scientific_name || 'null');
    setSelectedModalStar(star);
  }, []);

  return (
    <SuggestedStarsContext.Provider 
      value={{ 
        suggestedStars, 
        setSuggestedStars: handleSetSuggestedStars, 
        clearSuggestedStars,
        focusedStarIndex,
        setFocusedStarIndex,
        triggerStarFocus,
        // NEW: Centralized selection state
        selectedHygRecord,
        setSelectedHygRecord: handleSetSelectedHygRecord,
        selectedModalStar,
        setSelectedModalStar: handleSetSelectedModalStar
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