import React, { useMemo, useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Star } from './Star';
import { StarLabels } from './StarLabels';
import { InstancedRegularStars } from './InstancedRegularStars';

/**
 * Starfield Component - Enhanced with highlightedStarIds Prop
 * 
 * Purpose: Renders stars with highlighting based on props, not context.
 * Receives highlightedStarIds as prop to determine which stars to emphasize.
 * 
 * Features:
 * - Props-based highlighting (no context dependency)
 * - Enhanced aurora gradients for highlighted stars
 * - Enhanced click detection for star selection
 * - Configurable rendering modes (classic/instanced)
 * - Performance optimized rendering
 * 
 * Confidence Rating: High - Clean props-based rendering
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
  renderingMode?: 'classic' | 'instanced';
  onStarClick?: (starId: string) => void;
}

export function Starfield({
  catalog,
  selectedStar,
  onStarSelect,
  starSize = 0.08,
  glowMultiplier = 1.0,
  showLabels = true,
  renderingMode = 'classic',
  onStarClick
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
    
    // Trigger modal if callback provided
    if (onStarClick) {
      onStarClick(starId);
    }
    
    // Also trigger selection if callback provided
    if (onStarSelect) {
      onStarSelect(starId);
    }
  }, [onStarSelect, onStarClick, renderingMode]);

  // Mode-aware star categorization
  const { regularStars, specialStars, labelStars } = useMemo(() => {
    if (!starTexture || !glowTexture) {
      console.log('Starfield: Textures not loaded yet');
      return { regularStars: [], specialStars: [], labelStars: [] };
    }

    console.log(`Starfield: Processing ${catalog.length} stars for ${renderingMode} rendering mode`);
    
    if (renderingMode === 'classic') {
      // Classic mode: All stars rendered individually
      console.log(`Starfield: Classic mode - all ${catalog.length} stars will be rendered individually`);
      
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
          labels.push(star);
        } else {
          regular.push(star);
          
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

  // Render individual stars
  const starSprites = useMemo(() => {
    const starsToRender = renderingMode === 'classic' ? catalog : specialStars;
    
    return starsToRender.map((star) => {
      // Calculate enhanced properties
      const baseMagnitudeSize = Math.max(0.02, Math.min(0.3, starSize * (6.0 - star.magnitude) * 0.2));
      
      // Enhanced sizes for highlighted and selected stars
      let enhancedSize = star.enhancedSize || 1.0;
      if (star.isHighlighted) {
        enhancedSize = 2.5; // Bigger for highlighted stars
      }
      if (star.id === selectedStar) {
        enhancedSize = 3.0; // Even bigger for selected stars
      }
      
      const actualStarSize = baseMagnitudeSize * enhancedSize;
      
      // Enhanced glow
      let enhancedGlow = star.enhancedGlow || 1.0;
      if (star.isHighlighted) {
        enhancedGlow = 2.0;
      }
      if (star.id === selectedStar) {
        enhancedGlow = 2.5;
      }
      
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
          isSuggested={star.isHighlighted || false}
          onClick={() => handleStarClick(star.id)}
        />
      );
    });
  }, [renderingMode, catalog, specialStars, selectedStar, starTexture, glowTexture, starSize, glowMultiplier]);

  // Prepare label data based on rendering mode
  const labelData = useMemo(() => {
    if (renderingMode === 'classic') {
      return catalog.filter(star => star.name && star.name.trim() !== '');
    } else {
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
          renderingMode={renderingMode}
        />
      )}
    </>
  );
}

export default Starfield;