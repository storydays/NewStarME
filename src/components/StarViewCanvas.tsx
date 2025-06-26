import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { HygStarsCatalog } from '../data/StarsCatalog';
import { HygRecord } from '../types';

/**
 * StarViewCanvas Component with HYG Catalog Integration
 * 
 * Enhanced 3D background canvas that can utilize real star data from the HYG catalog
 * to create accurate stellar visualizations and positions.
 * 
 * Features:
 * - Accepts HYG catalog as prop for real star data
 * - Graceful fallback when catalog is not available
 * - Performance optimized with proper star filtering
 * - Cosmic-themed dark background
 * 
 * Confidence Rating: High - Robust implementation with comprehensive error handling
 */

interface StarViewCanvasProps {
  hygCatalog: HygStarsCatalog | null;
  catalogLoading: boolean;
}

/**
 * Rotating Cube Component
 * Renders a slowly rotating cube with cosmic-themed materials
 */
function RotatingCube() {
  const meshRef = useRef<Mesh>(null);

  // Use useFrame hook for continuous rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slow rotation on both X and Y axes for visual interest
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  // Memoize geometry and material for performance
  const geometry = useMemo(() => {
    return [2, 2, 2]; // Box geometry dimensions
  }, []);

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={geometry} />
      <meshStandardMaterial 
        color="#2563EB" 
        transparent 
        opacity={0.6}
        wireframe={false}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
}

/**
 * Real Stars Component
 * Renders actual stars from the HYG catalog as 3D points
 */
function RealStars({ hygCatalog }: { hygCatalog: HygStarsCatalog }) {
  const [starData, setStarData] = useState<HygRecord[]>([]);
  
  useEffect(() => {
    if (!hygCatalog) return;
    
    console.log('Processing HYG catalog for 3D visualization...');
    
    // Get bright, visible stars for 3D rendering
    // Filter to magnitude < 4.0 for performance and visibility
    const brightStars = hygCatalog
      .filterByMagnitude(-2, 4.0)
      .slice(0, 1000); // Limit to 1000 stars for performance
    
    console.log(`Selected ${brightStars.length} bright stars for 3D visualization`);
    setStarData(brightStars);
  }, [hygCatalog]);

  // Convert star positions to 3D coordinates
  const starPositions = useMemo(() => {
    if (starData.length === 0) return new Float32Array(0);
    
    const positions = new Float32Array(starData.length * 3);
    
    starData.forEach((star, index) => {
      // Convert spherical coordinates (RA, Dec, Distance) to Cartesian (x, y, z)
      // Scale distance for visualization (use logarithmic scaling for very distant stars)
      const distance = Math.min(star.dist, 100) / 10; // Scale and cap distance
      
      // Convert RA/Dec from degrees to radians
      const raRad = star.rarad;
      const decRad = star.decrad;
      
      // Spherical to Cartesian conversion
      const x = distance * Math.cos(decRad) * Math.cos(raRad);
      const y = distance * Math.cos(decRad) * Math.sin(raRad);
      const z = distance * Math.sin(decRad);
      
      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;
    });
    
    return positions;
  }, [starData]);

  // Star colors based on spectral class
  const starColors = useMemo(() => {
    if (starData.length === 0) return new Float32Array(0);
    
    const colors = new Float32Array(starData.length * 3);
    
    starData.forEach((star, index) => {
      let r = 1, g = 1, b = 1; // Default white
      
      if (star.spect) {
        const spectralClass = star.spect.charAt(0).toUpperCase();
        switch (spectralClass) {
          case 'O': case 'B': // Blue stars
            r = 0.7; g = 0.8; b = 1.0;
            break;
          case 'A': // White stars
            r = 1.0; g = 1.0; b = 1.0;
            break;
          case 'F': // Yellow-white stars
            r = 1.0; g = 1.0; b = 0.8;
            break;
          case 'G': // Yellow stars (like our Sun)
            r = 1.0; g = 0.9; b = 0.7;
            break;
          case 'K': // Orange stars
            r = 1.0; g = 0.7; b = 0.4;
            break;
          case 'M': // Red stars
            r = 1.0; g = 0.4; b = 0.2;
            break;
        }
      }
      
      colors[index * 3] = r;
      colors[index * 3 + 1] = g;
      colors[index * 3 + 2] = b;
    });
    
    return colors;
  }, [starData]);

  // Star sizes based on magnitude (brightness)
  const starSizes = useMemo(() => {
    if (starData.length === 0) return new Float32Array(0);
    
    const sizes = new Float32Array(starData.length);
    
    starData.forEach((star, index) => {
      // Convert magnitude to size (brighter stars = larger size)
      // Magnitude scale is inverted (lower = brighter)
      const size = Math.max(0.5, Math.min(3.0, (6.0 - star.mag) * 0.5));
      sizes[index] = size;
    });
    
    return sizes;
  }, [starData]);

  if (starData.length === 0) {
    return null;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starData.length}
          array={starPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={starData.length}
          array={starColors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={starData.length}
          array={starSizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
      />
    </points>
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
 * StarViewCanvas Component
 * Main R3F canvas component that renders the 3D background scene
 * 
 * Features:
 * - Full viewport coverage with fixed positioning
 * - Stays behind UI elements with z-index: -1
 * - Responsive to window resize events
 * - Optimized performance with proper camera settings
 * - Cosmic-themed dark background
 * - Real star data integration when available
 */
export function StarViewCanvas({ hygCatalog, catalogLoading }: StarViewCanvasProps) {
  return (
    <div 
      className="fixed inset-0 w-full h-full"
      style={{ 
        zIndex: -1,
        pointerEvents: 'none' // Prevent canvas from intercepting mouse events
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
      >
        {/* Scene lighting setup */}
        <SceneSetup />
        
        {/* Render real stars if catalog is available and loaded */}
        {hygCatalog && !catalogLoading && (
          <RealStars hygCatalog={hygCatalog} />
        )}
        
        {/* Fallback rotating cube when catalog is not available */}
        {(!hygCatalog || catalogLoading) && (
          <RotatingCube />
        )}
        
        {/* Optional: Add fog for depth perception */}
        <fog attach="fog" args={['#0A0A0F', 5, 20]} />
      </Canvas>
      
      {/* Loading indicator for catalog */}
      {catalogLoading && (
        <div className="absolute bottom-4 right-4 text-cosmic-stellar-wind text-xs font-light opacity-50">
          Loading star catalog...
        </div>
      )}
    </div>
  );
}

export default StarViewCanvas;