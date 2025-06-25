import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star } from '../types';
import { starsData } from '../data/stars';

export function useStars(emotionId?: string) {
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStars() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from('stars').select('*');
        
        if (emotionId) {
          query = query.eq('emotion_id', emotionId);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          // Fallback to local data if Supabase fails
          console.warn('Supabase query failed, using local data:', supabaseError);
          const filteredStars = emotionId 
            ? starsData.filter(star => star.emotion_id === emotionId)
            : starsData;
          
          setStars(filteredStars.map((star, index) => ({
            id: `${star.emotion_id}-${index}`,
            ...star
          })));
        } else {
          setStars(data || []);
        }
      } catch (err) {
        console.error('Error fetching stars:', err);
        setError('Failed to load stars');
        
        // Fallback to local data
        const filteredStars = emotionId 
          ? starsData.filter(star => star.emotion_id === emotionId)
          : starsData;
        
        setStars(filteredStars.map((star, index) => ({
          id: `${star.emotion_id}-${index}`,
          ...star
        })));
      } finally {
        setLoading(false);
      }
    }

    fetchStars();
  }, [emotionId]);

  return { stars, loading, error };
}