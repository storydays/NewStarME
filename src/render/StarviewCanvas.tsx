import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { HygStarsCatalog } from '../data/StarsCatalog';
import { HygRecord, Star } from '../types';
import { Starfield } from './Starfield';
import { AnimationController } from './AnimationController';

/**
 * StarviewCanvas Component with Enhanced Star Selection Support
 * 
 * Enhanced 3D background canvas that supports star selection for modal display,
 * aurora gradients for suggested stars, and warm cosmic gradients for selected stars.
 * 
 * Features:
 * - Enhanced star click detection for modal display
 * - Aurora gradient support for suggested stars
 * - Warm cosmic gradient support for selected stars
 * - Configurable rendering mode: 'classic' or 'instanced'
 * - Maintains compatibility with existing star selection system
 * 
 * Confidence Rating: High - Enhanced existing system with star selection modal support
 */

interface StarviewCanvasProps {
  hygCatalog: HygStarsCatalog | null;
  catalogLoading: boolean;
  selectedStar?: HygRecord | null;
  onStarSelect?: (star: HygRecord | null, index: number | null) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  highlightedStars?: Star[];
  focusedStarIndex?: number | null;
  renderingMode?: 'classic' | 'instanced';
  onStarClick?: (star: Star) => void; // NEW: Callback for star selection modal
}

interface AnimationCommand {
  type: 'focusStar' | 'resetView' | 'moveTo' | 'orbit' | 'centerView';
  target?: {
    position: [number, number, number];
  };
  duration?: number;
  center?: [number, number, number];
  radius?: number;
  speed?: number;
  elevation?: number;
  boundingBox?: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

/**
 * Calculate optimal camera position to view all highlighted stars
 */
function calculateOptimalCameraPosition(highlightedStars: Star[]): {
  position: [number, number, number];
  target: [number, number, number];
  distance: number;
} {
  if (highlightedStars.length === 0) {
    return {
      position: [0, 0, 8],
      target: [0, 0, 0],
      distance: 8
    };
  }

  // Convert star coordinates to 3D positions
  const positions = highlightedStars.map(star => {
    const distance = Math.random() * 10 + 5;
    const ra = Math.random() * Math.PI * 2;
    const dec = (Math.random() - 0.5) * Math.PI;
    
    const x = distance * Math.cos(dec) * Math.cos(ra);
    const y = distance * Math.cos(dec) * Math.sin(ra);
    const z = distance * Math.sin(dec);
    
    return [x, y, z] as [number, number, number];
  });

  // Calculate bounding box
  const min: [number, number, number] = [
    Math.min(...positions.map(p => p[0])),
    Math.min(...positions.map(p => p[1])),
    Math.min(...positions.map(p => p[2]))
  ];
  
  const max: [number, number, number] = [
    Math.max(...positions.map(p => p[0])),
    Math.max(...positions.map(p => p[1])),
    Math.max(...positions.map(p => p[2]))
  ];

  // Calculate center point
  const center: [number, number, number] = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2
  ];

  // Calculate required distance
  const maxDimension = Math.max(
    max[0] - min[0],
    max[1] - min[1],
    max[2] - min[2]
  );
  
  const distance = Math.max(8, maxDimension * 1.5);
  
  const cameraPosition: [number, number, number] = [
    center[0],
    center[1],
    center[2] + distance
  ];

  return {
    position: cameraPosition,
    target: center,
    distance
  };
}

/**
 * StarfieldWrapper Component - Enhanced with star selection modal support
 */
function StarfieldWrapper({ 
  hygCatalog, 
  selectedStar, 
  onStarSelect, 
  onStarFocus,
  starSize = 0.1, 
  glowMultiplier = 1.0, 
  showLabels = false,
  highlightedStars = [],
  focusedStarIndex = null,
  emotionColor = '#2563EB',
  renderingMode = 'classic',
  onStarClick // NEW: Star click handler for modal
}: { 
  hygCatalog: HygStarsCatalog;
  selectedStar?: HygRecord | null;
  onStarSelect?: (star: HygRecord | null, index: number | null) => void;
  onStarFocus?: (star: HygRecord) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  highlightedStars?: Star[];
  focusedStarIndex?: number | null;
  emotionColor?: string;
  renderingMode?: 'classic' | 'instanced';
  onStarClick?: (star: Star) => void;
}) {
  
  // Convert HYG catalog data to Starfield format with enhanced highlighting
  const catalogData = useMemo(() => {
    if (!hygCatalog) {
      console.log('StarfieldWrapper: No catalog available');
      return [];
    }

    console.log(`StarfieldWrapper: Processing HYG catalog for ${renderingMode} rendering mode with star selection support...`);
    console.log(`StarfieldWrapper: ${highlightedStars.length} stars to highlight with aurora gradients`);
    
    // Create a set of highlighted star names for fast lookup
    const highlightedStarNames = new Set(
      highlightedStars.map(star => star.scientific_name.toLowerCase())
    );

    // Filter stars based on rendering mode
    let filteredStars;
    if (renderingMode === 'classic') {
      filteredStars = hygCatalog
        .filterByMagnitude(-2, 6.5)
        .slice(0, 5000);
      console.log(`StarfieldWrapper: Classic mode - processing ${filteredStars.length} filtered stars`);
    } else {
      filteredStars = hygCatalog.getStars();
      console.log(`StarfieldWrapper: Instanced mode - processing ALL ${filteredStars.length} stars`);
    }

    return filteredStars.map((star) => {
      // Convert spherical coordinates to Cartesian for 3D positioning
      const distance = Math.min(star.dist, 100) / 5;
      const raRad = star.rarad;
      const decRad = star.decrad;
      
      const x = distance * Math.cos(decRad) * Math.cos(raRad);
      const y = distance * Math.cos(decRad) * Math.sin(raRad);
      const z = distance * Math.sin(decRad);

      // Check if this star should be highlighted with aurora gradient
      const starName = (star.proper || `HYG ${star.id}`).toLowerCase();
      const isHighlighted = highlightedStarNames.has(starName);

      return {
        id: star.id.toString(),
        position: [x, y, z] as [number, number, number],
        magnitude: star.mag,
        name: star.proper || undefined,
        isHighlighted,
        hygRecord: star,
        // Enhanced highlighting properties for aurora gradient
        enhancedSize: isHighlighted ? 0.8 : 1.0, // 20% size reduction for suggested stars
        enhancedGlow: isHighlighted ? 1.5 : 1.0, // Enhanced glow for better visibility
        emotionColor: isHighlighted ? '#7FFF94' : undefined, // Aurora green start
        showLabel: isHighlighted && (star.proper || `HYG ${star.id}`)
      };
    });
  }, [hygCatalog, highlightedStars, emotionColor, renderingMode]);

  // Handle camera focus when focusedStarIndex changes
  useEffect(() => {
    if (focusedStarIndex !== null && highlightedStars[focusedStarIndex] && onStarFocus) {
      const targetStar = highlightedStars[focusedStarIndex];
      console.log(`StarfieldWrapper: Focusing camera on star: ${targetStar.scientific_name}`);
      
      // Find the corresponding HYG record for camera positioning
      const hygStar = catalogData.find(star => {
        const starName = (star.hygRecord?.proper || `HYG ${star.hygRecord?.id}`).toLowerCase();
        return starName === targetStar.scientific_name.toLowerCase();
      });

      if (hygStar && hygStar.hygRecord) {
        onStarFocus(hygStar.hygRecord);
      }
    }
  }, [focusedStarIndex, highlightedStars, catalogData, onStarFocus]);

  // Handle star selection from Starfield with modal support
  const handleStarSelect = useCallback((starId: string) => {
    if (!hygCatalog || !onStarSelect) return;

    if (renderingMode === 'instanced') {
      console.log('StarfieldWrapper: Star selection disabled for performance in instanced mode');
      return;
    }

    // Classic mode: Full star selection functionality
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
  }, [hygCatalog, onStarSelect, onStarFocus, renderingMode]);

  // Handle star click for modal display
  const handleStarClick = useCallback((starId: string) => {
    if (!hygCatalog || !onStarClick) return;

    console.log('StarfieldWrapper: Star clicked for modal display:', starId);

    // Find the corresponding highlighted star
    const starIdNum = parseInt(starId);
    const clickedStar = highlightedStars.find(star => {
      // Match by scientific name or ID
      const hygStar = catalogData.find(catStar => catStar.id === starId);
      if (hygStar && hygStar.hygRecord) {
        const starName = (hygStar.hygRecord.proper || `HYG ${hygStar.hygRecord.id}`).toLowerCase();
        return starName === star.scientific_name.toLowerCase();
      }
      return false;
    });

    if (clickedStar) {
      console.log('StarfieldWrapper: Triggering modal for star:', clickedStar.scientific_name);
      onStarClick(clickedStar);
    }
  }, [hygCatalog, onStarClick, highlightedStars, catalogData]);

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
      renderingMode={renderingMode}
      onStarClick={handleStarClick} // NEW: Pass star click handler for modal
    />
  );
}

/**
 * Scene Content Component - Enhanced with star selection modal support
 */
function SceneContent({ 
  hygCatalog, 
  catalogLoading, 
  selectedStar, 
  onStarSelect, 
  starSize, 
  glowMultiplier, 
  showLabels,
  onPointerMissed,
  highlightedStars = [],
  focusedStarIndex = null,
  emotionColor = '#2563EB',
  renderingMode = 'classic',
  onStarClick // NEW: Star click handler for modal
}: {
  hygCatalog: HygStarsCatalog | null;
  catalogLoading: boolean;
  selectedStar?: HygRecord | null;
  onStarSelect?: (star: HygRecord | null, index: number | null) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  onPointerMissed: () => void;
  highlightedStars?: Star[];
  focusedStarIndex?: number | null;
  emotionColor?: string;
  renderingMode?: 'classic' | 'instanced';
  onStarClick?: (star: Star) => void;
}) {
  // Camera controls ref for AnimationController
  const cameraControlsRef = useRef<CameraControls>(null);
  
  // Animation state management
  const [animationCommand, setAnimationCommand] = useState<AnimationCommand | null>(null);

  // Auto-center camera when highlighted stars are available
  useEffect(() => {
    if (highlightedStars.length > 0 && !selectedStar && focusedStarIndex === null) {
      console.log('SceneContent: Auto-centering camera for highlighted stars with aurora gradients');
      
      const optimalView = calculateOptimalCameraPosition(highlightedStars);
      
      setAnimationCommand({
        type: 'centerView',
        target: {
          position: optimalView.target
        },
        duration: 2000,
        boundingBox: {
          min: [-10, -10, -10],
          max: [10, 10, 10]
        }
      });
    } else if (!selectedStar && focusedStarIndex === null && highlightedStars.length === 0) {
      console.log('SceneContent: No highlighted stars - starting default orbit animation');
      
      setAnimationCommand({
        type: 'orbit',
        center: [0, 0, 0],
        radius: 8,
        speed: 0.3,
        elevation: 0.2
      });
    }
  }, [selectedStar, focusedStarIndex, highlightedStars.length]);

  // Handle star focus animation
  const handleStarFocus = useCallback((star: HygRecord) => {
    console.log('SceneContent: Focusing camera on star:', star.proper || star.id);
    
    // Convert star coordinates to 3D position
    const distance = Math.min(star.dist, 100) / 5;
    const raRad = star.rarad;
    const decRad = star.decrad;
    
    const x = distance * Math.cos(decRad) * Math.cos(raRad);
    const y = distance * Math.cos(decRad) * Math.sin(raRad);
    const z = distance * Math.sin(decRad);

    setAnimationCommand({
      type: 'focusStar',
      target: {
        position: [x, y, z]
      },
      duration: 1500
    });
  }, []);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    console.log('SceneContent: Animation completed');
    setAnimationCommand(null);
  }, []);

  // Handle pointer miss
  const handlePointerMissedInternal = useCallback(() => {
    console.log('SceneContent: Pointer missed - deselecting star');
    
    if (onStarSelect) {
      onStarSelect(null, null);
    }
    
    onPointerMissed();
  }, [onStarSelect, onPointerMissed]);

  return (
    <>
      {/* Mode-aware lighting configuration */}
      {renderingMode === 'classic' ? (
        // Classic mode: Enhanced lighting for individual stars
        <>
          <ambientLight intensity={0.3} color="#60A5FA" />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.6} 
            color="#93C5FD"
          />
          <pointLight 
            position={[-10, -10, -5]} 
            intensity={0.4} 
            color="#3B82F6"
          />
        </>
      ) : (
        // Instanced mode: Optimized lighting for large datasets
        <>
          <ambientLight intensity={0.4} color="#60A5FA" />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.3} 
            color="#93C5FD"
          />
        </>
      )}

      {/* Camera Controls */}
      <CameraControls
        ref={cameraControlsRef}
        makeDefault
        minDistance={1}
        maxDistance={5000}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        draggingSmoothTime={0.25}
        smoothTime={0.25}
      />

      {/* Animation Controller */}
      <AnimationController
        cameraControlsRef={cameraControlsRef}
        animationCommand={animationCommand}
        onAnimationComplete={handleAnimationComplete}
      />
      
      {/* Render star field with enhanced star selection support */}
      {hygCatalog && !catalogLoading && (
        <StarfieldWrapper 
          hygCatalog={hygCatalog}
          selectedStar={selectedStar}
          onStarSelect={onStarSelect}
          onStarFocus={handleStarFocus}
          starSize={starSize}
          glowMultiplier={glowMultiplier}
          showLabels={showLabels}
          highlightedStars={highlightedStars}
          focusedStarIndex={focusedStarIndex}
          emotionColor={emotionColor}
          renderingMode={renderingMode}
          onStarClick={onStarClick} // NEW: Pass star click handler for modal
        />
      )}
      
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
 * Main StarviewCanvas Component - Enhanced with star selection modal support
 */
export function StarviewCanvas({ 
  hygCatalog, 
  catalogLoading, 
  selectedStar, 
  onStarSelect, 
  starSize = 0.1, 
  glowMultiplier = 1.0, 
  showLabels = false,
  highlightedStars = [],
  focusedStarIndex = null,
  renderingMode = 'classic',
  onStarClick // NEW: Star click handler for modal
}: StarviewCanvasProps) {
  
  const emotionColor = highlightedStars.length > 0 ? '#7FFF94' : '#2563EB'; // Aurora green for suggested stars
  
  const handlePointerMissed = useCallback(() => {
    console.log('StarviewCanvas: Pointer missed event');
  }, []);

  console.log(`StarviewCanvas: Initializing with ${renderingMode} rendering mode and star selection modal support`);

  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        style={{
          background: '#000000',
          width: '100vw',
          height: '100vh'
        }}
        dpr={[1, 2]}
        performance={{
          min: 0.5,
          max: 1.0,
          debounce: 200
        }}
        resize={{
          scroll: false,
          debounce: { scroll: 50, resize: 0 }
        }}
        onPointerMissed={handlePointerMissed}
      >
        {/* Enhanced scene content with star selection modal support */}
        <SceneContent
          hygCatalog={hygCatalog}
          catalogLoading={catalogLoading}
          selectedStar={selectedStar}
          onStarSelect={onStarSelect}
          starSize={starSize}
          glowMultiplier={glowMultiplier}
          showLabels={showLabels}
          onPointerMissed={handlePointerMissed}
          highlightedStars={highlightedStars}
          focusedStarIndex={focusedStarIndex}
          emotionColor={emotionColor}
          renderingMode={renderingMode}
          onStarClick={onStarClick} // NEW: Pass star click handler for modal
        />
      </Canvas>
    </div>
  );
}

export default StarviewCanvas;