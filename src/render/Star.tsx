import React, { useCallback, useRef } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Star Component - Enhanced with Bigger Suggested/Selected Stars and Purple Selected Stars
 * 
 * Purpose: Main dispatcher component that renders appropriate star type based on highlighting state.
 * Enhanced with bigger sizes for suggested/selected stars and purple-ish tones for selected stars.
 * 
 * Features:
 * - Aurora gradient (#7FFF94 to #39FF14) for suggested stars with bigger size
 * - Purple-ish gradient (#9D4EDD to #6A0572) for selected stars with bigger size
 * - Enhanced glow effects for better visibility
 * - Conditional rendering based on isHighlighted prop
 * 
 * Confidence Rating: High - Enhanced existing system with bigger stars and purple selection
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
  isSuggested?: boolean;
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
 * HighlightedStar Component - Enhanced with Bigger Stars and Purple Selection
 * 
 * Purpose: Specialized component for highlighted stars with enhanced size and purple selection.
 * Features aurora gradients for suggested stars and purple gradients for selected stars.
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

  // ENHANCED: Bigger sizes for both suggested and selected stars
  const sizeMultiplier = isSuggested ? 2.5 : (isSelected ? 3.0 : 4.0); // Bigger for suggested (2.5x), even bigger for selected (3x)
  const enhancedStarSize = starSize * sizeMultiplier;
  const enhancedGlowMultiplier = glowMultiplier * (isSuggested ? 2.0 : (isSelected ? 2.5 : 4.0)); // Enhanced glow

  const getStarColors = useCallback(() => {
    if (isSelected) {
      // ENHANCED: Purple-ish gradient for selected stars (#9D4EDD to #6A0572)
      return {
        coreColor: new THREE.Color('#9D4EDD'), // Purple start
        glowColor: new THREE.Color('#6A0572').multiplyScalar(enhancedGlowMultiplier), // Dark purple glow
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

  // Enhanced pulsing animation with different effects for selected vs suggested
  useFrame((state) => {
    if (glowMaterialRef.current && coreMaterialRef.current) {
      const time = state.clock.elapsedTime;
      
      if (isSelected) {
        // Selected stars: Slower, more dramatic pulsing with purple tones
        const pulseSpeed = 1.8;
        const pulseIntensity = 0.5;
        const pulseMultiplier = 1.0 + Math.sin(time * pulseSpeed) * pulseIntensity;
        
        glowMaterialRef.current.color = colors.glowColor.clone().multiplyScalar(pulseMultiplier);
        coreMaterialRef.current.opacity = colors.baseCoreOpacity * (1.0 + Math.sin(time * pulseSpeed) * 0.15);
      } else if (isSuggested) {
        // Suggested stars: Gentle aurora-like pulsing
        const pulseSpeed = 1.2;
        const pulseIntensity = 0.3;
        const pulseMultiplier = 1.0 + Math.sin(time * pulseSpeed) * pulseIntensity;
        
        glowMaterialRef.current.color = colors.glowColor.clone().multiplyScalar(pulseMultiplier);
        coreMaterialRef.current.opacity = colors.baseCoreOpacity * (1.0 + Math.sin(time * pulseSpeed) * 0.1);
      } else {
        // Regular highlighted: Standard pulsing
        const pulseSpeed = 2.0;
        const pulseIntensity = 0.3;
        const pulseMultiplier = 1.0 + Math.sin(time * pulseSpeed) * pulseIntensity;
        
        glowMaterialRef.current.color = colors.glowColor.clone().multiplyScalar(pulseMultiplier);
        coreMaterialRef.current.opacity = colors.baseCoreOpacity * (1.0 + Math.sin(time * pulseSpeed) * 0.1);
      }
    }
  });

  return (
    <Billboard position={position}>
      <mesh onClick={handleClick} visible={false}>
        <planeGeometry args={[enhancedStarSize, enhancedStarSize]} />
        <meshBasicMaterial transparent opacity={0} visible={false} />
      </mesh>

      {/* Enhanced glow sprite with bigger size and color-specific effects */}
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

      {/* Star sprite with enhanced size */}
      <sprite scale={[starSize*2.5, starSize*2.5, starSize*2.5]}>
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
 * Main Star Component - Enhanced dispatcher with bigger stars and purple selection
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
  isSuggested = false,
  onClick
}: StarProps) {
  
  console.log(`Star: Rendering ${isHighlighted ? 'highlighted' : 'normal'} star${isSuggested ? ' (suggested)' : ''}${isSelected ? ' (SELECTED - PURPLE)' : ''} at position [${position.join(', ')}]`);

  if (isHighlighted || isSelected) {
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