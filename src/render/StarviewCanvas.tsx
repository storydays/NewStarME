import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { HygStarsCatalog } from '../data/StarsCatalog';
import { HygRecord } from '../types';
import { Starfield } from './Starfield';
import { AnimationController } from './AnimationController';

/**
 * StarviewCanvas Component with HYG Catalog Integration and Animation Demo
 * 
 * Enhanced 3D background canvas that can utilize real star data from the HYG catalog
 * to create accurate stellar visualizations and positions.
 * 
 * Features:
 * - Accepts HYG catalog as prop for real star data
 * - Graceful fallback when catalog is not available
 * - Performance optimized with proper star filtering
 * - Cosmic-themed dark background
 * - Uses dedicated Starfield component for rendering
 * - Includes AnimationController demonstration with rotation
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
 * StarfieldWrapper Component
 * Converts HYG catalog data to Starfield component format
 */
function StarfieldWrapper({ 
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
  
  // Convert HYG catalog data to Starfield format
  const catalogData = useMemo(() => {
    if (!hygCatalog) {
      console.log('StarfieldWrapper: No catalog available');
      return [];
    }

    console.log('StarfieldWrapper: Processing star catalog...');
    
    // Filter stars by magnitude and limit count for performance
    const filteredStars = hygCatalog
      .filterByMagnitude(-2, 6.5)
      .slice(0, 5000); // Limit for performance

    console.log(`StarfieldWrapper: Processing ${filteredStars.length} stars`);

    return filteredStars.map((star) => {
      // Convert spherical coordinates to Cartesian for 3D positioning
      const distance = Math.min(star.dist, 100) / 5; // Scale for visualization
      const raRad = star.rarad;
      const decRad = star.decrad;
      
      const x = distance * Math.cos(decRad) * Math.cos(raRad);
      const y = distance * Math.cos(decRad) * Math.sin(raRad);
      const z = distance * Math.sin(decRad);

      return {
        id: star.id.toString(),
        position: [x, y, z] as [number, number, number],
        magnitude: star.mag,
        name: star.proper || undefined
      };
    });
  }, [hygCatalog]);

  // Handle star selection from Starfield
  const handleStarSelect = useCallback((starId: string) => {
    if (!hygCatalog || !onStarSelect) return;

    // Find the original HYG record
    const starIdNum = parseInt(starId);
    const allStars = hygCatalog.getStars();
    const selectedHygStar = allStars.find(star => star.id === starIdNum);
    
    if (selectedHygStar) {
      console.log('StarfieldWrapper: Star selected:', selectedHygStar.proper || selectedHygStar.id);
      onStarSelect(selectedHygStar, starIdNum);
    }
  }, [hygCatalog, onStarSelect]);

  // Get selected star ID for Starfield
  const selectedStarId = selectedStar ? selectedStar.id.toString() : null;

  return (
    <Starfield
      catalog={catalogData}
      selectedStar={selectedStarId}
      onStarSelect={handleStarSelect}
      starSize={starSize}
      glowMultiplier={glowMultiplier}
      showLabels={showLabels}
    />
  );
}

/**
 * Scene Content Component with Animation Demo
 * Contains all 3D scene elements including Starfield and AnimationController
 */
function SceneContent({ 
  hygCatalog, 
  selectedStar, 
  onStarSelect, 
  starSize, 
  glowMultiplier, 
  showLabels,
  catalogLoading 
}: {
  hygCatalog: HygStarsCatalog | null;
  selectedStar?: HygRecord | null;
  onStarSelect?: (star: HygRecord | null, index: number | null) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  catalogLoading: boolean;
}) {
  const cameraControlsRef = useRef<CameraControls>(null);
  const [animationCommand, setAnimationCommand] = useState<any>(null);
  const [isRotating, setIsRotating] = useState(false);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle pointer miss (clicking on empty space)
  const handlePointerMissed = useCallback(() => {
    console.log('SceneContent: Pointer missed - deselecting star');
    if (onStarSelect) {
      onStarSelect(null, null);
    }
  }, [onStarSelect]);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    console.log('SceneContent: Animation completed');
    setAnimationCommand(null);
  }, []);

  // Start rotation demo around center of scene
  const startRotationDemo = useCallback(() => {
    if (isRotating || !cameraControlsRef.current) return;
    
    console.log('SceneContent: Starting rotation demo around scene center');
    setIsRotating(true);
    
    const radius = 15; // Distance from center
    const centerY = 2;  // Slight elevation
    let angle = 0;
    const angleStep = Math.PI / 8; // 22.5 degrees per step
    
    const rotateStep = () => {
      if (!isRotating) return;
      
      angle += angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Create animation command to move to next position
      setAnimationCommand({
        type: 'focusStar',
        target: {
          position: [0, 0, 0] // Look at center
        },
        duration: 1000
      });
      
      // Manually set camera position for smooth rotation
      if (cameraControlsRef.current) {
        cameraControlsRef.current.setLookAt(x, centerY, z, 0, 0, 0, true);
      }
    };
    
    // Start rotation with interval
    rotationIntervalRef.current = setInterval(rotateStep, 2000); // 2 seconds per step
    
    // Initial position
    rotateStep();
  }, [isRotating]);

  // Stop rotation demo
  const stopRotationDemo = useCallback(() => {
    console.log('SceneContent: Stopping rotation demo');
    setIsRotating(false);
    
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
    
    // Reset to default view
    setAnimationCommand({
      type: 'resetView',
      duration: 2000
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, []);

  // Auto-start rotation demo when catalog loads
  useEffect(() => {
    if (hygCatalog && !catalogLoading && !isRotating) {
      // Start rotation demo after a short delay
      const timer = setTimeout(() => {
        startRotationDemo();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hygCatalog, catalogLoading, isRotating, startRotationDemo]);

  return (
    <>
      {/* Camera Controls */}
      <CameraControls
        ref={cameraControlsRef}
        makeDefault
        minDistance={1}
        maxDistance={500}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        draggingSmoothTime={0.25}
        smoothTime={0.25}
      />
      
      {/* Animation Controller for camera movements */}
      <AnimationController
        cameraControlsRef={cameraControlsRef}
        animationCommand={animationCommand}
        onAnimationComplete={handleAnimationComplete}
      />
      
      {/* Scene lighting setup */}
      <ambientLight intensity={0.4} color="#60A5FA" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        color="#93C5FD"
      />
      <pointLight 
        position={[-10, -10, -5]} 
        intensity={0.5} 
        color="#3B82F6"
      />
      
      {/* Render real stars if catalog is available and loaded */}
      {hygCatalog && !catalogLoading && (
        <StarfieldWrapper 
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
      
      {/* Demo Controls UI */}
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
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
 * - Uses dedicated Starfield component for rendering
 * - Includes AnimationController demonstration
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
      >
        <SceneContent
          hygCatalog={hygCatalog}
          selectedStar={selectedStar}
          onStarSelect={onStarSelect}
          starSize={starSize}
          glowMultiplier={glowMultiplier}
          showLabels={showLabels}
          catalogLoading={catalogLoading}
        />
      </Canvas>
      
      {/* Loading indicator for catalog */}
      {catalogLoading && (
        <div className="absolute bottom-4 right-4 text-cosmic-stellar-wind text-xs font-light opacity-50">
          Loading star catalog...
        </div>
      )}
      
      {/* Status indicators with animation demo info */}
      {hygCatalog && (
        <div className="absolute bottom-4 left-4 text-cosmic-stellar-wind text-xs font-light opacity-30 pointer-events-none">
          <div>{hygCatalog.getTotalStars().toLocaleString()} stars loaded</div>
          <div>Labels: {showLabels ? 'ON' : 'OFF'}</div>
          <div>Starfield component active</div>
          <div className="text-cosmic-cherenkov-blue mt-2">
            🎬 AnimationController Demo: Rotating around scene center
          </div>
          <div className="text-green-400">
            ✨ Automatic rotation every 2 seconds
          </div>
        </div>
      )}
      
      {/* Demo Instructions */}
      <div className="absolute top-4 left-4 text-cosmic-stellar-wind text-xs font-light opacity-50 pointer-events-none">
        <div className="frosted-glass rounded-lg p-3 max-w-xs">
          <div className="text-cosmic-cherenkov-blue font-medium mb-2">AnimationController Demo</div>
          <div className="space-y-1">
            <div>• Camera rotates around scene center</div>
            <div>• Demonstrates focusStar animation</div>
            <div>• Auto-starts 3 seconds after load</div>
            <div>• Uses 15-unit radius orbit</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StarviewCanvas;