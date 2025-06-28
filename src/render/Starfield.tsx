import React, { useMemo, useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Star } from './Star';
import { StarLabels } from './StarLabels';

/**
 * Starfield Component - Enhanced with Star Click Detection for Modal
 * 
 * Purpose: Renders stars with enhanced highlighting and click detection
 * for modal display. Supports both star selection and star click events.
 * 
 * Features:
 * - Enhanced click detection for star selection modal
 * - 400% size increase for highlighted stars
 * - 2x glow intensity for highlighted stars
 * - Emotion-based color tinting
 * - Always-visible star name labels
 * - Performance optimized rendering
 * 
 * Confidence Rating: High - Enhanced existing system with modal click support
 */

interface StarfieldProps {
  catalog: Array<{
    id: string;
    position: [number, number, number];
    magnitude: number;
    name?: string;
    isHighlighted?: boolean;
    enhancedSize?: number;
    enhancedGlow?: number;
    emotionColor?: string;
    showLabel?: boolean | string;
  }>;
  selectedStar?: string | null;
  onStarSelect?: (starId: string) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  onStarClick?: (starId: string) => void; // NEW: Click handler for modal
}

export function Starfield({
  catalog,
  selectedStar,
  onStarSelect,
  starSize = 0.08,
  glowMultiplier = 1.0,
  showLabels = true,
  onStarClick // NEW: Star click handler for modal
}: StarfieldProps) {
  
  // Initialize textures
  const [starTexture, glowTexture] = useMemo(() => {
    const loader = new TextureLoader();
    return [
      loader.load('/src/assets/star_particle.png'),
      loader.load('/src/assets/star_glow.png')
    ];
  }, []);

  // Handle star click events with enhanced detection for modal
  const handleStarClick = useCallback((starId: string) => {
    console.log('Starfield: Star clicked:', starId);
    
    // Trigger modal if callback provided
    if (onStarClick) {
      onStarClick(starId);
    }
    
    // Also trigger selection if callback provided
    if (onStarSelect) {
      onStarSelect(starId);
    }
  }, [onStarSelect, onStarClick]);

  // Optimize performance: Memoize starSprites list with enhanced highlighting
  const starSprites = useMemo(() => {
    if (!starTexture || !glowTexture) {
      console.log('Starfield: Textures not loaded yet');
      return null;
    }

    console.log(`Starfield: Rendering ${catalog.length} stars with enhanced highlighting and modal click support`);
    
    // Count highlighted stars for logging
    const highlightedCount = catalog.filter(star => star.isHighlighted).length;
    if (highlightedCount > 0) {
      console.log(`Starfield: ${highlightedCount} stars are highlighted with enhanced visualization`);
    }

    return catalog.map((star, index) => {
      // Calculate base star size based on magnitude
      const baseMagnitudeSize = Math.max(0.02, Math.min(0.3, starSize * (6.0 - star.magnitude) * 0.2));
      
      // Apply enhanced size for highlighted stars (400% increase)
      const enhancedSize = star.enhancedSize || 1.0;
      const actualStarSize = baseMagnitudeSize * enhancedSize;
      
      // Apply enhanced glow for highlighted stars (2x intensity)
      const enhancedGlow = star.enhancedGlow || 1.0;
      const actualGlowMultiplier = glowMultiplier * enhancedGlow;

      return (
        <Star
          key={star.id}
          position={star.position}
          mag={star.magnitude}
          starTexture={starTexture}
          glowTexture={glowTexture}
          starSize={actualStarSize}
          glowMultiplier={actualGlowMultiplier}
          isSelected={star.id === selectedStar}
          isHighlighted={star.isHighlighted || false}
          emotionColor={star.emotionColor}
          onClick={() => handleStarClick(star.id)} // Enhanced click handler
        />
      );
    });
  }, [catalog, selectedStar, starTexture, glowTexture, starSize, glowMultiplier, handleStarClick]);

  // Prepare enhanced labels data
  const enhancedLabelsData = useMemo(() => {
    return catalog.map(star => ({
      id: star.id,
      position: star.position,
      magnitude: star.magnitude,
      name: star.name,
      isHighlighted: star.isHighlighted,
      showLabel: star.showLabel,
      emotionColor: star.emotionColor
    }));
  }, [catalog]);

  return (
    <>
      {/* Render enhanced star sprites with modal click support */}
      {starSprites}
      
      {/* Render enhanced labels with always-visible highlighted star names */}
      {showLabels && (
        <StarLabels
          stars={enhancedLabelsData}
          selectedStar={selectedStar}
        />
      )}
    </>
  );
}

export default Starfield;