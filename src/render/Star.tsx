import React, { useCallback, useRef } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STAR_COLORS } from '../config/starColors';

/**
 * Star Component - Enhanced with Simplified Color Configuration
 * 
 * Purpose: Main dispatcher component that renders appropriate star type based on highlighting state.
 * UPDATED: Uses simplified STAR_COLORS configuration with direct color values.
 * 
 * Features:
 * - Simplified color configuration from STAR_COLORS
 * - Aurora green for suggested stars with bigger size
 * - Purple for selected stars with bigger size
 * - Enhanced glow effects for better visibility
 * - React.memo optimization to prevent unnecessary re-renders
 * 
 * Confidence Rating: High - Enhanced with simplified color management
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
 * RegularStar Component - Enhanced with simplified colors
 */
const RegularStar = React.memo(function RegularStar({
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
    onClick(event);
  }, [onClick]);

  const normalGlowMultiplier = glowMultiplier * 2.0;

  const getStarColors = useCallback(() => {
    if (isSelected) {
      return {
        coreColor: new THREE.Color(STAR_COLORS.selected),
        glowColor: new THREE.Color(STAR_COLORS.selected).multiplyScalar(normalGlowMultiplier),
        glowOpacity: 1.0,
        coreOpacity: opacity
      };
    } else {
      return {
        coreColor: new THREE.Color(STAR_COLORS.normal),
        glowColor: new THREE.Color(STAR_COLORS.normal).multiplyScalar(normalGlowMultiplier),
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
});

/**
 * HighlightedStar Component - Enhanced with simplified colors
 */
const HighlightedStar = React.memo(function HighlightedStar({
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
    onClick(event);
  }, [onClick]);

  // Enhanced sizes for both suggested and selected stars
  const sizeMultiplier = isSuggested ? 2.5 : (isSelected ? 3.0 : 4.0);
  const enhancedStarSize = starSize * sizeMultiplier;
  const enhancedGlowMultiplier = glowMultiplier * (isSuggested ? 2.0 : (isSelected ? 2.5 : 4.0));

  const getStarColors = useCallback(() => {
    if (isSelected) {
      // Selected: Purple from simplified config
      return {
        coreColor: new THREE.Color(STAR_COLORS.selected),
        glowColor: new THREE.Color(STAR_COLORS.selected).multiplyScalar(enhancedGlowMultiplier),
        baseCoreOpacity: opacity
      };
    } else if (isSuggested) {
      // Suggested: Aurora green from simplified config
      return {
        coreColor: new THREE.Color(STAR_COLORS.suggested),
        glowColor: new THREE.Color(STAR_COLORS.suggested).multiplyScalar(enhancedGlowMultiplier),
        baseCoreOpacity: Math.max(opacity, 0.9)
      };
    } else {
      // Regular highlighted: Emotion-based color or fallback to suggested
      const emotionColorObj = emotionColor ? new THREE.Color(emotionColor) : new THREE.Color(STAR_COLORS.suggested);
      
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

      {/* Enhanced glow sprite with simplified colors */}
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

      {/* Star sprite with simplified colors */}
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
});

/**
 * Main Star Component - Enhanced dispatcher with simplified color management
 */
export const Star = React.memo(function Star({
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
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1] &&
    prevProps.position[2] === nextProps.position[2] &&
    prevProps.mag === nextProps.mag &&
    prevProps.starSize === nextProps.starSize &&
    prevProps.glowMultiplier === nextProps.glowMultiplier &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.emotionColor === nextProps.emotionColor &&
    prevProps.isSuggested === nextProps.isSuggested &&
    prevProps.starTexture === nextProps.starTexture &&
    prevProps.glowTexture === nextProps.glowTexture
  );
});

export default Star;