/**
 * Star Configuration - Comprehensive Star Visual Settings
 * 
 * Purpose: Provides centralized configuration for all star visual properties
 * including colors, size multipliers, and glow multipliers for different star states.
 * 
 * Features:
 * - Three star categories: regular, highlighted (for suggested stars), selected
 * - Each category includes color, sizeMultiplier, and glowMultiplier
 * - Easy to modify and maintain
 * - Type-safe configuration with const assertion
 * 
 * Confidence Rating: High - Comprehensive centralized star configuration
 */

export const STAR_SETTINGS = {
  regular: {
    color: '#F8F8FF', // Ghost white
    sizeMultiplier: 1.0,
    glowMultiplier: 1.0,
  },
  highlighted: { // For suggested stars
    color: '#7FFF94', // Aurora green
    sizeMultiplier: 2.5,
    glowMultiplier: 2.0,
  },
  selected: {
    color: '#9D4EDD', // Purple
    sizeMultiplier: 3.0,
    glowMultiplier: 2.5,
  }
} as const;

// Export individual settings for convenience
export const REGULAR_STAR_SETTINGS = STAR_SETTINGS.regular;
export const HIGHLIGHTED_STAR_SETTINGS = STAR_SETTINGS.highlighted;
export const SELECTED_STAR_SETTINGS = STAR_SETTINGS.selected;