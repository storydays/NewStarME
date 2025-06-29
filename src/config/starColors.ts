/**
 * Star Colors Configuration - Simplified Color Management
 * 
 * Purpose: Provides centralized configuration for all star colors used throughout the application.
 * SIMPLIFIED: Each category now has a direct color value without nested properties.
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

// Simplified star color configuration object - direct color assignment
export const STAR_COLORS = {
  suggested: '#7FFF94',    // Aurora green
  selected: '#9D4EDD',     // Purple
  normal: '#F8F8FF'        // Ghost white
} as const;

// Export individual colors for convenience
export const SUGGESTED_STAR_COLOR = STAR_COLORS.suggested;
export const SELECTED_STAR_COLOR = STAR_COLORS.selected;
export const NORMAL_STAR_COLOR = STAR_COLORS.normal;