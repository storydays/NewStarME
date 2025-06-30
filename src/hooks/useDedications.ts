import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Dedication, DedicationWithStar, Star } from '../types';
import { StarService } from '../services/starService';

export function useDedications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDedication = useCallback(async (
    dedication: Omit<Dedication, 'id' | 'created_at' | 'star_id'>, 
    star: Star
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating dedication for star:', star.scientific_name);

      // Ensure the star exists in the database and get its UUID
      const starUuid = await StarService.ensureStarInDatabase(star);
      console.log('Star UUID obtained:', starUuid);

      // Create the dedication with the proper UUID
      const dedicationData = {
        ...dedication,
        star_id: starUuid
      };

      console.log('Creating dedication with data:', dedicationData);

      const { data, error: supabaseError } = await supabase
        .from('dedications')
        .insert([dedicationData])
        .select()
        .single();

      if (supabaseError) {
        console.error('Supabase error creating dedication:', supabaseError);
        throw supabaseError;
      }

      console.log('Dedication created successfully:', data);

      // Send dedication email
      try {
        console.log('Sending dedication email...');
        
        const emailData = {
          recipientEmail: dedication.email,
          recipientName: dedication.custom_name,
          starName: star.scientific_name,
          message: dedication.message,
          dedicationUrl: `${window.location.origin}/star/${data.id}`,
          giftTier: dedication.gift_tier,
          senderName: undefined // Could be added later for gifting features
        };

        const emailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-dedication-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        });

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          console.log('Dedication email sent successfully:', emailResult.emailId);
        } else {
          const emailError = await emailResponse.text();
          console.warn('Failed to send dedication email:', emailError);
          // Don't throw error here - dedication was created successfully
        }
      } catch (emailError) {
        console.warn('Email sending failed, but dedication was created:', emailError);
        // Don't throw error here - dedication was created successfully
      }

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