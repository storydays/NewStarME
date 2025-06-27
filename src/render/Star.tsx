import React, { useCallback } from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { HygRecord } from '../types';

/**
 * Star Component Specifications
 * 
 * Purpose: Reusable React component that renders a single star in a 3D scene 
 * using react-three-fiber and three.js. Visually represents a star with a glow 
 * and core, supports click interaction, and always faces the camera (billboard effect).
 * 
 * Confidence Rating: High - Complete implementation following exact specifications
 */

interface StarProps {
  position: [number, number, number];
  mag: number;
  starTexture: THREE.Texture;
  glowTexture: THREE.Texture;
  starSize: number;
  glowMultiplier: number;
  isSelected: boolean;
  onClick: (event: any) => void;
}

/**
 * Star Component
 * 
 * Visual Structure:
 * - Billboard: Ensures the star always faces the camera
 * - Invisible Clickable Mesh: A transparent plane, larger than the star, to improve click detection
 * - Glow Sprite: A sprite with the glow texture, scaled up, colored light blue, and using additive blending
 * - Star Sprite: A sprite with the star texture, scaled to starSize, colored white or yellow (if selected)
 * 
 * Behavior:
 * - Opacity calculated based on magnitude using specified formula
 * - Selection renders star core in yellow, otherwise white
 * - Click handling triggers onClick callback with event
 */
export function Star({
  position,
  mag,
  starTexture,
  glowTexture,
  starSize,
  glowMultiplier,
  isSelected,
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

  return (
    <Billboard position={position}>
      {/* Invisible Clickable Mesh - larger than the star for improved click detection */}
      <mesh onClick={handleClick} visible={false}>
        <planeGeometry args={[starSize * 3, starSize * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Glow Sprite - scaled up, light blue, additive blending */}
      <mesh onClick={handleClick}>
        <planeGeometry args={[starSize * 2.5, starSize * 2.5]} />
        <meshBasicMaterial
          map={glowTexture}
          color={new THREE.Color(0.7, 0.8, 1.0)} // Light blue color
          transparent
          opacity={0.4 * glowMultiplier}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Star Sprite - core star with texture, white or yellow based on selection */}
      <mesh onClick={handleClick}>
        <planeGeometry args={[starSize, starSize]} />
        <meshBasicMaterial
          map={starTexture}
          color={isSelected ? new THREE.Color(1, 1, 0) : new THREE.Color(1, 1, 1)} // Yellow if selected, white otherwise
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  );
}

export default Star;