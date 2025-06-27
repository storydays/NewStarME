import React, { useCallback } from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { HygRecord } from '../types';

/**
 * Star Component Specifications - Enhanced with highlighting support
 * 
 * Purpose: Reusable React component that renders a single star in a 3D scene 
 * using react-three-fiber and three.js. Visually represents a star with a glow 
 * and core, supports click interaction, and always faces the camera (billboard effect).
 * Now supports highlighting with distinct visual treatment.
 * 
 * Visual States:
 * - Normal: White core with light blue glow
 * - Highlighted: Cyan/light blue core with enhanced cyan glow
 * - Selected: Yellow core with enhanced glow
 * 
 * Confidence Rating: High - Adding highlighting to existing star rendering
 */

interface StarProps {
  position: [number, number, number];
  mag: number;
  starTexture: THREE.Texture;
  glowTexture: THREE.Texture;
  starSize: number;
  glowMultiplier: number;
  isSelected: boolean;
  isHighlighted?: boolean; // NEW: Highlighting flag
  onClick: (event: any) => void;
}

/**
 * Star Component
 * 
 * Visual Structure:
 * - Billboard: Ensures the star always faces the camera
 * - Invisible Clickable Mesh: A transparent plane, larger than the star, to improve click detection
 * - Glow Sprite: A sprite with the glow texture, scaled up, colored based on state, and using additive blending
 * - Star Sprite: A sprite with the star texture, scaled to starSize, colored based on state
 * 
 * Behavior:
 * - Opacity calculated based on magnitude using specified formula
 * - Selection renders star core in yellow, highlighting in cyan, otherwise white
 * - Click handling triggers onClick callback with event
 * - Enhanced glow for highlighted and selected states
 */
export function Star({
  position,
  mag,
  starTexture,
  glowTexture,
  starSize,
  glowMultiplier,
  isSelected,
  isHighlighted = false, // NEW: Default to false
  onClick
}: StarProps) {
  
  // Opacity Calculation: Formula as specified in requirements
  const calculateOpacity = useCallback((magnitude: number): number => {
    const base = Math.max(0.3, Math.min(1.0, 1.2 - 0.07 * magnitude));
    return Math.max(0, Math.min(1, base * 1.0));
  }, []);

  const opacity = calculateOpacity(mag);

  // Handle click events
  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onClick(event);
  }, [onClick]);

  // Determine colors and glow based on state
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
      // Highlighted: Cyan core with enhanced cyan glow
      return {
        coreColor: new THREE.Color(0, 1, 1), // Cyan
        glowColor: new THREE.Color(0.3, 0.8, 1.0), // Light blue glow
        glowOpacity: 0.7 * glowMultiplier,
        coreOpacity: Math.max(opacity, 0.8) // Ensure highlighted stars are visible
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
  }, [isSelected, isHighlighted, opacity, glowMultiplier]);

  const colors = getStarColors();

  return (
    <Billboard position={position}>
      {/* Invisible Clickable Mesh - larger than the star for improved click detection */}
      <mesh onClick={handleClick} visible={false}>
        <planeGeometry args={[starSize * 3, starSize * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Glow Sprite - scaled up, colored based on state, additive blending */}
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
      
      {/* Star Sprite - core star with texture, colored based on state */}
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
    </Billboard>
  );
}

export default Star;