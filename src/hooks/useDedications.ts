import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dedication, DedicationWithStar } from '../types';

export function useDedications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDedication = async (dedication: Omit<Dedication, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('dedications')
        .insert([dedication])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dedication';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDedication = async (id: string): Promise<DedicationWithStar | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('dedications')
        .select(`
          *,
          star:stars(*),
          emotion:stars(emotion:emotions(*))
        `)
        .eq('id', id)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      return data as DedicationWithStar;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dedication';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createDedication,
    getDedication,
    loading,
    error
  };
}