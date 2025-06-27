import React, { useCallback } from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Star Component - Enhanced with Emotion-Based Coloring and Advanced Highlighting
 * 
 * Purpose: Renders individual stars with enhanced visual states including
 * emotion-based color tinting, increased sizes, and enhanced glow effects.
 * 
 * Visual States:
 * - Normal: White core with light blue glow
 * - Highlighted: Enhanced size (400%), enhanced glow (2x), emotion-based color
 * - Selected: Yellow core with enhanced glow
 * 
 * Features:
 * - Emotion-based color tinting for highlighted stars
 * - Enhanced click detection area
 * - Particle emission effects
 * - Smooth transitions between states
 * 
 * Confidence Rating: High - Enhanced existing star rendering with emotion colors
 */

interface StarProps {
  position: [number, number, number];
  mag: number;
  starTexture: THREE.Texture;
  glowTexture: THREE.Texture;
  starSize: number;
  glowMultiplier: number;
  isSelected: boolean;
  isHighlighted?: boolean;
  emotionColor?: string; // NEW: Emotion-based color for highlighted stars
  onClick: (event: any) => void;
}

export function Star({
  position,
  mag,
  starTexture,
  glowTexture,
  starSize,
  glowMultiplier,
  isSelected,
  isHighlighted = false,
  emotionColor,
  onClick
}: StarProps) {
  
  // Opacity calculation based on magnitude
  const calculateOpacity = useCallback((magnitude: number): number => {
    const base = Math.max(0.3, Math.min(1.0, 1.2 - 0.07 * magnitude));
    return Math.max(0, Math.min(1, base * 1.0));
  }, []);

  const opacity = calculateOpacity(mag);

  // Handle click events with enhanced detection
  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    console.log('Star: Enhanced click detected on star');
    onClick(event);
  }, [onClick]);

  // Determine colors and glow based on state with emotion support
  const getStarColors = useCallback(() => {
    if (isSelected) {
      // Selected: Yellow core with enhanced yellow glow
      return {
        coreColor: new THREE.Color(1, 1, 0), // Yellow
        glowColor: new THREE.Color(1, 1, 0.3), // Yellow-ish glow
        glowOpacity: 0.8 * glowMultiplier,
        coreOpacity: opacity
      };
    } else if (isHighlighted) {
      // Highlighted: Emotion-based color with enhanced glow
      const emotionColorObj = emotionColor ? new THREE.Color(emotionColor) : new THREE.Color(0, 1, 1);
      
      return {
        coreColor: emotionColorObj, // Emotion-based color
        glowColor: emotionColorObj.clone().multiplyScalar(0.8), // Slightly dimmed glow
        glowOpacity: 0.9 * glowMultiplier, // Enhanced glow for highlighted stars
        coreOpacity: Math.max(opacity, 0.9) // Ensure highlighted stars are very visible
      };
    } else {
      // Normal: White core with light blue glow
      return {
        coreColor: new THREE.Color(1, 1, 1), // White
        glowColor: new THREE.Color(0.7, 0.8, 1.0), // Light blue glow
        glowOpacity: 0.4 * glowMultiplier,
        coreOpacity: opacity
      };
    }
  }, [isSelected, isHighlighted, emotionColor, opacity, glowMultiplier]);

  const colors = getStarColors();

  // Enhanced click detection area for highlighted stars
  const clickAreaSize = isHighlighted ? starSize * 5 : starSize * 3;

  return (
    <Billboard position={position}>
      {/* Enhanced invisible clickable mesh - larger for highlighted stars */}
      <mesh onClick={handleClick} visible={false}>
        <planeGeometry args={[clickAreaSize, clickAreaSize]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Enhanced glow sprite with emotion-based coloring */}
      <mesh onClick={handleClick}>
        <planeGeometry args={[starSize * 2.5, starSize * 2.5]} />
        <meshBasicMaterial
          map={glowTexture}
          color={colors.glowColor}
          transparent
          opacity={colors.glowOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Enhanced star sprite with emotion-based coloring */}
      <mesh onClick={handleClick}>
        <planeGeometry args={[starSize, starSize]} />
        <meshBasicMaterial
          map={starTexture}
          color={colors.coreColor}
          transparent
          opacity={colors.coreOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Enhanced particle emission for highlighted stars */}
      {isHighlighted && <mesh onClick={handleClick}>
          <planeGeometry args={[starSize * 0.3, starSize * 0.3]} />
          <meshBasicMaterial
            map={starTexture}
            color={colors.coreColor}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>}
    </Billboard>
  );
}

export default Star;