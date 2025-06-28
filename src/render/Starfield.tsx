import React, { useMemo, useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Star } from './Star';
import { StarLabels } from './StarLabels';
import { InstancedRegularStars } from './InstancedRegularStars';

/**
 * Starfield Component - Configurable Rendering Modes
 * 
 * Purpose: Renders stars using either classic individual components or
 * optimized instanced rendering based on the specified rendering mode.
 * 
 * Features:
 * - Classic mode: Individual Star.tsx components with full effects
 * - Instanced mode: GPU-accelerated shader-based rendering for performance
 * - Automatic categorization and optimization per mode
 * - Maintains visual quality for highlighted/selected stars
 * - Mode-aware label rendering
 * 
 * Confidence Rating: High - Clean separation of rendering logic
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
  renderingMode?: 'classic' | 'instanced'; // NEW: Rendering mode configuration
}

export function Starfield({
  catalog,
  selectedStar,
  onStarSelect,
  starSize = 0.08,
  glowMultiplier = 1.0,
  showLabels = true,
  renderingMode = 'classic' // NEW: Default to classic mode
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
    console.log(`Starfield: Star clicked in ${renderingMode} mode:`, starId);
    if (onStarSelect) {
      onStarSelect(starId);
    }
  }, [onStarSelect, renderingMode]);

  // Mode-aware star categorization
  const { regularStars, specialStars, labelStars } = useMemo(() => {
    if (!starTexture || !glowTexture) {
      console.log('Starfield: Textures not loaded yet');
      return { regularStars: [], specialStars: [], labelStars: [] };
    }

    console.log(`Starfield: Processing ${catalog.length} stars for ${renderingMode} rendering mode`);
    
    if (renderingMode === 'classic') {
      // Classic mode: All stars rendered individually, no categorization needed
      console.log(`Starfield: Classic mode - all ${catalog.length} stars will be rendered individually`);
      
      // For classic mode, we don't need categorization - all stars use Star.tsx
      return {
        regularStars: [],
        specialStars: catalog, // All stars are "special" in classic mode
        labelStars: catalog.filter(star => star.name && star.name.trim() !== '')
      };
    } else {
      // Instanced mode: Categorize for optimal rendering
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

      console.log(`Starfield: Instanced mode - ${regular.length} regular, ${special.length} special, ${labels.length} labeled stars`);
      
      return {
        regularStars: regular,
        specialStars: special,
        labelStars: labels
      };
    }
  }, [catalog, selectedStar, starTexture, glowTexture, renderingMode]);

  // Render individual stars (used in both modes for special stars)
  const starSprites = useMemo(() => {
    const starsToRender = renderingMode === 'classic' ? catalog : specialStars;
    
    return starsToRender.map((star) => {
      // Calculate enhanced properties
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
  }, [renderingMode, catalog, specialStars, selectedStar, starTexture, glowTexture, starSize, glowMultiplier, handleStarClick]);

  // Prepare label data based on rendering mode
  const labelData = useMemo(() => {
    if (renderingMode === 'classic') {
      // Classic mode: Filter for named stars with priority for highlighted/selected
      return catalog.filter(star => star.name && star.name.trim() !== '');
    } else {
      // Instanced mode: Use pre-filtered labelStars
      return labelStars;
    }
  }, [renderingMode, catalog, labelStars]);

  return (
    <>
      {/* Conditional rendering based on mode */}
      {renderingMode === 'classic' ? (
        // Classic mode: Render all stars individually
        <>
          {starSprites}
        </>
      ) : (
        // Instanced mode: Use optimized rendering
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
          {starSprites}
        </>
      )}
      
      {/* Render labels with mode-aware configuration */}
      {showLabels && (
        <StarLabels
          stars={labelData.map(star => ({
            id: star.id,
            position: star.position,
            magnitude: star.magnitude,
            name: star.name,
            isHighlighted: star.isHighlighted,
            showLabel: star.showLabel,
            emotionColor: star.emotionColor
          }))}
          selectedStar={selectedStar}
          renderingMode={renderingMode} // NEW: Pass rendering mode to labels
        />
      )}
    </>
  );
}

export default Starfield;