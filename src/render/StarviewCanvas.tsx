import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { StarsCatalog } from '../data/StarsCatalog';
import { HygStarData, SuggestedStar } from '../types';
import { Starfield } from './Starfield';
import { AnimationController } from './AnimationController';
import { useSuggestedStars } from '../context/SuggestedStarsContext';

/**
 * StarviewCanvas Component - Enhanced with Refined Architecture
 * 
 * Purpose: 3D visualization canvas that integrates with the refined star architecture.
 * Uses StarsCatalog as the single source of truth and SuggestedStars for highlighting.
 * 
 * Features:
 * - StarsCatalog integration for all star data
 * - SuggestedStars context for highlighting and selection
 * - Enhanced rendering modes (classic/instanced)
 * - Camera focus and animation control
 * - Clean separation of concerns
 * 
 * Confidence Rating: High - Clean integration with refined architecture
 */

interface StarviewCanvasProps {
  starsCatalog: StarsCatalog | null;
  catalogLoading: boolean;
  selectedStar?: HygStarData | null;
  onStarSelect?: (star: HygStarData | null, index: number | null) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  renderingMode?: 'classic' | 'instanced';
  onStarClick?: (star: HygStarData) => void;
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
 * StarfieldWrapper Component - Enhanced with SuggestedStars integration
 */
function StarfieldWrapper({ 
  starsCatalog, 
  selectedStar, 
  onStarSelect, 
  onStarFocus,
  starSize = 0.1, 
  glowMultiplier = 1.0, 
  showLabels = false,
  renderingMode = 'classic',
  onStarClick
}: { 
  starsCatalog: StarsCatalog;
  selectedStar?: HygStarData | null;
  onStarSelect?: (star: HygStarData | null, index: number | null) => void;
  onStarFocus?: (star: HygStarData) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  renderingMode?: 'classic' | 'instanced';
  onStarClick?: (star: HygStarData) => void;
}) {
  
  const { suggestedStars, isStarSuggested } = useSuggestedStars();
  
  // Convert StarsCatalog data to Starfield format with SuggestedStars highlighting
  const catalogData = useMemo(() => {
    if (!starsCatalog) {
      console.log('StarfieldWrapper: No catalog available');
      return [];
    }

    console.log(`StarfieldWrapper: Processing StarsCatalog for ${renderingMode} rendering mode...`);
    console.log(`StarfieldWrapper: ${suggestedStars.length} suggested stars for highlighting`);
    
    // Get stars based on rendering mode
    let starsToProcess: HygStarData[];
    if (renderingMode === 'classic') {
      starsToProcess = starsCatalog.getStarsByMagnitude(-2, 6.5).slice(0, 5000);
      console.log(`StarfieldWrapper: Classic mode - processing ${starsToProcess.length} filtered stars`);
    } else {
      starsToProcess = starsCatalog.getAllStars();
      console.log(`StarfieldWrapper: Instanced mode - processing ALL ${starsToProcess.length} stars`);
    }

    return starsToProcess.map((catalogStar) => {
      const catalogId = catalogStar.hyg.id.toString();
      const isSuggested = isStarSuggested(catalogId);
      
      return {
        id: catalogId,
        position: catalogStar.render.position,
        magnitude: catalogStar.hyg.mag,
        name: catalogStar.hyg.proper || undefined,
        isHighlighted: isSuggested,
        catalogStar: catalogStar, // Include full catalog data
        // Enhanced highlighting properties
        enhancedSize: isSuggested ? 2.5 : 1.0,
        enhancedGlow: isSuggested ? 2.0 : 1.0,
        emotionColor: isSuggested ? '#7FFF94' : undefined, // Aurora green for suggested
        showLabel: isSuggested && catalogStar.hyg.proper
      };
    });
  }, [starsCatalog, suggestedStars, isStarSuggested, renderingMode]);

  // Handle star selection from Starfield
  const handleStarSelect = useCallback((starId: string) => {
    if (!starsCatalog || !onStarSelect) return;

    if (renderingMode === 'instanced') {
      console.log('StarfieldWrapper: Star selection disabled for performance in instanced mode');
      return;
    }

    const catalogStar = starsCatalog.getStarById(parseInt(starId));
    
    if (catalogStar) {
      console.log('StarfieldWrapper: Star selected:', catalogStar.hyg.proper || catalogStar.hyg.id);
      onStarSelect(catalogStar, parseInt(starId));
      
      if (onStarFocus) {
        onStarFocus(catalogStar);
      }
    }
  }, [starsCatalog, onStarSelect, onStarFocus, renderingMode]);

  // Handle star click for modal display
  const handleStarClick = useCallback((starId: string) => {
    if (!starsCatalog || !onStarClick) return;

    console.log('StarfieldWrapper: Star clicked for modal display:', starId);

    const catalogStar = starsCatalog.getStarById(parseInt(starId));
    if (catalogStar) {
      console.log('StarfieldWrapper: Triggering modal for star:', catalogStar.hyg.proper || catalogStar.hyg.id);
      onStarClick(catalogStar);
    }
  }, [starsCatalog, onStarClick]);

  // Get selected star ID for Starfield
  const selectedStarId = selectedStar ? selectedStar.hyg.id.toString() : null;

  return (
    <Starfield
      catalog={catalogData}
      selectedStar={selectedStarId}
      onStarSelect={handleStarSelect}
      starSize={starSize}
      glowMultiplier={glowMultiplier}
      showLabels={showLabels}
      renderingMode={renderingMode}
      onStarClick={handleStarClick}
    />
  );
}

/**
 * Scene Content Component - Enhanced with refined architecture
 */
function SceneContent({ 
  starsCatalog, 
  catalogLoading, 
  selectedStar, 
  onStarSelect, 
  starSize, 
  glowMultiplier, 
  showLabels,
  onPointerMissed,
  renderingMode = 'classic',
  onStarClick
}: {
  starsCatalog: StarsCatalog | null;
  catalogLoading: boolean;
  selectedStar?: HygStarData | null;
  onStarSelect?: (star: HygStarData | null, index: number | null) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  onPointerMissed: () => void;
  renderingMode?: 'classic' | 'instanced';
  onStarClick?: (star: HygStarData) => void;
}) {
  const cameraControlsRef = useRef<CameraControls>(null);
  const [animationCommand, setAnimationCommand] = useState<AnimationCommand | null>(null);
  const { suggestedStars, focusedStarIndex } = useSuggestedStars();

  // Auto-center camera when suggested stars are available
  useEffect(() => {
    if (suggestedStars.length > 0 && !selectedStar && focusedStarIndex === null) {
      console.log('SceneContent: Auto-centering camera for suggested stars');
      
      setAnimationCommand({
        type: 'centerView',
        target: {
          position: [0, 0, 0]
        },
        duration: 2000
      });
    } else if (!selectedStar && focusedStarIndex === null && suggestedStars.length === 0) {
      console.log('SceneContent: No suggested stars - starting default orbit animation');
      
      setAnimationCommand({
        type: 'orbit',
        center: [0, 0, 0],
        radius: 8,
        speed: 0.3,
        elevation: 0.2
      });
    }
  }, [selectedStar, focusedStarIndex, suggestedStars.length]);

  // Handle star focus animation
  const handleStarFocus = useCallback((star: HygStarData) => {
    console.log('SceneContent: Focusing camera on star:', star.hyg.proper || star.hyg.id);
    
    setAnimationCommand({
      type: 'focusStar',
      target: {
        position: star.render.position
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
      {/* Mode-aware lighting */}
      {renderingMode === 'classic' ? (
        <>
          <ambientLight intensity={0.3} color="#60A5FA" />
          <directionalLight position={[10, 10, 5]} intensity={0.6} color="#93C5FD" />
          <pointLight position={[-10, -10, -5]} intensity={0.4} color="#3B82F6" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.4} color="#60A5FA" />
          <directionalLight position={[10, 10, 5]} intensity={0.3} color="#93C5FD" />
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
      
      {/* Render star field */}
      {starsCatalog && !catalogLoading && (
        <StarfieldWrapper 
          starsCatalog={starsCatalog}
          selectedStar={selectedStar}
          onStarSelect={onStarSelect}
          onStarFocus={handleStarFocus}
          starSize={starSize}
          glowMultiplier={glowMultiplier}
          showLabels={showLabels}
          renderingMode={renderingMode}
          onStarClick={onStarClick}
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
 * Main StarviewCanvas Component - Enhanced with refined architecture
 */
export function StarviewCanvas({ 
  starsCatalog, 
  catalogLoading, 
  selectedStar, 
  onStarSelect, 
  starSize = 0.1, 
  glowMultiplier = 1.0, 
  showLabels = false,
  renderingMode = 'classic',
  onStarClick
}: StarviewCanvasProps) {
  
  const handlePointerMissed = useCallback(() => {
    console.log('StarviewCanvas: Pointer missed event');
  }, []);

  console.log(`StarviewCanvas: Initializing with ${renderingMode} rendering mode and refined architecture`);

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
        <SceneContent
          starsCatalog={starsCatalog}
          catalogLoading={catalogLoading}
          selectedStar={selectedStar}
          onStarSelect={onStarSelect}
          starSize={starSize}
          glowMultiplier={glowMultiplier}
          showLabels={showLabels}
          onPointerMissed={handlePointerMissed}
          renderingMode={renderingMode}
          onStarClick={onStarClick}
        />
      </Canvas>
    </div>
  );
}

export default StarviewCanvas;