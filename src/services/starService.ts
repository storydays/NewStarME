import { supabase } from '../lib/supabase';
import { starsData } from '../data/stars';

export class StarService {
  static async initializeStars() {
    try {
      console.log('Initializing stars data...');
      
      // Check if stars already exist
      const { data: existingStars } = await supabase
        .from('stars')
        .select('id')
        .limit(1);

      if (existingStars && existingStars.length > 0) {
        console.log('Stars already initialized');
        return;
      }

      // Insert stars data
      const starsToInsert = starsData.map(star => ({
        scientific_name: star.scientific_name,
        poetic_description: star.poetic_description,
        coordinates: star.coordinates,
        visual_data: star.visual_data,
        emotion_id: star.emotion_id
      }));

      const { error } = await supabase
        .from('stars')
        .insert(starsToInsert);

      if (error) {
        console.error('Error inserting stars:', error);
      } else {
        console.log('Stars initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing stars:', error);
    }
  }

  static async getStarsByEmotion(emotionId: string) {
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .eq('emotion_id', emotionId)
      .limit(5);

    if (error) {
      console.error('Error fetching stars:', error);
      return null;
    }

    return data;
  }

  static async getStarById(starId: string) {
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .eq('id', starId)
      .single();

    if (error) {
      console.error('Error fetching star:', error);
      return null;
    }

    return data;
  }
}