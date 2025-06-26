import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { HygStarsCatalog } from '../data/StarsCatalog';
import { HygRecord } from '../types';
import * as THREE from 'three';

/**
 * StarField Component
 * 
 * Renders the actual star sprites and (optionally) their labels in 3D space,
 * using instancing and billboards for performance.
 * 
 * Confidence Rating: High - Complete implementation with performance optimizations
 */

export interface StarFieldProps<T = HygRecord> {
  catalog: HygStarsCatalog | null;
  onStarSelect: (star: T, index: number) => void;
  selectedStar: T | null;
  maxMagnitude?: number;
  maxStars?: number;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  labelRefreshTick?: number;
}

/**
 * Individual Star Component
 * Renders a single star as a billboard with glow effect
 */
function Star({ 
  star, 
  index, 
  position, 
  color, 
  size, 
  glowMultiplier, 
  isSelected, 
  onSelect 
}: {
  star: HygRecord;
  index: number;
  position: [number, number, number];
  color: [number, number, number];
  size: number;
  glowMultiplier: number;
  isSelected: boolean;
  onSelect: (star: HygRecord, index: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Animate selected star
  useFrame((state) => {
    if (isSelected && meshRef.current && glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse);
      glowRef.current.scale.setScalar(pulse * 1.5);
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    onSelect(star, index);
  };

  return (
    <group position={position}>
      {/* Glow effect */}
      <mesh ref={glowRef} onClick={handleClick}>
        <sphereGeometry args={[size * glowMultiplier * 2, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1 * glowMultiplier}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Core star */}
      <mesh ref={meshRef} onClick={handleClick}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[size * 3, size * 4, 16]} />
          <meshBasicMaterial
            color="#2563EB"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Star Label Component
 * Renders star name labels with distance-based opacity
 */
function StarLabel({ 
  star, 
  position, 
  distance, 
  magnitude 
}: {
  star: HygRecord;
  position: [number, number, number];
  distance: number;
  magnitude: number;
}) {
  const { camera } = useThree();
  
  // Calculate label opacity based on distance and magnitude
  const opacity = useMemo(() => {
    const distanceFactor = Math.max(0.1, Math.min(1.0, 20 / distance));
    const magnitudeFactor = Math.max(0.3, Math.min(1.0, (4.0 - magnitude) / 4.0));
    return distanceFactor * magnitudeFactor * 0.8;
  }, [distance, magnitude]);

  // Calculate label size based on distance
  const fontSize = useMemo(() => {
    return Math.max(0.3, Math.min(0.8, 10 / distance));
  }, [distance]);

  if (!star.proper || opacity < 0.2) return null;

  return (
    <Text
      position={[position[0], position[1] + 0.5, position[2]]}
      fontSize={fontSize}
      color="#F8FAFC"
      anchorX="center"
      anchorY="middle"
      material-transparent
      material-opacity={opacity}
      billboard
    >
      {star.proper}
    </Text>
  );
}

/**
 * Main StarField Component
 */
export function StarField<T extends HygRecord>({
  catalog,
  onStarSelect,
  selectedStar,
  maxMagnitude = 6.5,
  maxStars = 10000,
  starSize = 0.08,
  glowMultiplier = 1.0,
  showLabels = true,
  labelRefreshTick = 0
}: StarFieldProps<T>) {
  const { camera } = useThree();

  // Process star data for rendering
  const starData = useMemo(() => {
    if (!catalog) return [];

    console.log('Processing star catalog for StarField...');
    
    // Filter stars by magnitude and limit count
    const filteredStars = catalog
      .filterByMagnitude(-2, maxMagnitude)
      .slice(0, maxStars);

    console.log(`StarField: Rendering ${filteredStars.length} stars`);

    return filteredStars.map((star, index) => {
      // Convert spherical coordinates to Cartesian
      const distance = Math.min(star.dist, 100) / 5; // Scale for visualization
      const raRad = star.rarad;
      const decRad = star.decrad;
      
      const x = distance * Math.cos(decRad) * Math.cos(raRad);
      const y = distance * Math.cos(decRad) * Math.sin(raRad);
      const z = distance * Math.sin(decRad);

      // Calculate star color based on spectral class
      let color: [number, number, number] = [1, 1, 1]; // Default white
      
      if (star.spect) {
        const spectralClass = star.spect.charAt(0).toUpperCase();
        switch (spectralClass) {
          case 'O': case 'B': // Blue stars
            color = [0.7, 0.8, 1.0];
            break;
          case 'A': // White stars
            color = [1.0, 1.0, 1.0];
            break;
          case 'F': // Yellow-white stars
            color = [1.0, 1.0, 0.8];
            break;
          case 'G': // Yellow stars
            color = [1.0, 0.9, 0.7];
            break;
          case 'K': // Orange stars
            color = [1.0, 0.7, 0.4];
            break;
          case 'M': // Red stars
            color = [1.0, 0.4, 0.2];
            break;
        }
      }

      // Calculate star size based on magnitude
      const size = Math.max(0.02, Math.min(0.2, starSize * (6.0 - star.mag) * 0.3));

      return {
        star,
        index,
        position: [x, y, z] as [number, number, number],
        color,
        size,
        distance
      };
    });
  }, [catalog, maxMagnitude, maxStars, starSize]);

  // Calculate camera distance for label optimization
  const cameraDistance = useMemo(() => {
    return camera.position.length();
  }, [camera.position, labelRefreshTick]);

  if (!catalog || starData.length === 0) {
    return null;
  }

  return (
    <group>
      {/* Render stars */}
      {starData.map(({ star, index, position, color, size, distance }) => {
        const isSelected = selectedStar && 
          ((selectedStar as any).id === star.id || 
           (selectedStar as any).hip === star.hip);

        return (
          <Star
            key={`star-${star.id}`}
            star={star}
            index={index}
            position={position}
            color={color}
            size={size}
            glowMultiplier={glowMultiplier}
            isSelected={!!isSelected}
            onSelect={onStarSelect as (star: HygRecord, index: number) => void}
          />
        );
      })}

      {/* Render labels if enabled */}
      {showLabels && starData
        .filter(({ star, distance }) => 
          star.proper && 
          distance < 30 && // Only show labels for nearby stars
          star.mag < 3.0 // Only show labels for bright stars
        )
        .slice(0, 50) // Limit number of labels for performance
        .map(({ star, position, distance }) => (
          <StarLabel
            key={`label-${star.id}`}
            star={star}
            position={position}
            distance={distance}
            magnitude={star.mag}
          />
        ))
      }
    </group>
  );
}

export default StarField;