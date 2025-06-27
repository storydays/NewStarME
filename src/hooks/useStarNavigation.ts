import { useState, useCallback, useEffect, useRef } from 'react';
import { HygRecord } from '../types';

/**
 * useStarNavigation Hook - Updated for HygRecord[]
 * 
 * Purpose: Manages navigation state and camera focusing for star browsing.
 * Provides prev/next navigation and camera animation triggers.
 * 
 * Key Enhancement: Now works with HygRecord[] instead of Star[]
 * 
 * Features:
 * - Current star index tracking
 * - Navigation functions (prev/next/goto)
 * - Camera focus triggers
 * - Smart reset logic (only when stars actually change)
 * - Prevents infinite reset loops
 * 
 * Confidence Rating: High - Updated for HYG integration
 */

interface UseStarNavigationProps {
  stars: HygRecord[];
  onStarFocus?: (star: HygRecord, index: number) => void;
}

interface UseStarNavigationReturn {
  currentIndex: number;
  currentStar: HygRecord | null;
  canGoPrev: boolean;
  canGoNext: boolean;
  goToPrev: () => void;
  goToNext: () => void;
  goToIndex: (index: number) => void;
  setCurrentIndex: (index: number) => void;
}

export function useStarNavigation({ 
  stars, 
  onStarFocus 
}: UseStarNavigationProps): UseStarNavigationReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // STABILITY FIX: Track initialization state with refs
  const previousStarsLengthRef = useRef(0);
  const hasInitializedRef = useRef(false);

  // STABILITY FIX: Reset index only when stars length actually changes OR on first initialization
  useEffect(() => {
    if (stars.length > 0) {
      // Only reset if:
      // 1. We haven't initialized yet (first load), OR
      // 2. The number of stars has actually changed
      const shouldReset = !hasInitializedRef.current || stars.length !== previousStarsLengthRef.current;
      
      if (shouldReset) {
        console.log(`useStarNavigation: Stars loaded/changed (${previousStarsLengthRef.current} -> ${stars.length}), resetting to index 0`);
        setCurrentIndex(0);
        
        // Update tracking refs
        previousStarsLengthRef.current = stars.length;
        hasInitializedRef.current = true;
        
        // Focus on first star
        if (onStarFocus) {
          onStarFocus(stars[0], 0);
        }
      } else {
        console.log(`useStarNavigation: Stars array reference changed but length is same (${stars.length}), keeping current index ${currentIndex}`);
      }
    } else {
      // Reset when no stars
      if (hasInitializedRef.current) {
        console.log('useStarNavigation: No stars available, resetting state');
        setCurrentIndex(0);
        hasInitializedRef.current = false;
        previousStarsLengthRef.current = 0;
      }
    }
  }, [stars.length, onStarFocus]); // CHANGED: Only depend on stars.length, not the full stars array

  // Current star and navigation state
  const currentStar = stars.length > 0 ? stars[currentIndex] : null;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < stars.length - 1;

  // Navigation functions
  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      const newIndex = currentIndex - 1;
      console.log(`useStarNavigation: Going to previous star (index ${newIndex})`);
      setCurrentIndex(newIndex);
      
      if (onStarFocus && stars[newIndex]) {
        onStarFocus(stars[newIndex], newIndex);
      }
    }
  }, [currentIndex, canGoPrev, stars, onStarFocus]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      const newIndex = currentIndex + 1;
      console.log(`useStarNavigation: Going to next star (index ${newIndex})`);
      setCurrentIndex(newIndex);
      
      if (onStarFocus && stars[newIndex]) {
        onStarFocus(stars[newIndex], newIndex);
      }
    }
  }, [currentIndex, canGoNext, stars, onStarFocus]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < stars.length) {
      console.log(`useStarNavigation: Going to star at index ${index}`);
      setCurrentIndex(index);
      
      if (onStarFocus && stars[index]) {
        onStarFocus(stars[index], index);
      }
    }
  }, [stars, onStarFocus]);

  const handleSetCurrentIndex = useCallback((index: number) => {
    if (index >= 0 && index < stars.length) {
      console.log(`useStarNavigation: Setting current index to ${index}`);
      setCurrentIndex(index);
    }
  }, [stars.length]);

  return {
    currentIndex,
    currentStar,
    canGoPrev,
    canGoNext,
    goToPrev,
    goToNext,
    goToIndex,
    setCurrentIndex: handleSetCurrentIndex
  };
}