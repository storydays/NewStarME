import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { StarsCatalog } from '../data/StarsCatalog';
import { HygStarData } from '../types';
import { Starfield } from './Starfield';
import { AnimationController } from './AnimationController';
import { STAR_SETTINGS, MAX_CLASSIC_RENDER_STARS } from '../config/starConfig';

/**
 * StarviewCanvas Component - Enhanced with STAR_SETTINGS Configuration
 * 
 * Purpose: Pure rendering component that accepts all data via props.
 * UPDATED: Uses STAR_SETTINGS configuration with comprehensive star settings and configurable star count.
 * 
 * Features:
 * - Render stars from StarsCatalog
 * - Accept highlightedStarIds prop for visual emphasis
 * - Expose camera control via props
 * - Notify parent on star clicks via callbacks
 * - Clean separation from business logic
 * - STAR_SETTINGS configuration with size and glow multipliers
 * - Configurable maximum star count for classic rendering
 * 
 * Confidence Rating: High - Enhanced with comprehensive star configuration
 */

interface StarviewCanvasProps {
  starsCatalog: StarsCatalog | null;
  catalogLoading: boolean;
  selectedStar?: HygStarData | null;
  highlightedStarIds: string[];
  onStarSelect?: (star: HygStarData | null, index: number | null) => void;
  onStarClick?: (star: HygStarData) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  renderingMode?: 'classic' | 'instanced';
  cameraCommand?: any;
  onCameraCommandComplete?: () => void;
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
 * StarfieldWrapper Component - Enhanced with STAR_SETTINGS and Configurable Star Count
 * UPDATED: Uses string-based highlightedStarIds for comparison and configurable MAX_CLASSIC_RENDER_STARS
 */
function StarfieldWrapper({ 
  starsCatalog, 
  selectedStar, 
  highlightedStarIds,
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
  highlightedStarIds: string[];
  onStarSelect?: (star: HygStarData | null, index: number | null) => void;
  onStarFocus?: (star: HygStarData) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  renderingMode?: 'classic' | 'instanced';
  onStarClick?: (star: HygStarData) => void;
}) {
  
  // Convert StarsCatalog data to Starfield format with STAR_SETTINGS and configurable star count
  const catalogData = useMemo(() => {
    if (!starsCatalog) {
      console.log('StarfieldWrapper: No catalog available');
      return [];
    }

    console.log(`StarfieldWrapper: Processing StarsCatalog for ${renderingMode} rendering mode with STAR_SETTINGS...`);
    console.log(`StarfieldWrapper: ${highlightedStarIds.length} stars to highlight`);
    
    // Create set for fast lookup
    const highlightedSet = new Set(highlightedStarIds);
    
    // Get stars based on rendering mode with configurable star count
    let starsToProcess: HygStarData[];
    if (renderingMode === 'classic') {
      starsToProcess = starsCatalog.getStarsByMagnitude(-2, 6.5).slice(0, MAX_CLASSIC_RENDER_STARS);
      console.log(`StarfieldWrapper: Classic mode - processing ${starsToProcess.length} filtered stars (max: ${MAX_CLASSIC_RENDER_STARS})`);
    } else {
      starsToProcess = starsCatalog.getAllStars();
      console.log(`StarfieldWrapper: Instanced mode - processing ALL ${starsToProcess.length} stars`);
    }

    return starsToProcess.map((catalogStar) => {
      const catalogId = catalogStar.hyg.id.toString();
      const isHighlighted = highlightedSet.has(catalogId);
      
      // Determine settings based on star state using STAR_SETTINGS
      let finalSettings = STAR_SETTINGS.regular;
      if (selectedStar && selectedStar.hyg.id.toString() === catalogId) {
        finalSettings = STAR_SETTINGS.selected;
      } else if (isHighlighted) {
        finalSettings = STAR_SETTINGS.highlighted;
      }
      
      return {
        id: catalogId,
        position: catalogStar.render.position,
        magnitude: catalogStar.hyg.mag,
        name: catalogStar.hyg.proper || undefined,
        isHighlighted,
        catalogStar: catalogStar,
        enhancedSize: finalSettings.sizeMultiplier,
        enhancedGlow: finalSettings.glowMultiplier,
        emotionColor: finalSettings.color,
        showLabel: isHighlighted && catalogStar.hyg.proper
      };
    });
  }, [starsCatalog, highlightedStarIds, selectedStar, renderingMode]);

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
 * Scene Content Component - Enhanced with STAR_SETTINGS
 */
function SceneContent({ 
  starsCatalog, 
  catalogLoading, 
  selectedStar, 
  highlightedStarIds,
  onStarSelect, 
  starSize, 
  glowMultiplier, 
  showLabels,
  onPointerMissed,
  renderingMode = 'classic',
  onStarClick,
  cameraCommand,
  onCameraCommandComplete
}: {
  starsCatalog: StarsCatalog | null;
  catalogLoading: boolean;
  selectedStar?: HygStarData | null;
  highlightedStarIds: string[];
  onStarSelect?: (star: HygStarData | null, index: number | null) => void;
  starSize?: number;
  glowMultiplier?: number;
  showLabels?: boolean;
  onPointerMissed: () => void;
  renderingMode?: 'classic' | 'instanced';
  onStarClick?: (star: HygStarData) => void;
  cameraCommand?: any;
  onCameraCommandComplete?: () => void;
}) {
  const cameraControlsRef = useRef<CameraControls>(null);
  const [animationCommand, setAnimationCommand] = useState<AnimationCommand | null>(null);

  // Handle camera commands from useStarviewCamera
  useEffect(() => {
    if (!cameraCommand || !starsCatalog) return;

    console.log('SceneContent: Processing camera command:', cameraCommand);

    if (cameraCommand.type === 'focusStar' && cameraCommand.starCatalogId) {
      const catalogStar = starsCatalog.getStarById(parseInt(cameraCommand.starCatalogId));
      if (catalogStar) {
        console.log('SceneContent: Focusing camera on star:', catalogStar.hyg.proper || catalogStar.hyg.id);
        setAnimationCommand({
          type: 'focusStar',
          target: {
            position: catalogStar.render.position
          },
          duration: 1500
        });
      }
    } else if (cameraCommand.type === 'resetView') {
      console.log('SceneContent: Resetting camera view');
      setAnimationCommand({
        type: 'resetView',
        duration: 1500
      });
    } else if (cameraCommand.type === 'centerView') {
      console.log('SceneContent: Centering camera view');
      setAnimationCommand({
        type: 'centerView',
        target: {
          position: [0, 0, 0]
        },
        duration: 2000
      });
    }
  }, [cameraCommand, starsCatalog]);

  // Auto-center camera when highlighted stars are available
  useEffect(() => {
    if (highlightedStarIds.length > 0 && !selectedStar) {
      console.log('SceneContent: Auto-centering camera for highlighted stars');
      
      setAnimationCommand({
        type: 'centerView',
        target: {
          position: [0, 0, 0]
        },
        duration: 2000
      });
    } else if (!selectedStar && highlightedStarIds.length === 0) {
      console.log('SceneContent: No highlighted stars - starting default orbit animation');
      
      setAnimationCommand({
        type: 'orbit',
        center: [0, 0, 0],
        radius: 8,
        speed: 0.3,
        elevation: 0.2
      });
    }
  }, [selectedStar, highlightedStarIds.length]);

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
    if (onCameraCommandComplete) {
      onCameraCommandComplete();
    }
  }, [onCameraCommandComplete]);

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
      
      {/* Render star field with STAR_SETTINGS */}
      {starsCatalog && !catalogLoading && (
        <StarfieldWrapper 
          starsCatalog={starsCatalog}
          selectedStar={selectedStar}
          highlightedStarIds={highlightedStarIds}
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
 * Main StarviewCanvas Component - Enhanced with STAR_SETTINGS
 */
export function StarviewCanvas({ 
  starsCatalog, 
  catalogLoading, 
  selectedStar, 
  highlightedStarIds,
  onStarSelect, 
  onStarClick,
  starSize = 0.1, 
  glowMultiplier = 1.0, 
  showLabels = false,
  renderingMode = 'classic',
  cameraCommand,
  onCameraCommandComplete
}: StarviewCanvasProps) {
  
  const handlePointerMissed = useCallback(() => {
    console.log('StarviewCanvas: Pointer missed event');
  }, []);

  console.log(`StarviewCanvas: Rendering with ${highlightedStarIds.length} highlighted stars in ${renderingMode} mode using STAR_SETTINGS (max classic stars: ${MAX_CLASSIC_RENDER_STARS})`);

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
          highlightedStarIds={highlightedStarIds}
          onStarSelect={onStarSelect}
          starSize={starSize}
          glowMultiplier={glowMultiplier}
          showLabels={showLabels}
          onPointerMissed={handlePointerMissed}
          renderingMode={renderingMode}
          onStarClick={onStarClick}
          cameraCommand={cameraCommand}
          onCameraCommandComplete={onCameraCommandComplete}
        />
      </Canvas>
    </div>
  );
}

export default StarviewCanvas;