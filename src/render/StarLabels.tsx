import React from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * StarLabels Component - Enhanced with Always-Visible Highlighted Star Names
 * 
 * Purpose: Renders star name labels with enhanced visibility for highlighted stars
 * and emotion-based styling. Always shows labels for highlighted stars regardless
 * of distance or magnitude.
 * 
 * Features:
 * - Always-visible labels for highlighted stars
 * - Emotion-based color styling
 * - Enhanced font sizing and visibility
 * - Camera-facing orientation
 * - UPDATED: Removed magnitude filtering to show all named stars
 * 
 * Confidence Rating: High - Enhanced existing label system with highlighting support
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

  // Filter and prepare stars for labeling with enhanced highlighting
  // REMOVED: Magnitude filtering - show ALL named stars
  const labeledStars = stars.filter(star => {
    // Always show labels for highlighted stars
    if (star.isHighlighted && star.name) {
      return true;
    }
    
    // Show labels for selected stars
    if (star.id === selectedStar && star.name) {
      return true;
    }
    
    // REMOVED: Magnitude filtering - show all named stars
    return star.name && star.name.trim() !== '';
  }); // REMOVED: .slice(0, 50) limit

  console.log(`StarLabels: Rendering ${labeledStars.length} labels (${labeledStars.filter(s => s.isHighlighted).length} highlighted) from ${stars.length} total stars`);

  return (
    <>
      {labeledStars.map((star) => {
        // Calculate distance from camera to star
        const starPosition = new THREE.Vector3(...star.position);
        const distanceFromCamera = camera.position.distanceTo(starPosition);
        
        // Enhanced visibility for highlighted stars
        let opacity: number;
        let fontSize: number;
        let fontWeight: number;
        let color: string;
        
        if (star.isHighlighted) {
          // Highlighted stars: Always visible with enhanced styling
          opacity = 1.0; // Always fully visible
          fontSize = Math.max(14, Math.min(20, 300 / distanceFromCamera)); // Larger font
          fontWeight = 600; // Bold font
          color = star.emotionColor || '#00FFFF'; // Emotion color or cyan
          
          console.log(`StarLabels: Enhanced label for highlighted star: ${star.name}`);
        } else if (star.id === selectedStar) {
          // Selected stars: Enhanced visibility
          opacity = 1.0;
          fontSize = Math.max(12, Math.min(18, 250 / distanceFromCamera));
          fontWeight = 500;
          color = '#FFD700'; // Gold for selected
        } else {
          // Normal stars: Distance-based visibility but more lenient
          opacity = Math.max(0.2, Math.min(1.0, (50 / distanceFromCamera))); // UPDATED: More lenient opacity calculation
          fontSize = Math.max(8, Math.min(16, 200 / distanceFromCamera));
          fontWeight = 300;
          color = '#F8FAFC'; // White for normal
        }

        // REMOVED: Skip labels that would be too faint - show all labels now
        // Only skip if completely invisible
        if (opacity < 0.1) return null;

        return (
          <Html
            key={`label-${star.id}`}
            position={[star.position[0], star.position[1] + 0.8, star.position[2]]} // Slightly higher position
            center
            distanceFactor={8} // Reduced for better visibility
            occlude={false} // Don't hide labels behind objects for highlighted stars
          >
            <div 
              style={{
                color: color,
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                opacity: opacity,
                textShadow: star.isHighlighted 
                  ? `0 0 8px ${color}, 0 0 16px ${color}40` // Enhanced glow for highlighted
                  : '0 0 4px rgba(0,0,0,0.8)', // Standard shadow
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: star.isHighlighted ? '0.5px' : '0px', // Enhanced spacing for highlighted
                textAlign: 'center',
                padding: star.isHighlighted ? '2px 6px' : '0px', // Padding for highlighted
                borderRadius: star.isHighlighted ? '4px' : '0px',
                backgroundColor: star.isHighlighted 
                  ? `${color}20` // Semi-transparent background for highlighted
                  : 'transparent',
                border: star.isHighlighted 
                  ? `1px solid ${color}40` // Subtle border for highlighted
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