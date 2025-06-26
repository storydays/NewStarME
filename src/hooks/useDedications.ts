import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Dedication, DedicationWithStar } from '../types';

export function useDedications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDedication = useCallback(async (dedication: Omit<Dedication, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating dedication:', dedication);

      const { data, error: supabaseError } = await supabase
        .from('dedications')
        .insert([dedication])
        .select()
        .single();

      if (supabaseError) {
        console.error('Supabase error creating dedication:', supabaseError);
        throw supabaseError;
      }

      console.log('Dedication created successfully:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dedication';
      console.error('Error in createDedication:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDedication = useCallback(async (id: string): Promise<DedicationWithStar | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching dedication with ID:', id);

      // Fixed query: fetch dedication with star and emotion data
      const { data, error: supabaseError } = await supabase
        .from('dedications')
        .select(`
          *,
          star:stars(*, emotion:emotions(*))
        `)
        .eq('id', id)
        .single();

      if (supabaseError) {
        console.error('Supabase error fetching dedication:', supabaseError);
        throw supabaseError;
      }

      if (!data) {
        console.log('No dedication found with ID:', id);
        return null;
      }

      console.log('Raw dedication data:', data);

      // Transform the data structure to match DedicationWithStar interface
      // The star.emotion needs to be flattened to the top level
      const transformedData: DedicationWithStar = {
        ...data,
        star: {
          ...data.star,
          // Remove the nested emotion from star object since we'll put it at top level
          emotion: undefined
        },
        emotion: data.star?.emotion || null
      };

      // Clean up the star object to remove the nested emotion property
      if (transformedData.star) {
        const { emotion, ...starWithoutEmotion } = transformedData.star;
        transformedData.star = starWithoutEmotion;
      }

      console.log('Transformed dedication data:', transformedData);
      return transformedData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dedication';
      console.error('Error in getDedication:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDedication,
    getDedication,
    loading,
    error
  };
}