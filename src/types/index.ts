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