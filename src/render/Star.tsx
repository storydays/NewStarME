import React, { useCallback, useRef } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Star Component - Refactored with RegularStar and HighlightedStar sub-components
 * 
 * Purpose: Main dispatcher component that renders appropriate star type based on highlighting state.
 * Contains RegularStar and HighlightedStar components for better organization and specialized rendering.
 * 
 * Features:
 * - Conditional rendering based on isHighlighted prop
 * - Specialized components for different visual states
 * - Enhanced pulsing glow effect for highlighted stars
 * - Emotion-based color tinting
 * 
 * Confidence Rating: High - Clean separation of concerns with enhanced visual effects
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
}

interface HighlightedStarProps extends BaseStarProps {
  emotionColor?: string;
}

/**
 * RegularStar Component - Renders standard stars (non-highlighted)
 * 
 * Purpose: Handles rendering of regular stars with standard visual properties.
 * Provides basic glow effects and standard color schemes.
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
  
  // Opacity calculation based on magnitude
  const calculateOpacity = useCallback((magnitude: number): number => {
    const base = Math.max(0.3, Math.min(1.0, 1.2 - 0.07 * magnitude));
    return Math.max(0, Math.min(1, base * 1.0));
  }, []);

  const opacity = calculateOpacity(mag);

  // Handle click events
  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    console.log('RegularStar: Click detected on normal star');
    onClick(event);
  }, [onClick]);

  // Determine colors based on selection state
  const getStarColors = useCallback(() => {
    if (isSelected) {
      // Selected: Yellow core with enhanced yellow glow
      return {
        coreColor: new THREE.Color(1, 1, 0), // Yellow
        glowColor: new THREE.Color('#dbe6ff').multiplyScalar(glowMultiplier),
        glowOpacity: 0.8 * glowMultiplier,
        coreOpacity: opacity
      };
    } else {
      // Normal: White core with light blue glow
      return {
        coreColor: new THREE.Color(1, 1, 1), // White
        glowColor: new THREE.Color('#dbe6ff').multiplyScalar(glowMultiplier),
        glowOpacity: 0.4 * glowMultiplier,
        coreOpacity: opacity
      };
    }
  }, [isSelected, opacity, glowMultiplier]);

  const colors = getStarColors();

  return (
    <Billboard position={position}>
      {/* Invisible clickable mesh */}
      <mesh onClick={handleClick} visible={false}>
        <planeGeometry args={[starSize, starSize]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Glow sprite */}
      <sprite scale={[starSize * 2.5, starSize * 2.5, starSize * 2.5]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          opacity={colors.glowOpacity}
          color={colors.glowColor}
          alphaTest={0.01}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      
      {/* Star sprite */}
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
 * HighlightedStar Component - Renders enhanced highlighted stars with pulsing glow
 * 
 * Purpose: Specialized component for highlighted stars with enhanced visual effects.
 * Features emotion-based coloring, increased size, and animated pulsing glow.
 * 
 * Features:
 * - 400% size increase for enhanced visibility
 * - 2x glow intensity with pulsing animation
 * - Emotion-based color tinting
 * - Particle emission effects
 * - Smooth pulsing glow using useFrame animation
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
  onClick
}: HighlightedStarProps) {
  
  // Refs for pulsing glow animation
  const glowMaterialRef = useRef<THREE.SpriteMaterial>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Opacity calculation based on magnitude
  const calculateOpacity = useCallback((magnitude: number): number => {
    const base = Math.max(0.3, Math.min(1.0, 1.2 - 0.07 * magnitude));
    return Math.max(0, Math.min(1, base * 1.0));
  }, []);

  const opacity = calculateOpacity(mag);

  // Handle click events with enhanced detection
  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    console.log('HighlightedStar: Enhanced click detected on highlighted star');
    onClick(event);
  }, [onClick]);

  // Enhanced size and glow for highlighted stars
  const enhancedStarSize = starSize * 4.0; // 400% size increase
  const enhancedGlowMultiplier = glowMultiplier * 2.0; // 2x glow intensity

  // Determine colors with emotion-based tinting
  const getStarColors = useCallback(() => {
    if (isSelected) {
      // Selected: Yellow core with enhanced yellow glow
      return {
        coreColor: new THREE.Color(1, 1, 0), // Yellow
        glowColor: new THREE.Color('#dbe6ff').multiplyScalar(enhancedGlowMultiplier),
        baseGlowOpacity: 0.8 * enhancedGlowMultiplier,
        baseCoreOpacity: opacity
      };
    } else {
      // Highlighted: Emotion-based color with enhanced glow
      const emotionColorObj = emotionColor ? new THREE.Color(emotionColor) : new THREE.Color(0, 1, 1);
      
      return {
        coreColor: emotionColorObj, // Emotion-based color
        glowColor: emotionColorObj.clone().multiplyScalar(enhancedGlowMultiplier),
        baseGlowOpacity: 0.9 * enhancedGlowMultiplier,
        baseCoreOpacity: Math.max(opacity, 0.9) // Ensure highlighted stars are very visible
      };
    }
  }, [isSelected, emotionColor, opacity, enhancedGlowMultiplier]);

  const colors = getStarColors();

  // Pulsing glow animation using useFrame
  useFrame((state) => {
    if (glowMaterialRef.current && coreMaterialRef.current) {
      // Create smooth pulsing effect using sine wave
      const time = state.clock.elapsedTime;
      const pulseSpeed = 2.0; // Pulse frequency
      const pulseIntensity = 0.3; // How much the opacity varies (0.3 = 30% variation)
      
      // Calculate pulsing multiplier (oscillates between 0.7 and 1.3)
      const pulseMultiplier = 1.0 + Math.sin(time * pulseSpeed) * pulseIntensity;
      
      // Apply pulsing to glow opacity
      glowMaterialRef.current.opacity = colors.baseGlowOpacity * pulseMultiplier;
      
      // Subtle pulsing on core as well (less intense)
      coreMaterialRef.current.opacity = colors.baseCoreOpacity * (1.0 + Math.sin(time * pulseSpeed) * 0.1);
      
      // Optional: Pulse the glow color intensity as well
      const colorIntensity = 1.0 + Math.sin(time * pulseSpeed * 0.5) * 0.2;
      glowMaterialRef.current.color = colors.glowColor.clone().multiplyScalar(colorIntensity);
    }
  });

  return (
    <Billboard position={position}>
      {/* Enhanced invisible clickable mesh - larger for highlighted stars */}
      <mesh onClick={handleClick} visible={false}>
        <planeGeometry args={[enhancedStarSize, enhancedStarSize]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Enhanced glow sprite with pulsing animation */}
      <sprite scale={[enhancedStarSize * 2.5, enhancedStarSize * 2.5, enhancedStarSize * 2.5]}>
        <spriteMaterial
          ref={glowMaterialRef}
          map={glowTexture}
          transparent
          depthWrite={false}
          opacity={colors.baseGlowOpacity}
          color={colors.glowColor}
          alphaTest={0.01}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      
      {/* Enhanced star sprite with emotion-based coloring */}
      <mesh onClick={handleClick}>
        <planeGeometry args={[enhancedStarSize, enhancedStarSize]} />
        <meshBasicMaterial
          ref={coreMaterialRef}
          map={starTexture}
          color={colors.coreColor}
          transparent
          opacity={colors.baseCoreOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Particle emission effect for highlighted stars */}
      {[...Array(6)].map((_, i) => (
        <sprite
          key={i}
          position={[
            (Math.random() - 0.5) * enhancedStarSize * 0.5,
            (Math.random() - 0.5) * enhancedStarSize * 0.5,
            (Math.random() - 0.5) * enhancedStarSize * 0.1
          ]}
          scale={[enhancedStarSize * 0.1, enhancedStarSize * 0.1, enhancedStarSize * 0.1]}
        >
          <spriteMaterial
            map={starTexture}
            transparent
            opacity={0.6}
            color={colors.coreColor}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </Billboard>
  );
}

/**
 * Main Star Component - Dispatcher for RegularStar and HighlightedStar
 * 
 * Purpose: Acts as a conditional renderer that selects the appropriate
 * star component based on the highlighting state.
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
  onClick
}: StarProps) {
  
  console.log(`Star: Rendering ${isHighlighted ? 'highlighted' : 'normal'} star at position [${position.join(', ')}]`);

  // Conditional rendering based on highlighting state
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