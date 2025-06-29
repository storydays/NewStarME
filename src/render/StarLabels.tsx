import React from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STAR_SETTINGS } from '../config/starConfig';

/**
 * StarLabels Component - Enhanced with Dynamic Positioning and Hover Support
 * 
 * Purpose: Renders star name labels with dynamic positioning based on star size,
 * enhanced visibility for highlighted/selected stars, and hover state support.
 * 
 * ENHANCED FEATURES:
 * - Dynamic label positioning based on actual star size (using STAR_SETTINGS)
 * - Hover state support for interactive label display
 * - Only shows labels for highlighted, selected, or hovered stars
 * - Proper offset calculation to avoid glow overlap
 * - Performance optimized with distance-based filtering
 * 
 * Confidence Rating: High - Enhanced positioning with comprehensive star configuration
 */

interface StarLabelsProps {
  stars: Array<{
    id: string;
    position: [number, number, number];
    magnitude: number;
    name?: string;
    isHighlighted?: boolean;
    showLabel?: boolean | string;
    emotionColor?: string;
  }>;
  selectedStar?: string | null;
  hoveredStar?: string | null; // NEW: Support for hover state
  renderingMode?: 'classic' | 'instanced';
}

export function StarLabels({ 
  stars, 
  selectedStar, 
  hoveredStar,
  renderingMode = 'classic'
}: StarLabelsProps) {
  const { camera } = useThree();

  // Enhanced label filtering with hover support
  const labeledStars = React.useMemo(() => {
    console.log(`StarLabels: Processing ${stars.length} stars for label display`);
    
    const priorityStars: typeof stars = [];
    const regularStars: typeof stars = [];
    
    stars.forEach(star => {
      // Show labels for highlighted, selected, or hovered stars
      if (star.isHighlighted || star.id === selectedStar || star.id === hoveredStar) {
        priorityStars.push(star);
        console.log(`StarLabels: Priority star added: ${star.name || star.id} (highlighted: ${star.isHighlighted}, selected: ${star.id === selectedStar}, hovered: ${star.id === hoveredStar})`);
      } else if (star.name && star.name.trim() !== '' && star.magnitude < 3.0) {
        // Only very bright named stars for background context
        regularStars.push(star);
      }
    });

    // In classic mode, show more labels for better UX
    // In instanced mode, prioritize performance
    const maxRegularLabels = renderingMode === 'classic' ? 20 : 10;
    const selectedRegularStars = regularStars
      .sort((a, b) => a.magnitude - b.magnitude) // Brightest first
      .slice(0, Math.max(0, maxRegularLabels - priorityStars.length));

    const result = [...priorityStars, ...selectedRegularStars];
    
    console.log(`StarLabels: Rendering ${result.length} labels (${priorityStars.length} priority, ${selectedRegularStars.length} regular)`);
    
    return result;
  }, [stars, selectedStar, hoveredStar, renderingMode]);

  return (
    <>
      {labeledStars.map((star) => {
        // Calculate distance from camera to star
        const starPosition = new THREE.Vector3(...star.position);
        const distanceFromCamera = camera.position.distanceTo(starPosition);
        
        // Determine star state and corresponding settings
        let starSettings = STAR_SETTINGS.regular;
        let isSpecialStar = false;
        
        if (star.id === selectedStar) {
          starSettings = STAR_SETTINGS.selected;
          isSpecialStar = true;
        } else if (star.isHighlighted) {
          starSettings = STAR_SETTINGS.highlighted;
          isSpecialStar = true;
        } else if (star.id === hoveredStar) {
          // Use highlighted settings for hovered stars
          starSettings = STAR_SETTINGS.highlighted;
          isSpecialStar = true;
        }
        
        // Calculate actual star size based on magnitude and settings
        const baseMagnitudeSize = Math.max(0.02, Math.min(0.3, 0.25 * (6.0 - star.magnitude) * 0.2));
        const actualStarSize = baseMagnitudeSize * starSettings.sizeMultiplier;
        const glowRadius = actualStarSize * 2.5; // Glow is 2.5x star size
        
        // ENHANCED: Dynamic label positioning based on actual star size
        // Position label outside the glow effect with proper offset
        const labelOffset = Math.max(1.2, glowRadius * 0.8 + 0.5); // Minimum 1.2 units, or outside glow + padding
        const labelPosition: [number, number, number] = [
          star.position[0], 
          star.position[1] + labelOffset, 
          star.position[2]
        ];
        
        // Enhanced styling based on star state
        let opacity: number;
        let fontSize: number;
        let fontWeight: number;
        let color: string;
        let opacityThreshold: number;
        
        if (isSpecialStar) {
          // Special stars: Always visible with enhanced styling
          opacity = 1.0;
          fontSize = Math.max(14, Math.min(20, 300 / distanceFromCamera));
          fontWeight = 600;
          color = star.emotionColor || starSettings.color;
          opacityThreshold = 0; // Never skip special stars
          
          console.log(`StarLabels: Special star ${star.name || star.id} - size: ${actualStarSize.toFixed(3)}, offset: ${labelOffset.toFixed(2)}`);
        } else {
          // Regular stars: Distance-based visibility
          opacity = Math.max(0.3, Math.min(1.0, (30 / distanceFromCamera) * (4.0 - star.magnitude) / 4.0));
          fontSize = Math.max(8, Math.min(16, 200 / distanceFromCamera));
          fontWeight = 300;
          color = starSettings.color;
          opacityThreshold = 0.3;
        }

        // Skip labels that would be too faint
        if (opacity < opacityThreshold) return null;

        return (
          <Html
            key={`label-${star.id}`}
            position={labelPosition}
            center
            distanceFactor={8}
            occlude={false}
          >
            <div 
              style={{
                color: color,
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                opacity: opacity,
                textShadow: isSpecialStar 
                  ? `0 0 8px ${color}, 0 0 16px ${color}40`
                  : '0 0 4px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: isSpecialStar ? '0.5px' : '0px',
                textAlign: 'center',
                padding: isSpecialStar ? '2px 6px' : '0px',
                borderRadius: isSpecialStar ? '4px' : '0px',
                backgroundColor: isSpecialStar 
                  ? `${color}20`
                  : 'transparent',
                border: isSpecialStar 
                  ? `1px solid ${color}40`
                  : 'none',
                // Enhanced visibility for special stars
                backdropFilter: isSpecialStar ? 'blur(4px)' : 'none',
                boxShadow: isSpecialStar 
                  ? `0 2px 8px rgba(0,0,0,0.3)`
                  : 'none'
              }}
            >
              {star.name}
            </div>
          </Html>
        );
      })}
    </>
  );
}

export default StarLabels;