import React from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STAR_SETTINGS } from '../config/starConfig';

/**
 * StarLabels Component - Enhanced with Fixed Hovered Label Positioning
 * 
 * Purpose: Renders star name labels with strict filtering for highlighted, selected, 
 * or hovered stars only. Enhanced positioning and consistent styling.
 * 
 * FIXED FEATURES:
 * - Only shows labels for highlighted, selected, or hovered stars
 * - FIXED: Proper positioning for hovered stars (closer to actual star position)
 * - Consistent white styling for all labels
 * - Bigger labels for highlighted stars
 * - No special styling effects (borders, backgrounds, etc.)
 * - Correct label positioning based on actual star size (not magnified size)
 * 
 * Confidence Rating: High - Fixed hovered label positioning issue
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
  hoveredStar?: string | null;
  renderingMode?: 'classic' | 'instanced';
}

export function StarLabels({ 
  stars, 
  selectedStar, 
  hoveredStar,
  renderingMode = 'classic'
}: StarLabelsProps) {
  const { camera } = useThree();

  // Enhanced label filtering - ONLY highlighted, selected, or hovered stars
  const labeledStars = React.useMemo(() => {
    console.log(`StarLabels: Processing ${stars.length} stars for label display`);
    
    const filteredStars = stars.filter(star => {
      // STRICT FILTERING: Only show labels for highlighted, selected, or hovered stars
      const shouldShow = star.isHighlighted || star.id === selectedStar || star.id === hoveredStar;
      
      if (shouldShow && star.name) {
        console.log(`StarLabels: Label will show for star: ${star.name} (highlighted: ${star.isHighlighted}, selected: ${star.id === selectedStar}, hovered: ${star.id === hoveredStar})`);
        return true;
      }
      
      return false;
    });

    console.log(`StarLabels: Rendering ${filteredStars.length} labels after strict filtering`);
    
    return filteredStars;
  }, [stars, selectedStar, hoveredStar]);

  return (
    <>
      {labeledStars.map((star) => {
        // Calculate distance from camera to star
        const starPosition = new THREE.Vector3(...star.position);
        const distanceFromCamera = camera.position.distanceTo(starPosition);
        
        // FIXED: Determine star state and use REGULAR settings for hovered-only stars
        let starSettings = STAR_SETTINGS.regular;
        let isSpecialStar = false;
        
        if (star.id === selectedStar) {
          starSettings = STAR_SETTINGS.selected;
          isSpecialStar = true;
        } else if (star.isHighlighted) {
          starSettings = STAR_SETTINGS.highlighted;
          isSpecialStar = true;
        }
        // FIXED: For hovered-only stars (not highlighted or selected), use regular settings
        // This ensures the label is positioned close to the actual star, not a magnified version
        
        // Calculate actual star size based on magnitude and settings
        const baseMagnitudeSize = Math.max(0.02, Math.min(0.3, 0.25 * (6.0 - star.magnitude) * 0.2));
        
        // FIXED: Always use the appropriate settings for positioning
        const actualStarSize = baseMagnitudeSize * starSettings.sizeMultiplier;
        const glowRadius = actualStarSize * 2.5; // Glow is 2.5x star size
        
        // FIXED: Closer label positioning for all stars, especially hovered ones
        const labelOffset = Math.max(0.6, glowRadius * 0.5 + 0.2); // Reduced from 0.8 and 0.6 + 0.3
        const labelPosition: [number, number, number] = [
          star.position[0], 
          star.position[1] + labelOffset, 
          star.position[2]
        ];
        
        // Enhanced styling based on star state
        let fontSize: number;
        let fontWeight: number;
        
        if (star.isHighlighted) {
          // ENHANCED: Bigger labels for highlighted stars
          fontSize = Math.max(16, Math.min(22, 350 / distanceFromCamera));
          fontWeight = 600;
          
          console.log(`StarLabels: Highlighted star ${star.name || star.id} - size: ${actualStarSize.toFixed(3)}, offset: ${labelOffset.toFixed(2)}, fontSize: ${fontSize}`);
        } else if (star.id === selectedStar) {
          // Selected stars: Enhanced size
          fontSize = Math.max(14, Math.min(20, 300 / distanceFromCamera));
          fontWeight = 600;
          
          console.log(`StarLabels: Selected star ${star.name || star.id} - size: ${actualStarSize.toFixed(3)}, offset: ${labelOffset.toFixed(2)}, fontSize: ${fontSize}`);
        } else {
          // FIXED: Hovered stars use regular size for positioning and smaller font
          fontSize = Math.max(8, Math.min(16, 200 / distanceFromCamera));
          fontWeight = 300;
          
          console.log(`StarLabels: Hovered star ${star.name || star.id} - size: ${actualStarSize.toFixed(3)}, offset: ${labelOffset.toFixed(2)}, fontSize: ${fontSize}`);
        }

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
                color: '#F8FAFC', // Always white for all labels
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                opacity: 1.0, // Always fully visible for filtered stars
                textShadow: '0 0 4px rgba(0,0,0,0.8)', // Consistent shadow for all
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '0px', // No special letter spacing
                textAlign: 'center',
                padding: '0px', // No padding
                borderRadius: '0px', // No border radius
                backgroundColor: 'transparent', // No background
                border: 'none', // No border
                backdropFilter: 'none', // No backdrop filter
                boxShadow: 'none' // No box shadow
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