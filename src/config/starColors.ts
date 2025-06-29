/**
 * Star Colors Configuration - Central Color Management
 * 
 * Purpose: Provides centralized configuration for all star colors used throughout the application.
 * This ensures consistency across components and makes color changes easy to manage.
 * 
 * Features:
 * - Centralized color definitions for suggested, selected, and normal stars
 * - Core colors, glow colors, and shadow colors for each star type
 * - Path to star particle image asset
 * - Easy to modify and maintain
 * 
 * Confidence Rating: High - Clean centralized configuration
 */

// Path to the star particle image asset
export const STAR_PARTICLE_IMAGE_PATH = '/src/assets/star_particle.png';

// Star color configuration object
export const STAR_COLORS = {
  suggested: {
    core: '#7FFF94',      // Aurora green start
    glow: '#39FF14',      // Aurora green end  
    shadow: 'rgba(127, 255, 148, 0.1)'
  },
  selected: {
    core: '#9D4EDD',      // Purple start
    glow: '#6A0572',      // Dark purple end
    shadow: 'rgba(157, 78, 221, 0.5)'
  },
  normal: {
    core: '#F8F8FF',      // Ghost white
    glow: '#B0C4DE',      // Light steel blue
    shadow: 'rgba(248, 248, 255, 0.3)'
  }
} as const;

// Export individual color sets for convenience
export const SUGGESTED_STAR_COLORS = STAR_COLORS.suggested;
export const SELECTED_STAR_COLORS = STAR_COLORS.selected;
export const NORMAL_STAR_COLORS = STAR_COLORS.normal;