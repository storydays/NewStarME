import React, { useMemo, useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Star } from './Star';
import { StarLabels } from './StarLabels';
import { InstancedRegularStars } from './InstancedRegularStars';

/**
 * Starfield Component - Optimized with Instanced Rendering
 * 
 * Purpose: Efficiently renders large star catalogs using GPU instancing for regular stars
 * and individual rendering for highlighted/selected stars.
 * 
 * Features:
 * - Instanced rendering for 100K+ regular stars (single draw call)
 * - Individual rendering for highlighted/selected stars (complex effects)
 * - Automatic categorization of stars by importance
 * - Performance-optimized label rendering
 * - Maintains visual quality for important stars
 * 
 * Confidence Rating: High - Proven optimization technique for large datasets
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

  // Handle star click events
  const handleStarClick = useCallback((starId: string) => {
    console.log('Starfield: Star clicked:', starId);
    if (onStarSelect) {
      onStarSelect(starId);
    }
  }, [onStarSelect]);

  // Categorize stars for optimal rendering
  const { regularStars, specialStars, labelStars } = useMemo(() => {
    if (!starTexture || !glowTexture) {
      console.log('Starfield: Textures not loaded yet');
      return { regularStars: [], specialStars: [], labelStars: [] };
    }

    console.log(`Starfield: Categorizing ${catalog.length} stars for optimized rendering`);
    
    const regular: typeof catalog = [];
    const special: typeof catalog = [];
    const labels: typeof catalog = [];
    
    catalog.forEach((star) => {
      // Special rendering for highlighted or selected stars
      if (star.isHighlighted || star.id === selectedStar) {
        special.push(star);
        labels.push(star); // Always include special stars in labels
      } else {
        regular.push(star);
        
        // Only include named stars in labels for performance
        if (star.name && star.name.trim() !== '') {
          labels.push(star);
        }
      }
    });

    console.log(`Starfield: Categorized - ${regular.length} regular, ${special.length} special, ${labels.length} labeled stars`);
    
    return {
      regularStars: regular,
      specialStars: special,
      labelStars: labels
    };
  }, [catalog, selectedStar, starTexture, glowTexture]);

  // Render individual special stars with full effects
  const specialStarSprites = useMemo(() => {
    return specialStars.map((star) => {
      // Calculate enhanced properties for special stars
      const baseMagnitudeSize = Math.max(0.02, Math.min(0.3, starSize * (6.0 - star.magnitude) * 0.2));
      const enhancedSize = star.enhancedSize || 1.0;
      const actualStarSize = baseMagnitudeSize * enhancedSize;
      
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
          onClick={() => handleStarClick(star.id)}
        />
      );
    });
  }, [specialStars, selectedStar, starTexture, glowTexture, starSize, glowMultiplier, handleStarClick]);

  return (
    <>
      {/* Render regular stars using instanced rendering for performance */}
      {regularStars.length > 0 && (
        <InstancedRegularStars
          stars={regularStars}
          starTexture={starTexture}
          glowTexture={glowTexture}
          starSize={starSize}
          glowMultiplier={glowMultiplier}
        />
      )}
      
      {/* Render special stars individually for full effects */}
      {specialStarSprites}
      
      {/* Render optimized labels */}
      {showLabels && (
        <StarLabels
          stars={labelStars.map(star => ({
            id: star.id,
            position: star.position,
            magnitude: star.magnitude,
            name: star.name,
            isHighlighted: star.isHighlighted,
            showLabel: star.showLabel,
            emotionColor: star.emotionColor
          }))}
          selectedStar={selectedStar}
        />
      )}
    </>
  );
}

export default Starfield;