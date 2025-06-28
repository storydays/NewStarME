import React, { useMemo, useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Star } from './Star';
import { StarLabels } from './StarLabels';

/**
 * Starfield Component - Enhanced with Advanced Star Selection Interface
 * 
 * Purpose: Renders stars with enhanced highlighting, emotion-based coloring,
 * increased sizes for highlighted stars, and always-visible labels.
 * 
 * Features:
 * - 400% size increase for highlighted stars
 * - 2x glow intensity for highlighted stars
 * - Emotion-based color tinting
 * - Enhanced click detection
 * - Always-visible star name labels
 * - Performance optimized rendering
 * 
 * Confidence Rating: High - Enhanced existing system with advanced highlighting
 */

interface StarfieldProps {
  catalog: Array<{
    id: string;
    position: [number, number, number];
    magnitude: number;
    name?: string;
    isHighlighted?: boolean;
    enhancedSize?: number; // NEW: Size multiplier for highlighted stars
    enhancedGlow?: number; // NEW: Glow multiplier for highlighted stars
    emotionColor?: string; // NEW: Emotion-based color tinting
    showLabel?: boolean | string; // NEW: Force show label with optional custom text
  }>;
  selectedStar?: string | null;
  onStarSelect?: (starId: string) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
}

export function Starfield({
  catalog,
  selectedStar,
  onStarSelect,
  starSize = 0.08,
  glowMultiplier = 1.0,
  showLabels = true
}: StarfieldProps) {
  
  // Initialize textures
  const [starTexture, glowTexture] = useMemo(() => {
    const loader = new TextureLoader();
    return [
      loader.load('/src/assets/star_particle.png'),
      loader.load('/src/assets/star_glow.png')
    ];
  }, []);

  // Handle star click events with enhanced detection
  const handleStarClick = useCallback((starId: string) => {
    console.log('Starfield: Enhanced star clicked:', starId);
    if (onStarSelect) {
      onStarSelect(starId);
    }
  }, [onStarSelect]);

  // Optimize performance: Memoize starSprites list with enhanced highlighting
  const starSprites = useMemo(() => {
    if (!starTexture || !glowTexture) {
      console.log('Starfield: Textures not loaded yet');
      return null;
    }

    console.log(`Starfield: Rendering ${catalog.length} stars with enhanced highlighting`);
    
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

   //   console.log(`Starfield: Star ${star.id} - highlighted: ${star.isHighlighted}, size: ${actualStarSize.toFixed(3)}, glow: ${actualGlowMultiplier.toFixed(1)}`);

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
          emotionColor={star.emotionColor} // NEW: Pass emotion color for tinting
          onClick={() => handleStarClick(star.id)}
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
      {/* Render enhanced star sprites */}
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