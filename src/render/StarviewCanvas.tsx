import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { HygStarsCatalog } from '../data/StarsCatalog';
import { HygRecord } from '../types';
import { Starfield } from './Starfield';
import { AnimationController } from './AnimationController';

/**
 * StarviewCanvas Component with AnimationController Integration
 * 
 * Enhanced 3D background canvas that utilizes real star data from the HYG catalog
 * and provides smooth camera animations for star selection and navigation.
 * 
 * Features:
 * - Accepts HYG catalog as prop for real star data
 * - Integrated AnimationController for smooth camera transitions
 * - Camera controls with CameraControls from drei
 * - Star selection with automatic camera focus animations
 * - Initial animation on page load for engaging user experience
 * - Graceful fallback when catalog is not available
 * - Performance optimized with proper star filtering
 * - Cosmic-themed dark background
 * 
 * Confidence Rating: High - Complete integration with AnimationController and initial animation
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

interface AnimationCommand {
  type: 'focusStar' | 'resetView' | 'moveTo';
  target?: {
    position: [number, number, number];
  };
  duration?: number;
}

/**
 * StarfieldWrapper Component
 * Converts HYG catalog data to Starfield component format and handles star selection
 */
function StarfieldWrapper({ 
  hygCatalog, 
  selectedStar, 
  onStarSelect, 
  onStarFocus,
  starSize = 0.1, 
  glowMultiplier = 1.0, 
  showLabels = false 
}: { 
  hygCatalog: HygStarsCatalog;
  selectedStar?: HygRecord | null;
  onStarSelect?: (star: HygRecord | null, index: number | null) => void;
  onStarFocus?: (star: HygRecord) => void;
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
      
      // Update selection state
      onStarSelect(selectedHygStar, starIdNum);
      
      // Trigger camera animation to focus on the star
      if (onStarFocus) {
        onStarFocus(selectedHygStar);
      }
    }
  }, [hygCatalog, onStarSelect, onStarFocus]);

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
 * Scene Content Component
 * Contains all 3D scene elements including camera controls, animation controller, and starfield
 * Now includes initial animation trigger on component mount
 */
function SceneContent({ 
  hygCatalog, 
  catalogLoading, 
  selectedStar, 
  onStarSelect, 
  starSize, 
  glowMultiplier, 
  showLabels,
  onPointerMissed 
}: {
  hygCatalog: HygStarsCatalog | null;
  catalogLoading: boolean;
  selectedStar?: HygRecord | null;
  onStarSelect?: (star: HygRecord | null, index: number | null) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  onPointerMissed: () => void;
}) {
  // Camera controls ref for AnimationController
  const cameraControlsRef = useRef<CameraControls>(null);
  
  // Animation state management
  const [animationCommand, setAnimationCommand] = useState<AnimationCommand | null>(null);

  // INITIAL ANIMATION: Trigger resetView animation when component mounts
  useEffect(() => {
    console.log('SceneContent: Component mounted, triggering initial animation');
    
    // Set a slight delay to ensure camera controls are ready
    const timer = setTimeout(() => {
      setAnimationCommand({
        type: 'resetView',
        duration: 2000 // 2 second smooth animation to default position
      });
    }, 500); // 500ms delay to ensure everything is initialized

    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle star focus animation
  const handleStarFocus = useCallback((star: HygRecord) => {
    console.log('SceneContent: Focusing camera on star:', star.proper || star.id);
    
    // Convert star coordinates to 3D position for animation
    const distance = Math.min(star.dist, 100) / 5;
    const raRad = star.rarad;
    const decRad = star.decrad;
    
    const x = distance * Math.cos(decRad) * Math.cos(raRad);
    const y = distance * Math.cos(decRad) * Math.sin(raRad);
    const z = distance * Math.sin(decRad);

    // Set animation command to focus on the star
    setAnimationCommand({
      type: 'focusStar',
      target: {
        position: [x, y, z]
      },
      duration: 2000
    });
  }, []);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    console.log('SceneContent: Animation completed');
    setAnimationCommand(null);
  }, []);

  // Handle pointer miss (clicking on empty space)
  const handlePointerMissedInternal = useCallback(() => {
    console.log('SceneContent: Pointer missed - resetting view');
    
    // Deselect star
    if (onStarSelect) {
      onStarSelect(null, null);
    }
    
    // Reset camera view
    setAnimationCommand({
      type: 'resetView',
      duration: 1500
    });
    
    // Call parent handler
    onPointerMissed();
  }, [onStarSelect, onPointerMissed]);

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

      {/* Camera Controls - enables user interaction and provides ref for AnimationController */}
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

      {/* AnimationController - manages smooth camera transitions */}
      <AnimationController
        cameraControlsRef={cameraControlsRef}
        animationCommand={animationCommand}
        onAnimationComplete={handleAnimationComplete}
      />
      
      {/* Render real stars if catalog is available and loaded */}
      {hygCatalog && !catalogLoading && (
        <StarfieldWrapper 
          hygCatalog={hygCatalog}
          selectedStar={selectedStar}
          onStarSelect={onStarSelect}
          onStarFocus={handleStarFocus}
          starSize={starSize}
          glowMultiplier={glowMultiplier}
          showLabels={showLabels}
        />
      )}
      
      {/* Cosmic fog for depth perception */}
      <fog attach="fog" args={['#0A0A0F', 5, 20]} />
      
      {/* Invisible plane for pointer miss detection */}
      <mesh
        position={[0, 0, -50]}
        onPointerMissed={handlePointerMissedInternal}
        visible={false}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

/**
 * StarviewCanvas Component
 * Main R3F canvas component that renders the 3D background scene with integrated AnimationController
 * 
 * Features:
 * - Full viewport coverage with fixed positioning
 * - Stays behind UI elements with z-index: -1
 * - Responsive to window resize events
 * - Optimized performance with proper camera settings
 * - Cosmic-themed dark background
 * - Real star data integration when available
 * - Smooth camera animations for star selection
 * - Interactive camera controls with mouse/touch support
 * - Initial animation on page load for engaging experience
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
    console.log('StarviewCanvas: Pointer missed event');
  }, []);

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
        {/* Scene content with integrated AnimationController and initial animation */}
        <SceneContent
          hygCatalog={hygCatalog}
          catalogLoading={catalogLoading}
          selectedStar={selectedStar}
          onStarSelect={onStarSelect}
          starSize={starSize}
          glowMultiplier={glowMultiplier}
          showLabels={showLabels}
          onPointerMissed={handlePointerMissed}
        />
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
          <div className="text-cosmic-cherenkov-blue">✨ AnimationController active</div>
          <div className="text-green-400">🎬 Initial animation enabled</div>
          <div>Click stars for smooth camera focus</div>
        </div>
      )}
    </div>
  );
}

export default StarviewCanvas;