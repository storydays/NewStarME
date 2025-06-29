import React from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STAR_COLORS } from '../config/starColors';

/**
 * StarLabels Component - Enhanced with Simplified Color Configuration
 * 
 * Purpose: Renders star name labels with simplified color management.
 * Classic mode prioritizes visual quality, instanced mode prioritizes performance.
 * 
 * Features:
 * - Mode-aware filtering and rendering strategies
 * - Classic mode: Enhanced visibility and effects
 * - Instanced mode: Performance-optimized with distance culling
 * - Always-visible labels for highlighted/selected stars
 * - Simplified color configuration from starColors.ts
 * 
 * Confidence Rating: High - Enhanced with simplified color management
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
  renderingMode?: 'classic' | 'instanced';
}

export function StarLabels({ 
  stars, 
  selectedStar, 
  renderingMode = 'classic'
}: StarLabelsProps) {
  const { camera } = useThree();

  // Mode-aware label filtering and processing
  const labeledStars = React.useMemo(() => {
    if (renderingMode === 'classic') {
      // Classic mode: Enhanced filtering with priority for highlighted/selected stars
      const priorityStars: typeof stars = [];
      const regularStars: typeof stars = [];
      
      stars.forEach(star => {
        if (star.isHighlighted || star.id === selectedStar) {
          priorityStars.push(star);
        } else if (star.name && star.name.trim() !== '' && star.magnitude < 4.0) {
          regularStars.push(star);
        }
      });

      // Take all priority stars + bright regular stars (limit 50 total)
      const result = [...priorityStars, ...regularStars.slice(0, Math.max(0, 50 - priorityStars.length))];
      
      console.log(`StarLabels: Classic mode - rendering ${result.length} labels (${priorityStars.length} priority, ${result.length - priorityStars.length} regular)`);
      
      return result;
    } else {
      // Instanced mode: Performance-optimized filtering
      const priorityStars: typeof stars = [];
      const regularStars: typeof stars = [];
      
      stars.forEach(star => {
        if (star.isHighlighted || star.id === selectedStar) {
          priorityStars.push(star);
        } else if (star.name && star.name.trim() !== '') {
          regularStars.push(star);
        }
      });

      // Calculate distances for regular stars and sort by proximity
      const regularStarsWithDistance = regularStars.map(star => {
        const starPosition = new THREE.Vector3(...star.position);
        const distance = camera.position.distanceTo(starPosition);
        return { ...star, distance };
      }).sort((a, b) => a.distance - b.distance);

      // Take priority stars + closest regular stars (limit for performance)
      const maxRegularLabels = Math.max(0, 500 - priorityStars.length);
      const selectedRegularStars = regularStarsWithDistance
        .slice(0, maxRegularLabels)
        .map(({ distance, ...star }) => star);

      const result = [...priorityStars, ...selectedRegularStars];
      
      console.log(`StarLabels: Instanced mode - rendering ${result.length} labels (${priorityStars.length} priority, ${selectedRegularStars.length} regular) from ${stars.length} total stars`);
      
      return result;
    }
  }, [stars, selectedStar, camera.position, renderingMode]);

  return (
    <>
      {labeledStars.map((star) => {
        // Calculate distance from camera to star
        const starPosition = new THREE.Vector3(...star.position);
        const distanceFromCamera = camera.position.distanceTo(starPosition);
        
        // Mode-aware styling and visibility with simplified colors
        let opacity: number;
        let fontSize: number;
        let fontWeight: number;
        let color: string;
        let opacityThreshold: number;
        
        if (star.isHighlighted) {
          // Highlighted stars: Always visible with enhanced styling using simplified colors
          opacity = 1.0;
          fontSize = Math.max(14, Math.min(20, 300 / distanceFromCamera));
          fontWeight = 600;
          color = star.emotionColor || STAR_COLORS.suggested; // Use simplified color
          opacityThreshold = 0; // Never skip highlighted stars
        } else if (star.id === selectedStar) {
          // Selected stars: Enhanced visibility using simplified colors
          opacity = 1.0;
          fontSize = Math.max(12, Math.min(18, 250 / distanceFromCamera));
          fontWeight = 500;
          color = STAR_COLORS.selected; // Use simplified color
          opacityThreshold = 0; // Never skip selected stars
        } else {
          // Regular stars: Mode-aware calculations using simplified colors
          if (renderingMode === 'classic') {
            // Classic mode: Enhanced visibility for better user experience
            opacity = Math.max(0.3, Math.min(1.0, (30 / distanceFromCamera) * (4.0 - star.magnitude) / 4.0));
            fontSize = Math.max(8, Math.min(16, 200 / distanceFromCamera));
            fontWeight = 300;
            color = STAR_COLORS.normal; // Use simplified color
            opacityThreshold = 0.3;
          } else {
            // Instanced mode: Performance-optimized calculations
            opacity = Math.max(0.2, Math.min(1.0, (50 / distanceFromCamera)));
            fontSize = Math.max(8, Math.min(16, 200 / distanceFromCamera));
            fontWeight = 300;
            color = STAR_COLORS.normal; // Use simplified color
            opacityThreshold = 0.15;
          }
        }

        // Skip labels that would be too faint
        if (opacity < opacityThreshold) return null;

        return (
          <Html
            key={`label-${star.id}`}
            position={[star.position[0], star.position[1] + 0.8, star.position[2]]}
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
                textShadow: star.isHighlighted 
                  ? `0 0 8px ${color}, 0 0 16px ${color}40`
                  : '0 0 4px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: star.isHighlighted ? '0.5px' : '0px',
                textAlign: 'center',
                padding: star.isHighlighted ? '2px 6px' : '0px',
                borderRadius: star.isHighlighted ? '4px' : '0px',
                backgroundColor: star.isHighlighted 
                  ? `${color}20`
                  : 'transparent',
                border: star.isHighlighted 
                  ? `1px solid ${color}40`
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