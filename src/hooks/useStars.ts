import { useState, useEffect, useRef } from 'react';
import { HygRecord } from '../types';
import { StarService } from '../services/starService';

/**
 * useStars Hook - Updated to work with HygRecord[]
 * 
 * Purpose: Provides stable star data for a given emotion to prevent
 * unnecessary re-renders and navigation resets.
 * 
 * Key Enhancement: Now returns HygRecord[] instead of Star[] to ensure
 * all stars can be properly focused in the 3D visualization.
 * 
 * Confidence Rating: High - Targeted update for HYG integration
 */

export function useStars(emotionId?: string) {
  const [stars, setStars] = useState<HygRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track the emotionId for which stars were last successfully fetched
  const lastFetchedEmotionRef = useRef<string | null>(null);

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
        
        // Only update state if we successfully fetched stars
        if (fetchedStars && fetchedStars.length > 0) {
          setStars(fetchedStars);
          // Update the ref to track this successful fetch
          lastFetchedEmotionRef.current = emotionId;
          console.log(`useStars: Successfully loaded ${fetchedStars.length} HYG stars for ${emotionId}`);
        } else {
          console.warn(`useStars: No stars returned for emotion ${emotionId}`);
          setStars([]);
          setError('No stars found for this emotion');
        }
      } catch (err) {
        console.error('Error in useStars:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load stars';
        setError(errorMessage);
        
        // Set empty array on error but don't update the ref
        // This allows retry on next emotionId change
        setStars([]);
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

// Hook for getting a single star by ID - Updated to handle HYG IDs
export function useStar(starId?: string) {
  const [star, setStar] = useState<any | null>(null); // Keep as Star for Dedication form compatibility
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

        console.log(`useStar: Fetching star with ID: ${starId}`);
        const fetchedStar = await StarService.getStarById(starId);
        setStar(fetchedStar);
        
        if (fetchedStar) {
          console.log(`useStar: Successfully loaded star: ${fetchedStar.scientific_name}`);
        } else {
          console.warn(`useStar: No star found with ID: ${starId}`);
        }
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
  }, [starId]);

  return { star, loading, error };
}