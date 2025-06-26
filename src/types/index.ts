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

// HYG Catalog Types
export interface HygRecord {
  id: number;
  hip?: number;
  hd?: number;
  hr?: number;
  gl?: string;
  bf?: string;
  proper?: string;
  ra: number;
  dec: number;
  dist: number;
  pmra?: number;
  pmdec?: number;
  rv?: number;
  mag: number;
  absmag: number;
  spect?: string;
  ci?: number;
  x: number;
  y: number;
  z: number;
  vx?: number;
  vy?: number;
  vz?: number;
  rarad: number;
  decrad: number;
  pmrarad?: number;
  pmdecrad?: number;
  bayer?: string;
  flam?: number;
  con?: string;
  comp?: number;
  comp_primary?: number;
  base?: string;
  lum?: number;
  var?: string;
  var_min?: number;
  var_max?: number;
}

export interface HygData {
  stars: HygRecord[];
  headers: string[];
  totalStars: number;
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