import React, { useMemo, useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Star } from './Star';
import { StarLabels } from './StarLabels';

/**
 * Starfield Component - Updated for HYG integration
 * 
 * Purpose: Renders a collection of stars in 3D space using the HYG catalog data.
 * Implements star rendering with textures, click handling, optional labels, and highlighting.
 * 
 * Features:
 * - Texture loading for star particle and glow effects
 * - Performance optimized with memoization
 * - Click handling for star selection
 * - Optional label rendering
 * - Magnitude-based opacity calculation
 * - Support for highlighting specific stars
 * - UPDATED: Now works with HYG catalog data format
 * 
 * Confidence Rating: High - Updated for HYG integration
 */

interface StarfieldProps {
  catalog: Array<{
    id: string;
    position: [number, number, number];
    magnitude: number;
    name?: string;
    isHighlighted?: boolean;
    hygRecord?: any; // Store original HYG record
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
  
  // 1. Initialize textures: Load star_particle and star_glow textures from assets dir
  const [starTexture, glowTexture] = useMemo(() => {
    const loader = new TextureLoader();
    return [
      loader.load('/src/assets/star_particle.png'),
      loader.load('/src/assets/star_glow.png')
    ];
  }, []);

  // Handle star click events
  const handleStarClick = useCallback((starId: string) => {
    console.log('Starfield: Star clicked:', starId);
    if (onStarSelect) {
      onStarSelect(starId);
    }
  }, [onStarSelect]);

  // 4. Optimize performance: Memoize starSprites list with useMemo
  // Only update when star list, size or textures change
  const starSprites = useMemo(() => {
    if (!starTexture || !glowTexture) {
      console.log('Starfield: Textures not loaded yet');
      return null;
    }

    console.log(`Starfield: Rendering ${catalog.length} stars`);
    
    // Count highlighted stars for logging
    const highlightedCount = catalog.filter(star => star.isHighlighted).length;
    if (highlightedCount > 0) {
      console.log(`Starfield: ${highlightedCount} stars are highlighted`);
    }

    return catalog.map((star, index) => {
      // Calculate actual star size based on magnitude (brighter stars = larger)
      const actualStarSize = Math.max(0.02, Math.min(0.3, starSize * (6.0 - star.magnitude) * 0.2));

      return (
        <Star
          key={star.id}
          position={star.position}
          mag={star.magnitude}
          starTexture={starTexture}
          glowTexture={glowTexture}
          starSize={actualStarSize}
          glowMultiplier={glowMultiplier}
          isSelected={star.id === selectedStar}
          isHighlighted={star.isHighlighted || false}
          onClick={() => handleStarClick(star.id)}
        />
      );
    });
  }, [catalog, selectedStar, starTexture, glowTexture, starSize, glowMultiplier, handleStarClick]);

  return (
    <>
      {/* Render star sprites using dedicated Star component */}
      {starSprites}
      
      {/* 5. Add conditional label rendering: If showLabels is true, render StarLabels component */}
      {showLabels && (
        <StarLabels
          stars={catalog}
          selectedStar={selectedStar}
        />
      )}
    </>
  );
}

export default Starfield;