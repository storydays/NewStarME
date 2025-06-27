import { useState, useCallback, useEffect } from 'react';
import { Star } from '../types';

/**
 * useStarNavigation Hook
 * 
 * Purpose: Manages navigation state and camera focusing for star browsing.
 * Provides prev/next navigation and camera animation triggers.
 * 
 * Features:
 * - Current star index tracking
 * - Navigation functions (prev/next/goto)
 * - Camera focus triggers
 * - Auto-reset when stars change
 * 
 * Confidence Rating: High - Standard navigation state management
 */

interface UseStarNavigationProps {
  stars: Star[];
  onStarFocus?: (star: Star, index: number) => void;
}

interface UseStarNavigationReturn {
  currentIndex: number;
  currentStar: Star | null;
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

  // Reset index when stars change
  useEffect(() => {
    if (stars.length > 0) {
      console.log(`useStarNavigation: Stars loaded, resetting to index 0`);
      setCurrentIndex(0);
      
      // Focus on first star
      if (onStarFocus) {
        onStarFocus(stars[0], 0);
      }
    }
  }, [stars, onStarFocus]);

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