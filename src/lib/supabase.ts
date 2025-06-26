import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      emotions: {
        Row: {
          id: string;
          name: string;
          color: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          description?: string;
          created_at?: string;
        };
      };
      stars: {
        Row: {
          id: string;
          scientific_name: string;
          poetic_description: string;
          coordinates: string;
          visual_data: any;
          emotion_id: string;
          created_at: string;
          source: string;
          generated_at: string;
        };
        Insert: {
          id?: string;
          scientific_name: string;
          poetic_description: string;
          coordinates: string;
          visual_data?: any;
          emotion_id: string;
          created_at?: string;
          source?: string;
          generated_at?: string;
        };
        Update: {
          id?: string;
          scientific_name?: string;
          poetic_description?: string;
          coordinates?: string;
          visual_data?: any;
          emotion_id?: string;
          created_at?: string;
          source?: string;
          generated_at?: string;
        };
      };
      dedications: {
        Row: {
          id: string;
          star_id: string;
          custom_name: string;
          message: string;
          gift_tier: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          star_id: string;
          custom_name: string;
          message: string;
          gift_tier: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          star_id?: string;
          custom_name?: string;
          message?: string;
          gift_tier?: string;
          email?: string;
          created_at?: string;
        };
      };
    };
  };
};