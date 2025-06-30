import { useState, useEffect, useRef } from 'react';
import { Star } from '../types';
import { StarService } from '../services/starService';

/**
 * useStars Hook - Enhanced with array stability to prevent re-renders
 * 
 * Purpose: Provides stable star data for a given emotion to prevent
 * unnecessary re-renders and navigation resets.
 * 
 * Key Enhancement: Uses deep comparison to check if fetched stars are
 * actually different from current state before updating, preventing
 * unnecessary re-renders when the same data is fetched.
 * 
 * Confidence Rating: High - Targeted fix for navigation stability
 */

export function useStars(emotionId?: string) {
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track the emotionId for which stars were last successfully fetched
  const lastFetchedEmotionRef = useRef<string | null>(null);

  // Helper function to compare star arrays for equality
  const areStarsEqual = (stars1: Star[], stars2: Star[]): boolean => {
    if (stars1.length !== stars2.length) {
      return false;
    }
    
    // Compare each star by ID and key properties
    for (let i = 0; i < stars1.length; i++) {
      const star1 = stars1[i];
      const star2 = stars2[i];
      
      if (star1.id !== star2.id || 
          star1.scientific_name !== star2.scientific_name ||
          star1.emotion_id !== star2.emotion_id) {
        return false;
      }
    }
    
    return true;
  };

  useEffect(() => {
    async function fetchStars() {
      // Early return if no emotionId
      if (!emotionId) {
        setStars([]);
        setLoading(false);
        return;
      }

      // STABILITY FIX: Check if we already have stars for this emotion
      if (lastFetchedEmotionRef.current === emotionId) {
        console.log(`useStars: Stars already loaded for emotion ${emotionId}, skipping fetch`);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`useStars: Fetching stars for emotion: ${emotionId}`);
        const fetchedStars = await StarService.fetchStarsForEmotion(emotionId);
        
        // ENHANCED: Only update state if stars are actually different
        if (fetchedStars && fetchedStars.length > 0) {
          // Check if the fetched stars are different from current stars
          if (!areStarsEqual(stars, fetchedStars)) {
            console.log(`useStars: Stars changed for ${emotionId}, updating state with ${fetchedStars.length} stars`);
            setStars(fetchedStars);
            // Update the ref to track this successful fetch
            lastFetchedEmotionRef.current = emotionId;
          } else {
            console.log(`useStars: Stars unchanged for ${emotionId}, preserving array reference`);
            // Don't update state - preserve existing array reference
            lastFetchedEmotionRef.current = emotionId;
          }
        } else {
          console.warn(`useStars: No stars returned for emotion ${emotionId}`);
          if (stars.length > 0) {
            // Only update if we currently have stars
            setStars([]);
          }
          setError('No stars found for this emotion');
        }
      } catch (err) {
        console.error('Error in useStars:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load stars';
        setError(errorMessage);
        
        // Set empty array on error but don't update the ref
        // This allows retry on next emotionId change
        if (stars.length > 0) {
          setStars([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStars();
  }, [emotionId]); // Only depend on emotionId

  // Reset state when emotionId changes to a different value
  useEffect(() => {
    if (emotionId && lastFetchedEmotionRef.current && lastFetchedEmotionRef.current !== emotionId) {
      console.log(`useStars: Emotion changed from ${lastFetchedEmotionRef.current} to ${emotionId}, clearing previous data`);
      setStars([]);
      setError(null);
      lastFetchedEmotionRef.current = null; // Reset ref to allow new fetch
    }
  }, [emotionId]);

  return { stars, loading, error };
}

// Hook for getting a single star by ID
export function useStar(starId?: string, emotionId?: string | null) {
  const [star, setStar] = useState<Star | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStar() {
      if (!starId) {
        setStar(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const fetchedStar = await StarService.getStarById(starId, emotionId);
        setStar(fetchedStar);
      } catch (err) {
        console.error('Error fetching star:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load star';
        setError(errorMessage);
        setStar(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStar();
  }, [starId, emotionId]);

  return { star, loading, error };
}