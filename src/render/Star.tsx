import React, { useCallback, useRef, useState } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STAR_SETTINGS } from '../config/starConfig';

/**
 * Star Component - Enhanced with Hover State Support
 * 
 * Purpose: Main dispatcher component that renders appropriate star type based on highlighting state.
 * ENHANCED: Added hover state management for interactive label display.
 * 
 * Features:
 * - STAR_SETTINGS configuration with size and glow multipliers
 * - Three categories: regular, highlighted (suggested), selected
 * - Enhanced glow effects with configurable multipliers
 * - Hover state support for interactive labels
 * - React.memo optimization to prevent unnecessary re-renders
 * 
 * Confidence Rating: High - Enhanced with hover state support
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
  onHover?: (isHovering: boolean) => void; // NEW: Hover callback
}

interface StarProps extends BaseStarProps {
  isHighlighted?: boolean;
  emotionColor?: string;
}

interface HighlightedStarProps extends BaseStarProps {
  emotionColor?: string;
}

/**
 * RegularStar Component - Enhanced with hover support
 */
const RegularStar = React.memo(function RegularStar({
  position,
  mag,
  starTexture,
  glowTexture,
  starSize,
  glowMultiplier,
  isSelected,
  onClick,
  onHover
}: BaseStarProps) {
  
  const [isHovered, setIsHovered] = useState(false);
  
  const calculateOpacity = useCallback((magnitude: number): number => {
    const base = Math.max(0.3, Math.min(1.0, 1.2 - 0.07 * magnitude));
    return Math.max(0, Math.min(1, base * 1.0));
  }, []);

  const opacity = calculateOpacity(mag);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onClick(event);
  }, [onClick]);

  // NEW: Handle hover events
  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
    if (onHover) {
      onHover(true);
    }
  }, [onHover]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    if (onHover) {
      onHover(false);
    }
  }, [onHover]);

  const getStarColors = useCallback(() => {
    if (isSelected) {
      return {
        coreColor: new THREE.Color(STAR_SETTINGS.selected.color),
        glowColor: new THREE.Color(STAR_SETTINGS.selected.color).multiplyScalar(glowMultiplier * STAR_SETTINGS.selected.glowMultiplier),
        glowOpacity: 1.0,
        coreOpacity: opacity
      };
    } else if (isHovered) {
      // Use highlighted colors for hovered stars
      return {
        coreColor: new THREE.Color(STAR_SETTINGS.highlighted.color),
        glowColor: new THREE.Color(STAR_SETTINGS.highlighted.color).multiplyScalar(glowMultiplier * STAR_SETTINGS.highlighted.glowMultiplier),
        glowOpacity: 1.0,
        coreOpacity: opacity
      };
    } else {
      return {
        coreColor: new THREE.Color(STAR_SETTINGS.regular.color),
        glowColor: new THREE.Color(STAR_SETTINGS.regular.color).multiplyScalar(glowMultiplier * STAR_SETTINGS.regular.glowMultiplier),
        glowOpacity: 1.0,
        coreOpacity: opacity
      };
    }
  }, [isSelected, isHovered, opacity, glowMultiplier]);

  const colors = getStarColors();

  return (
    <Billboard position={position}>
      <mesh 
        onClick={handleClick} 
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        visible={false}
      >
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
      
      <mesh 
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
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
 * HighlightedStar Component - Enhanced with hover support
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
  onClick,
  onHover
}: HighlightedStarProps) {
  
  const glowMaterialRef = useRef<THREE.SpriteMaterial>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const [isHovered, setIsHovered] = useState(false);

  const calculateOpacity = useCallback((magnitude: number): number => {
    const base = Math.max(0.3, Math.min(1.0, 1.2 - 0.07 * magnitude));
    return Math.max(0, Math.min(1, base * 1.0));
  }, []);

  const opacity = calculateOpacity(mag);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onClick(event);
  }, [onClick]);

  // NEW: Handle hover events
  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
    if (onHover) {
      onHover(true);
    }
  }, [onHover]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    if (onHover) {
      onHover(false);
    }
  }, [onHover]);

  // Enhanced sizes using STAR_SETTINGS
  const finalSettings = isSelected ? STAR_SETTINGS.selected : STAR_SETTINGS.highlighted;
  const enhancedStarSize = starSize * finalSettings.sizeMultiplier;
  const enhancedGlowMultiplier = glowMultiplier * finalSettings.glowMultiplier;

  const getStarColors = useCallback(() => {
    if (isSelected) {
      return {
        coreColor: new THREE.Color(STAR_SETTINGS.selected.color),
        glowColor: new THREE.Color(STAR_SETTINGS.selected.color).multiplyScalar(enhancedGlowMultiplier),
        baseCoreOpacity: opacity
      };
    } else {
      // Highlighted: Use highlighted settings
      return {
        coreColor: new THREE.Color(STAR_SETTINGS.highlighted.color),
        glowColor: new THREE.Color(STAR_SETTINGS.highlighted.color).multiplyScalar(enhancedGlowMultiplier),
        baseCoreOpacity: Math.max(opacity, 0.9)
      };
    }
  }, [isSelected, opacity, enhancedGlowMultiplier]);

  const colors = getStarColors();

  // Enhanced pulsing animation with different effects for selected vs highlighted
  useFrame((state) => {
    if (glowMaterialRef.current && coreMaterialRef.current) {
      const time = state.clock.elapsedTime;
      
      if (isSelected) {
        // Selected stars: Slower, more dramatic pulsing
        const pulseSpeed = 1.8;
        const pulseIntensity = 0.5;
        const pulseMultiplier = 1.0 + Math.sin(time * pulseSpeed) * pulseIntensity;
        
        glowMaterialRef.current.color = colors.glowColor.clone().multiplyScalar(pulseMultiplier);
        coreMaterialRef.current.opacity = colors.baseCoreOpacity * (1.0 + Math.sin(time * pulseSpeed) * 0.15);
      } else {
        // Highlighted stars: Gentle pulsing
        const pulseSpeed = 1.2;
        const pulseIntensity = 0.3;
        const pulseMultiplier = 1.0 + Math.sin(time * pulseSpeed) * pulseIntensity;
        
        glowMaterialRef.current.color = colors.glowColor.clone().multiplyScalar(pulseMultiplier);
        coreMaterialRef.current.opacity = colors.baseCoreOpacity * (1.0 + Math.sin(time * pulseSpeed) * 0.1);
      }
    }
  });

  return (
    <Billboard position={position}>
      <mesh 
        onClick={handleClick} 
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        visible={false}
      >
        <planeGeometry args={[enhancedStarSize, enhancedStarSize]} />
        <meshBasicMaterial transparent opacity={0} visible={false} />
      </mesh>

      {/* Enhanced glow sprite with STAR_SETTINGS colors */}
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

      {/* Star sprite with STAR_SETTINGS colors */}
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
 * Main Star Component - Enhanced dispatcher with hover support
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
  onClick,
  onHover
}: StarProps & { onHover?: (isHovering: boolean) => void }) {
  
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
        onClick={onClick}
        onHover={onHover}
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
        onHover={onHover}
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
    prevProps.starTexture === nextProps.starTexture &&
    prevProps.glowTexture === nextProps.glowTexture
  );
});

export default Star;