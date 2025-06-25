import { useState, useEffect } from 'react';
import { Star } from '../types';
import { StarService } from '../services/starService';

export function useStars(emotionId?: string) {
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStars() {
      try {
        setLoading(true);
        setError(null);

        if (emotionId) {
          // Use the new dynamic star fetching logic
          console.log(`Fetching stars for emotion: ${emotionId}`);
          const fetchedStars = await StarService.fetchStarsForEmotion(emotionId);
          setStars(fetchedStars);
          console.log(`Successfully loaded ${fetchedStars.length} stars for ${emotionId}`);
        } else {
          // If no emotion specified, return empty array
          setStars([]);
        }
      } catch (err) {
        console.error('Error in useStars:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load stars';
        setError(errorMessage);
        
        // Set empty array on error
        setStars([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStars();
  }, [emotionId]);

  return { stars, loading, error };
}

// Hook for getting a single star by ID
export function useStar(starId?: string) {
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

        const fetchedStar = await StarService.getStarById(starId);
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
  }, [starId]);

  return { star, loading, error };
}