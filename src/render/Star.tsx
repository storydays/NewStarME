import React, { useCallback, useRef } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Star Component - Enhanced with Aurora Gradients for Star Selection
 * 
 * Purpose: Main dispatcher component that renders appropriate star type based on highlighting state.
 * Enhanced with aurora-inspired gradients for suggested stars and warm cosmic gradients for selected stars.
 * 
 * Features:
 * - Aurora gradient (#7FFF94 to #39FF14) for suggested stars
 * - Warm cosmic gradient (#FF69B4 to #8B0000) for selected stars
 * - 15-20% size reduction for suggested stars
 * - Enhanced glow effects for better visibility
 * - Conditional rendering based on isHighlighted prop
 * 
 * Confidence Rating: High - Enhanced existing system with gradient support
 */

interface BaseStarProps {
  position: [number, number, number];
  mag: number;
  starTexture: THREE.Texture;
  glowTexture: THREE.Texture;
  starSize: number;
  glowMultiplier: number;
  isSelected: boolean;
  onClick: (event: any) => void;
}

interface StarProps extends BaseStarProps {
  isHighlighted?: boolean;
  emotionColor?: string;
  isSuggested?: boolean; // NEW: Flag for suggested stars with aurora gradient
}

interface HighlightedStarProps extends BaseStarProps {
  emotionColor?: string;
  isSuggested?: boolean;
}

/**
 * RegularStar Component - Renders standard stars (non-highlighted)
 */
function RegularStar({
  position,
  mag,
  starTexture,
  glowTexture,
  starSize,
  glowMultiplier,
  isSelected,
  onClick
}: BaseStarProps) {
  
  const calculateOpacity = useCallback((magnitude: number): number => {
    const base = Math.max(0.3, Math.min(1.0, 1.2 - 0.07 * magnitude));
    return Math.max(0, Math.min(1, base * 1.0));
  }, []);

  const opacity = calculateOpacity(mag);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    console.log('RegularStar: Click detected on normal star');
    onClick(event);
  }, [onClick]);

  const normalGlowMultiplier = glowMultiplier * 2.0;

  const getStarColors = useCallback(() => {
    if (isSelected) {
      return {
        coreColor: new THREE.Color(1, 1, 0), // Yellow
        glowColor: new THREE.Color('#dbe6ff').multiplyScalar(normalGlowMultiplier),
        glowOpacity: 1.0,
        coreOpacity: opacity
      };
    } else {
      return {
        coreColor: new THREE.Color(1, 1, 1), // White
        glowColor: new THREE.Color('#dbe6ff').multiplyScalar(normalGlowMultiplier),
        glowOpacity: 1.0,
        coreOpacity: opacity
      };
    }
  }, [isSelected, opacity, normalGlowMultiplier]);

  const colors = getStarColors();

  return (
    <Billboard position={position}>
      <mesh onClick={handleClick} visible={false}>
        <planeGeometry args={[starSize, starSize]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <sprite scale={[starSize * 2.5, starSize * 2.5, starSize * 2.5]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          opacity={1.0}
          color={colors.glowColor}
          alphaTest={0.01}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      
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

/**
 * HighlightedStar Component - Enhanced with Aurora and Cosmic Gradients
 * 
 * Purpose: Specialized component for highlighted stars with gradient effects.
 * Features aurora gradients for suggested stars and warm cosmic gradients for selected stars.
 */
function HighlightedStar({
  position,
  mag,
  starTexture,
  glowTexture,
  starSize,
  glowMultiplier,
  isSelected,
  emotionColor,
  isSuggested = false,
  onClick
}: HighlightedStarProps) {
  
  const glowMaterialRef = useRef<THREE.SpriteMaterial>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const calculateOpacity = useCallback((magnitude: number): number => {
    const base = Math.max(0.3, Math.min(1.0, 1.2 - 0.07 * magnitude));
    return Math.max(0, Math.min(1, base * 1.0));
  }, []);

  const opacity = calculateOpacity(mag);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    console.log('HighlightedStar: Enhanced click detected on highlighted star');
    onClick(event);
  }, [onClick]);

  // Apply size reduction for suggested stars (15-20%)
  const sizeMultiplier = isSuggested ? 0.8 : 4.0; // 20% reduction for suggested, 400% for others
  const enhancedStarSize = starSize * sizeMultiplier;
  const enhancedGlowMultiplier = glowMultiplier * (isSuggested ? 1.5 : 4.0); // Enhanced glow for suggested

  const getStarColors = useCallback(() => {
    if (isSelected) {
      // Selected: Warm cosmic gradient (#FF69B4 to #8B0000)
      return {
        coreColor: new THREE.Color('#FF69B4'), // Hot pink
        glowColor: new THREE.Color('#8B0000').multiplyScalar(enhancedGlowMultiplier), // Dark red glow
        baseCoreOpacity: opacity
      };
    } else if (isSuggested) {
      // Suggested: Aurora gradient (#7FFF94 to #39FF14)
      return {
        coreColor: new THREE.Color('#7FFF94'), // Aurora green start
        glowColor: new THREE.Color('#39FF14').multiplyScalar(enhancedGlowMultiplier), // Aurora green end
        baseCoreOpacity: Math.max(opacity, 0.9)
      };
    } else {
      // Regular highlighted: Emotion-based color
      const emotionColorObj = emotionColor ? new THREE.Color(emotionColor) : new THREE.Color(0, 1, 1);
      
      return {
        coreColor: emotionColorObj,
        glowColor: emotionColorObj.clone().multiplyScalar(enhancedGlowMultiplier),
        baseCoreOpacity: Math.max(opacity, 0.9)
      };
    }
  }, [isSelected, isSuggested, emotionColor, opacity, enhancedGlowMultiplier]);

  const colors = getStarColors();

  // Enhanced pulsing animation for suggested and selected stars
  useFrame((state) => {
    if (glowMaterialRef.current && coreMaterialRef.current) {
      const time = state.clock.elapsedTime;
      const pulseSpeed = isSuggested ? 1.5 : (isSelected ? 2.5 : 2.0); // Different speeds
      const pulseIntensity = isSuggested ? 0.2 : (isSelected ? 0.4 : 0.3); // Different intensities
      
      const pulseMultiplier = 1.0 + Math.sin(time * pulseSpeed) * pulseIntensity;
      
      // Apply pulsing to glow color intensity
      glowMaterialRef.current.color = colors.glowColor.clone().multiplyScalar(pulseMultiplier);
      
      // Subtle pulsing on core
      coreMaterialRef.current.opacity = colors.baseCoreOpacity * (1.0 + Math.sin(time * pulseSpeed) * 0.1);
    }
  });

  return (
    <Billboard position={position}>
      <mesh onClick={handleClick} visible={false}>
        <planeGeometry args={[enhancedStarSize, enhancedStarSize]} />
        <meshBasicMaterial transparent opacity={0} visible={false} />
      </mesh>

      {/* Enhanced glow sprite with gradient-based colors */}
      <sprite scale={[enhancedStarSize * 2.5, enhancedStarSize * 2.5, enhancedStarSize * 2.5]}>
        <spriteMaterial
          ref={glowMaterialRef}
          map={glowTexture}
          transparent
          depthWrite={false}
          opacity={1.0}
          color={colors.glowColor}
          alphaTest={0.01}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Star sprite with gradient colors */}
      <sprite scale={[starSize*2, starSize*2, starSize*2]}>
        <spriteMaterial
          ref={coreMaterialRef}
          map={starTexture}
          transparent
          depthWrite={false}
          opacity={colors.baseCoreOpacity * (1.0 + Math.sin(0) * 0.1)}
          color={colors.coreColor}
          alphaTest={0.1}
          blending={THREE.AdditiveBlending} 
        />
      </sprite>
    </Billboard>
  );
}

/**
 * Main Star Component - Enhanced dispatcher with gradient support
 */
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
  isSuggested = false, // NEW: Support for suggested star styling
  onClick
}: StarProps) {
  
  console.log(`Star: Rendering ${isHighlighted ? 'highlighted' : 'normal'} star${isSuggested ? ' (suggested)' : ''} at position [${position.join(', ')}]`);

  if (isHighlighted) {
    return (
      <HighlightedStar
        position={position}
        mag={mag}
        starTexture={starTexture}
        glowTexture={glowTexture}
        starSize={starSize}
        glowMultiplier={glowMultiplier}
        isSelected={isSelected}
        emotionColor={emotionColor}
        isSuggested={isSuggested}
        onClick={onClick}
      />
    );
  } else {
    return (
      <RegularStar
        position={position}
        mag={mag}
        starTexture={starTexture}
        glowTexture={glowTexture}
        starSize={starSize}
        glowMultiplier={glowMultiplier}
        isSelected={isSelected}
        onClick={onClick}
      />
    );
  }
}

export default Star;