import { supabase } from '../lib/supabase';
import { starsData } from '../data/stars';
import { Star } from '../types';

export class StarService {
  // Cache duration in milliseconds (24 hours)
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000;

  /**
   * Initialize static stars data on app load
   * This ensures we have fallback data available
   */
  static async initializeStars() {
    try {
      console.log('Initializing static stars data...');
      
      // Check if static stars already exist
      const { data: existingStars } = await supabase
        .from('stars')
        .select('id')
        .eq('source', 'static')
        .limit(1);

      if (existingStars && existingStars.length > 0) {
        console.log('Static stars already initialized');
        return;
      }

      // Insert static stars data with source marking
      const starsToInsert = starsData.map(star => ({
        scientific_name: star.scientific_name,
        poetic_description: star.poetic_description,
        coordinates: star.coordinates,
        visual_data: star.visual_data,
        emotion_id: star.emotion_id,
        source: 'static'
      }));

      const { error } = await supabase
        .from('stars')
        .insert(starsToInsert);

      if (error) {
        console.error('Error inserting static stars:', error);
      } else {
        console.log('Static stars initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing static stars:', error);
    }
  }

  /**
   * Fetch stars for a given emotion with AI generation and caching
   * This is the main function that implements the dynamic star generation logic
   */
  static async fetchStarsForEmotion(emotionId: string): Promise<Star[]> {
    try {
      console.log(`Fetching stars for emotion: ${emotionId}`);

      // Step 1: Check for cached AI-generated stars
      const { data: cachedStars, error: cacheError } = await supabase
        .from('stars')
        .select('*')
        .eq('emotion_id', emotionId)
        .eq('source', 'ai')
        .order('generated_at', { ascending: false });

      if (cacheError) {
        console.error('Error checking cached stars:', cacheError);
      } else if (cachedStars && cachedStars.length > 0) {
        // Check if cached stars are still fresh
        const latestStar = cachedStars[0];
        const generatedAt = new Date(latestStar.generated_at || 0).getTime();
        const now = Date.now();
        
        if (now - generatedAt < this.CACHE_DURATION) {
          console.log(`Using cached AI stars (${cachedStars.length} found)`);
          return cachedStars.slice(0, 5); // Return up to 5 stars
        } else {
          console.log('Cached stars are stale, generating new ones');
        }
      }

      // Step 2: Generate new stars using AI
      try {
        console.log('Calling AI generation function...');
        
        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stars-ai`;
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emotionId })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.stars && result.stars.length > 0) {
            console.log(`AI generation successful: ${result.stars.length} stars generated (source: ${result.source})`);
            return result.stars;
          } else {
            console.warn('AI generation returned no stars, falling back to static');
          }
        } else {
          const errorText = await response.text();
          console.error('AI generation failed:', response.status, errorText);
        }
      } catch (aiError) {
        console.error('AI generation request failed:', aiError);
      }

      // Step 3: Fallback to static stars
      console.log('Using static stars as fallback');
      return this.getStaticStarsForEmotion(emotionId);

    } catch (error) {
      console.error('Error in fetchStarsForEmotion:', error);
      
      // Final fallback to local data
      console.log('Using local data as final fallback');
      return this.getLocalStarsForEmotion(emotionId);
    }
  }

  /**
   * Get static stars from database for an emotion
   */
  private static async getStaticStarsForEmotion(emotionId: string): Promise<Star[]> {
    try {
      const { data: staticStars, error } = await supabase
        .from('stars')
        .select('*')
        .eq('emotion_id', emotionId)
        .eq('source', 'static')
        .limit(5);

      if (error) {
        console.error('Error fetching static stars:', error);
        return this.getLocalStarsForEmotion(emotionId);
      }

      if (staticStars && staticStars.length > 0) {
        console.log(`Found ${staticStars.length} static stars in database`);
        return staticStars;
      }

      // If no static stars in database, return local data
      return this.getLocalStarsForEmotion(emotionId);
    } catch (error) {
      console.error('Error in getStaticStarsForEmotion:', error);
      return this.getLocalStarsForEmotion(emotionId);
    }
  }

  /**
   * Get stars from local data as final fallback
   */
  private static getLocalStarsForEmotion(emotionId: string): Star[] {
    console.log(`Using local stars data for emotion: ${emotionId}`);
    
    const filteredStars = starsData.filter(star => star.emotion_id === emotionId);
    
    return filteredStars.map((star, index) => ({
      id: `local-${star.emotion_id}-${index}`,
      ...star
    }));
  }

  /**
   * Get stars by emotion ID (legacy method for compatibility)
   */
  static async getStarsByEmotion(emotionId: string): Promise<Star[] | null> {
    try {
      const stars = await this.fetchStarsForEmotion(emotionId);
      return stars.length > 0 ? stars : null;
    } catch (error) {
      console.error('Error in getStarsByEmotion:', error);
      return null;
    }
  }

  /**
   * Get star by ID
   */
  static async getStarById(starId: string): Promise<Star | null> {
    try {
      // First try database
      const { data, error } = await supabase
        .from('stars')
        .select('*')
        .eq('id', starId)
        .single();

      if (error) {
        console.error('Error fetching star by ID:', error);
        
        // Fallback to local data
        const localStar = starsData.find((_, index) => 
          starId.includes(`-${index}`)
        );
        
        if (localStar) {
          return {
            id: starId,
            ...localStar
          };
        }
        
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getStarById:', error);
      return null;
    }
  }

  /**
   * Clear cached AI stars for an emotion (useful for testing)
   */
  static async clearCachedStars(emotionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stars')
        .delete()
        .eq('emotion_id', emotionId)
        .eq('source', 'ai');

      if (error) {
        console.error('Error clearing cached stars:', error);
        return false;
      }

      console.log(`Cleared cached stars for emotion: ${emotionId}`);
      return true;
    } catch (error) {
      console.error('Error in clearCachedStars:', error);
      return false;
    }
  }
}