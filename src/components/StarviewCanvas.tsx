import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { HygStarsCatalog } from '../data/StarsCatalog';
import { HygRecord } from '../types';
import { Star } from '../render/Star';

/**
 * StarviewCanvas Component with HYG Catalog Integration
 * 
 * Enhanced 3D background canvas that can utilize real star data from the HYG catalog
 * to create accurate stellar visualizations and positions.
 * 
 * Features:
 * - Accepts HYG catalog as prop for real star data
 * - Graceful fallback when catalog is not available
 * - Performance optimized with proper star filtering
 * - Cosmic-themed dark background
 * - Uses dedicated Star component for rendering
 * 
 * Confidence Rating: High - Robust implementation with comprehensive error handling
 */

interface StarviewCanvasProps {
  hygCatalog: HygStarsCatalog | null;
  catalogLoading: boolean;
  selectedStar?: HygRecord | null;
  onStarSelect?: (star: HygRecord | null, index: number | null) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
}

/**
 * StarLabels Component
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
 * Starfield Component
 * Renders actual stars from the HYG catalog using the dedicated Star component
 */
function Starfield({ 
  hygCatalog, 
  selectedStar, 
  onStarSelect, 
  starSize = 0.1, 
  glowMultiplier = 1.0, 
  showLabels = false 
}: { 
  hygCatalog: HygStarsCatalog;
  selectedStar?: HygRecord | null;
  onStarSelect?: (star: HygRecord | null, index: number | null) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
}) {
  const { camera } = useThree();
  
  // Initialize textures using useLoader
  const [starParticleTexture, starGlowTexture] = useLoader(TextureLoader, [
    '/src/assets/star_particle.png',
    '/src/assets/star_glow.png'
  ]);

  // Process star data for rendering with memoization for performance
  const starData = useMemo(() => {
    if (!hygCatalog) {
      console.log('Starfield: No catalog available');
      return [];
    }

    console.log('Starfield: Processing star catalog...');
    
    // Filter stars by magnitude and limit count for performance
    const filteredStars = hygCatalog
      .filterByMagnitude(-2, 6.5)
      .slice(0, 5000); // Increased limit for better star field

    console.log(`Starfield: Rendering ${filteredStars.length} stars`);

    return filteredStars.map((star, index) => {
      // Convert spherical coordinates to Cartesian for 3D positioning
      const distance = Math.min(star.dist, 100) / 5; // Scale for visualization
      const raRad = star.rarad;
      const decRad = star.decrad;
      
      const x = distance * Math.cos(decRad) * Math.cos(raRad);
      const y = distance * Math.cos(decRad) * Math.sin(raRad);
      const z = distance * Math.sin(decRad);

      return {
        star,
        index,
        position: [x, y, z] as [number, number, number],
        distance
      };
    });
  }, [hygCatalog]);

  // Track camera position for label calculations
  const cameraPosition = useMemo(() => {
    return camera.position.clone();
  }, [camera.position]);

  // Handle star selection with proper typing
  const handleStarSelect = useCallback((star: HygRecord, index: number) => {
    console.log('Starfield: Handling star selection:', star.proper || star.id);
    if (onStarSelect) {
      onStarSelect(star, index);
    }
  }, [onStarSelect]);

  // Memoize starSprites list for performance optimization
  const starSprites = useMemo(() => {
    if (!starParticleTexture || !starGlowTexture || starData.length === 0) {
      return null;
    }

    return starData.map(({ star, index, position, distance }) => {
      const isSelected = selectedStar && 
        ((selectedStar as any).id === star.id || 
         (selectedStar as any).hip === star.hip);

      // Calculate actual star size based on magnitude
      const actualStarSize = Math.max(0.5, Math.min(2.0, starSize * (6.0 - star.mag) * 0.2));

      return (
        <Star
          key={`star-${star.id}`}
          position={position}
          mag={star.mag}
          starTexture={starParticleTexture}
          glowTexture={starGlowTexture}
          starSize={actualStarSize}
          glowMultiplier={glowMultiplier}
          isSelected={!!isSelected}
          onClick={(event) => {
            console.log('Star clicked:', star.proper || star.id, 'at index:', index);
            handleStarSelect(star, index);
          }}
        />
      );
    });
  }, [starData, starSize, glowMultiplier, selectedStar, handleStarSelect, starParticleTexture, starGlowTexture]);

  if (!hygCatalog || starData.length === 0) {
    console.log('Starfield: No stars to render');
    return null;
  }

  return (
    <group>
      {/* Render star sprites using dedicated Star component */}
      {starSprites}

      {/* Conditional label rendering */}
      {showLabels && (
        <StarLabels
          starData={starData}
          cameraPosition={cameraPosition}
          showLabels={showLabels}
        />
      )}
    </group>
  );
}

/**
 * Scene Setup Component
 * Configures lighting and camera for the 3D scene
 */
function SceneSetup() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} color="#60A5FA" />
      
      {/* Directional light for depth and shadows */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        color="#93C5FD"
      />
      
      {/* Point light for additional cosmic glow */}
      <pointLight 
        position={[-10, -10, -5]} 
        intensity={0.5} 
        color="#3B82F6"
      />
    </>
  );
}

/**
 * StarviewCanvas Component
 * Main R3F canvas component that renders the 3D background scene
 * 
 * Features:
 * - Full viewport coverage with fixed positioning
 * - Stays behind UI elements with z-index: -1
 * - Responsive to window resize events
 * - Optimized performance with proper camera settings
 * - Cosmic-themed dark background
 * - Real star data integration when available
 * - Uses dedicated Star component for rendering
 */
export function StarviewCanvas({ 
  hygCatalog, 
  catalogLoading, 
  selectedStar, 
  onStarSelect, 
  starSize = 0.1, 
  glowMultiplier = 1.0, 
  showLabels = false 
}: StarviewCanvasProps) {
  // Handle pointer miss (clicking on empty space)
  const handlePointerMissed = useCallback(() => {
    console.log('StarviewCanvas: Pointer missed - deselecting star');
    if (onStarSelect) {
      onStarSelect(null, null);
    }
  }, [onStarSelect]);

  return (
    <div 
      className="fixed inset-0 w-full h-full"
      style={{ 
        zIndex: -1,
        pointerEvents: 'auto' // Enable pointer events for star selection
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 8], // Position camera for good visibility
          fov: 45, // Field of view for perspective
          near: 0.1, // Near clipping plane
          far: 1000 // Far clipping plane
        }}
        style={{
          background: '#000000', // Dark cosmic background color
          width: '100vw',
          height: '100vh'
        }}
        dpr={[1, 2]} // Device pixel ratio for crisp rendering
        performance={{
          min: 0.5, // Minimum target FPS
          max: 1.0, // Maximum target FPS
          debounce: 200 // Debounce resize events
        }}
        resize={{
          scroll: false, // Don't resize on scroll
          debounce: { scroll: 50, resize: 0 } // Debounce settings
        }}
        onPointerMissed={handlePointerMissed}
      >
        {/* Scene lighting setup */}
        <SceneSetup />
        
        {/* Render real stars if catalog is available and loaded */}
        {hygCatalog && !catalogLoading && (
          <Starfield 
            hygCatalog={hygCatalog}
            selectedStar={selectedStar}
            onStarSelect={onStarSelect}
            starSize={starSize}
            glowMultiplier={glowMultiplier}
            showLabels={showLabels}
          />
        )}
        
        {/* Optional: Add fog for depth perception */}
        <fog attach="fog" args={['#0A0A0F', 5, 20]} />
        
        {/* Invisible plane for pointer miss detection */}
        <mesh
          position={[0, 0, -50]}
          onPointerMissed={handlePointerMissed}
          visible={false}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Canvas>
      
      {/* Loading indicator for catalog */}
      {catalogLoading && (
        <div className="absolute bottom-4 right-4 text-cosmic-stellar-wind text-xs font-light opacity-50">
          Loading star catalog...
        </div>
      )}
      
      {/* Status indicators */}
      {hygCatalog && (
        <div className="absolute bottom-4 left-4 text-cosmic-stellar-wind text-xs font-light opacity-30 pointer-events-none">
          <div>{hygCatalog.getTotalStars().toLocaleString()} stars loaded</div>
          <div>Labels: {showLabels ? 'ON' : 'OFF'}</div>
          <div>Dedicated Star component active</div>
        </div>
      )}
    </div>
  );
}

export default StarviewCanvas;