export interface Emotion {
  id: string;
  name: string;
  color: string;
  description: string;
  icon: string;
}

export interface Star {
  id: string;
  scientific_name: string;
  poetic_description: string;
  coordinates: string;
  visual_data: {
    brightness: number;
    color: string;
    size: number;
  };
  emotion_id: string;
  source?: 'static' | 'ai' | 'fallback'; // Added source tracking
  generated_at?: string; // Added generation timestamp
}

export interface Dedication {
  id: string;
  star_id: string;
  custom_name: string;
  message: string;
  gift_tier: 'basic' | 'premium' | 'deluxe';
  email: string;
  created_at: string;
}

export interface DedicationWithStar extends Dedication {
  star: Star;
  emotion: Emotion;
}

// AI-related types
export interface AIStarRequest {
  emotionId: string;
}

export interface AIStarResponse {
  success: boolean;
  stars?: Star[];
  source?: 'ai' | 'fallback';
  count?: number;
  error?: string;
}

export interface CatalogStar {
  scientific_name: string;
  coordinates: string;
  visual_data: {
    brightness: number;
    color: string;
    size: number;
  };
  constellation?: string;
  distance_ly?: number;
}