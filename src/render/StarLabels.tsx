import React from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * StarLabels Component - Performance Optimized Label Rendering
 * 
 * Purpose: Renders star name labels with intelligent filtering for performance.
 * Prioritizes highlighted/selected stars and limits regular star labels by distance.
 * 
 * Features:
 * - Always-visible labels for highlighted/selected stars
 * - Distance-based filtering for regular stars
 * - Performance-optimized rendering (max 500 labels)
 * - Emotion-based styling for highlighted stars
 * - Smooth opacity transitions based on camera distance
 * 
 * Confidence Rating: High - Balanced approach between functionality and performance
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
}

export function StarLabels({ stars, selectedStar }: StarLabelsProps) {
  const { camera } = useThree();

  // Intelligent filtering for performance while maintaining functionality
  const labeledStars = React.useMemo(() => {
    // Separate stars by priority
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
    
    console.log(`StarLabels: Rendering ${result.length} labels (${priorityStars.length} priority, ${selectedRegularStars.length} regular) from ${stars.length} total stars`);
    
    return result;
  }, [stars, selectedStar, camera.position]);

  return (
    <>
      {labeledStars.map((star) => {
        // Calculate distance from camera to star
        const starPosition = new THREE.Vector3(...star.position);
        const distanceFromCamera = camera.position.distanceTo(starPosition);
        
        // Enhanced visibility for highlighted/selected stars
        let opacity: number;
        let fontSize: number;
        let fontWeight: number;
        let color: string;
        
        if (star.isHighlighted) {
          // Highlighted stars: Always visible with enhanced styling
          opacity = 1.0;
          fontSize = Math.max(14, Math.min(20, 300 / distanceFromCamera));
          fontWeight = 600;
          color = star.emotionColor || '#00FFFF';
        } else if (star.id === selectedStar) {
          // Selected stars: Enhanced visibility
          opacity = 1.0;
          fontSize = Math.max(12, Math.min(18, 250 / distanceFromCamera));
          fontWeight = 500;
          color = '#FFD700';
        } else {
          // Regular stars: Distance-based visibility with performance optimization
          opacity = Math.max(0.2, Math.min(1.0, (50 / distanceFromCamera)));
          fontSize = Math.max(8, Math.min(16, 200 / distanceFromCamera));
          fontWeight = 300;
          color = '#F8FAFC';
        }

        // Skip labels that would be too faint for performance
        if (opacity < 0.15) return null;

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