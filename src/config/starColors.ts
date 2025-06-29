/**
 * Star Colors Configuration - Simplified Color Management
 * 
 * Purpose: Provides centralized configuration for all star colors used throughout the application.
 * SIMPLIFIED: Each category now has only a single main color property.
 * 
 * Features:
 * - Single solid color for each star type (suggested, selected, normal)
 * - No gradients or shadow effects
 * - Applied directly to star_particle.png image
 * - Easy to modify and maintain
 * 
 * Confidence Rating: High - Simplified centralized configuration
 */

// Path to the star particle image asset
export const STAR_PARTICLE_IMAGE_PATH = '/src/assets/star_particle.png';

// Simplified star color configuration object - single color per category
export const STAR_COLORS = {
  suggested: {
    main: '#7FFF94'      // Aurora green
  },
  selected: {
    main: '#9D4EDD'      // Purple
  },
  normal: {
    main: '#F8F8FF'      // Ghost white
  }
} as const;

// Export individual color sets for convenience
export const SUGGESTED_STAR_COLORS = STAR_COLORS.suggested;
export const SELECTED_STAR_COLORS = STAR_COLORS.selected;
export const NORMAL_STAR_COLORS = STAR_COLORS.normal;