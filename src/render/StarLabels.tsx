import React from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * StarLabels Component
 * 
 * Purpose: Renders star name labels in 3D space with distance and magnitude-based styling.
 * 
 * Features:
 * - Distance-based opacity calculation
 * - Magnitude-based filtering (only bright stars get labels)
 * - Performance optimized with limited label count
 * - Responsive font sizing based on camera distance
 * 
 * Confidence Rating: High - Complete implementation with performance considerations
 */

interface StarLabelsProps {
  stars: Array<{
    id: string;
    position: [number, number, number];
    magnitude: number;
    name?: string;
  }>;
  selectedStar?: string | null;
}

export function StarLabels({ stars, selectedStar }: StarLabelsProps) {
  const { camera } = useThree();

  // Filter stars that should have labels (only named stars with good visibility)
  const labeledStars = stars.filter(star => 
    star.name && 
    star.name.trim() !== '' &&
    star.magnitude < 4.0 // Only show labels for bright stars
  ).slice(0, 30); // Limit number of labels for performance

  return (
    <>
      {labeledStars.map((star) => {
        // Calculate distance from camera to star
        const starPosition = new THREE.Vector3(...star.position);
        const distanceFromCamera = camera.position.distanceTo(starPosition);
        
        // Calculate label opacity based on distance and magnitude
        const opacity = Math.max(0.3, Math.min(1.0, (30 / distanceFromCamera) * (4.0 - star.magnitude) / 4.0));
        
        // Calculate label size based on distance
        const fontSize = Math.max(8, Math.min(16, 200 / distanceFromCamera));

        // Skip labels that would be too faint
        if (opacity < 0.3) return null;

        // Highlight selected star label
        const isSelected = star.id === selectedStar;

        return (
          <Html
            key={`label-${star.id}`}
            position={[star.position[0], star.position[1] + 0.5, star.position[2]]}
            center
            distanceFactor={10}
            occlude
          >
            <div 
              style={{
                color: isSelected ? '#FFD700' : '#F8FAFC', // Gold for selected, white for others
                fontSize: `${fontSize}px`,
                fontWeight: isSelected ? 500 : 300,
                opacity: opacity,
                textShadow: '0 0 4px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
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