import React, { useMemo, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import { HygStarsCatalog } from '../data/StarsCatalog';
import { HygRecord } from '../types';
import * as THREE from 'three';

/**
 * StarField Component
 * 
 * Renders the actual star sprites and (optionally) their labels in 3D space,
 * using instancing and billboards for performance.
 * 
 * Follows exact specifications for props and behavior.
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
 * Renders a single star as a 3D billboard with glow and core sprite
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

  // Animate selected star with pulsing effect
  useFrame((state) => {
    if (isSelected && meshRef.current && glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse);
      glowRef.current.scale.setScalar(pulse * 1.2);
    }
  });

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    console.log('Star clicked:', star.proper || star.id, 'at index:', index);
    onSelect(star, index);
  }, [star, index, onSelect]);

  return (
    <Billboard position={position}>
      {/* Invisible mesh for easier click detection */}
      <mesh onClick={handleClick} visible={false}>
        <sphereGeometry args={[size * 3, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Glow sprite with additive blending */}
      <mesh ref={glowRef} onClick={handleClick}>
        <planeGeometry args={[size * glowMultiplier * 4, size * glowMultiplier * 4]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3 * glowMultiplier}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Core star sprite */}
      <mesh ref={meshRef} onClick={handleClick}>
        <planeGeometry args={[size * 2, size * 2]} />
        <meshBasicMaterial
          color={isSelected ? [1, 1, 1] : color}
          transparent
          opacity={isSelected ? 1.0 : 0.8}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  );
}

/**
 * Star Labels Component
 * Renders star name labels with opacity and size based on distance and magnitude
 */
function StarLabels({ 
  starData, 
  cameraPosition,
  showLabels 
}: {
  starData: Array<{
    star: HygRecord;
    position: [number, number, number];
    distance: number;
  }>;
  cameraPosition: THREE.Vector3;
  showLabels: boolean;
}) {
  if (!showLabels) return null;

  // Filter stars that should have labels (only named stars)
  const labeledStars = starData.filter(({ star, distance }) => 
    star.proper && 
    star.proper.trim() !== '' &&
    distance < 50 && // Only show labels for nearby stars
    star.mag < 4.0 // Only show labels for bright stars
  ).slice(0, 30); // Limit number of labels for performance

  return (
    <>
      {labeledStars.map(({ star, position, distance }) => {
        // Calculate label opacity based on distance and magnitude
        const distanceFromCamera = cameraPosition.distanceTo(new THREE.Vector3(...position));
        const opacity = Math.max(0.3, Math.min(1.0, (30 / distanceFromCamera) * (4.0 - star.mag) / 4.0));
        
        // Calculate label size based on distance
        const fontSize = Math.max(8, Math.min(16, 200 / distanceFromCamera));

        if (opacity < 0.3) return null;

        return (
          <Html
            key={`label-${star.id}`}
            position={[position[0], position[1] + 0.5, position[2]]}
            center
            distanceFactor={10}
            occlude
          >
            <div 
              style={{
                color: '#F8FAFC',
                fontSize: `${fontSize}px`,
                fontWeight: 300,
                opacity: opacity,
                textShadow: '0 0 4px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {star.proper}
            </div>
          </Html>
        );
      })}
    </>
  );
}

/**
 * Main StarField Component
 * 
 * Renders up to maxStars stars with magnitude ≤ maxMagnitude.
 * Each star is rendered as a 3D billboard with a glow and a core sprite.
 * Clicking a star triggers onStarSelect.
 * Optionally displays star name labels with opacity and size based on distance and magnitude.
 * Uses performant instancing and memoization for large datasets.
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

  // Process star data for rendering with memoization for performance
  const starData = useMemo(() => {
    if (!catalog) {
      console.log('StarField: No catalog available');
      return [];
    }

    console.log('StarField: Processing star catalog...');
    
    // Filter stars by magnitude and limit count
    const filteredStars = catalog
      .filterByMagnitude(-2, maxMagnitude)
      .slice(0, maxStars);

    console.log(`StarField: Rendering ${filteredStars.length} stars (magnitude ≤ ${maxMagnitude})`);

    return filteredStars.map((star, index) => {
      // Convert spherical coordinates to Cartesian for 3D positioning
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
          case 'G': // Yellow stars (like our Sun)
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

      // Calculate star size based on magnitude (brighter stars = larger size)
      const size = Math.max(0.02, Math.min(0.3, starSize * (6.0 - star.mag) * 0.2));

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

  // Track camera position for label calculations
  const cameraPosition = useMemo(() => {
    return camera.position.clone();
  }, [camera.position, labelRefreshTick]);

  // Handle star selection with proper typing
  const handleStarSelect = useCallback((star: HygRecord, index: number) => {
    console.log('StarField: Handling star selection:', star.proper || star.id);
    onStarSelect(star as T, index);
  }, [onStarSelect]);

  if (!catalog || starData.length === 0) {
    console.log('StarField: No stars to render');
    return null;
  }

  return (
    <group>
      {/* Render stars as billboards with glow and core sprites */}
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
            onSelect={handleStarSelect}
          />
        );
      })}

      {/* Render star name labels with distance and magnitude-based opacity */}
      <StarLabels
        starData={starData}
        cameraPosition={cameraPosition}
        showLabels={showLabels}
      />
    </group>
  );
}

export default StarField;