import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

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
 */
export function StarViewCanvas() {
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
          position: [0, 0, 8], // Position camera for good cube visibility
          fov: 45, // Field of view for perspective
          near: 0.1, // Near clipping plane
          far: 1000 // Far clipping plane
        }}
        style={{
          background: '#FFFFFF', // Dark cosmic background color
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
        
        {/* Main rotating cube */}
        <RotatingCube />
        
        {/* Optional: Add fog for depth perception */}
        <fog attach="fog" args={['#0A0A0F', 5, 20]} />
      </Canvas>
    </div>
  );
}

export default StarViewCanvas;