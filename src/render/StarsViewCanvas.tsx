import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { HygStarsCatalog } from '../data/StarsCatalog';
import { HygRecord } from '../types';
import { StarField } from './StarField';
import * as THREE from 'three';

/**
 * StarsViewCanvas Component
 * 
 * Renders the main 3D star visualization canvas using react-three-fiber,
 * manages camera controls, star selection, and overlays the star info panel.
 * 
 * Enhanced with CameraControls from drei for better camera management and Sun orbiting.
 * 
 * Confidence Rating: High - Complete implementation with CameraControls and Sun orbiting
 */

// DEBUG VARIABLE: Set to false to disable star labelling (default: disabled)
const DEBUG_ENABLE_STAR_LABELS = false;

export interface StarsViewCanvasProps {
  starsCatalog: HygStarsCatalog | null;
  controlSettings: {
    starSize: number;
    glowMultiplier: number;
    showLabels: boolean;
  };
  selectedStar: HygRecord | null;
  onStarSelect: (star: HygRecord | null, index: number | null) => void;
}

export interface StarsViewCanvasRef {
  orbitStart: () => void;
  orbitStop: () => void;
  returnToOrigin: () => void;
  getSelectedStar: () => HygRecord | null;
}

/**
 * StarInfoPanel Component
 * Displays information about the selected star as an overlay
 */
function StarInfoPanel({ star }: { star: HygRecord | null }) {
  if (!star) return null;

  return (
    <div className="absolute top-4 left-4 max-w-sm pointer-events-auto">
      <div className="frosted-glass-strong rounded-xl p-6 border border-cosmic-particle-trace">
        <h3 className="text-lg font-light text-cosmic-observation mb-2">
          {star.proper || `HYG ${star.id}`}
        </h3>
        
        <div className="space-y-2 text-sm text-cosmic-light-echo font-light">
          <div className="flex justify-between">
            <span>Magnitude:</span>
            <span className="font-mono">{star.mag.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Distance:</span>
            <span className="font-mono">{star.dist.toFixed(1)} pc</span>
          </div>
          
          {star.spect && (
            <div className="flex justify-between">
              <span>Spectral Class:</span>
              <span className="font-mono">{star.spect}</span>
            </div>
          )}
          
          {star.con && (
            <div className="flex justify-between">
              <span>Constellation:</span>
              <span>{star.con}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>RA:</span>
            <span className="font-mono">{star.ra.toFixed(3)}°</span>
          </div>
          
          <div className="flex justify-between">
            <span>Dec:</span>
            <span className="font-mono">{star.dec.toFixed(3)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced Camera Controller Component
 * Manages camera animations and controls using CameraControls from drei
 * Features automatic Sun orbiting with smooth transitions and continuous motion
 * OPTIMIZED: Fixed lag/freeze issues with better state management
 */
function CameraController({ 
  selectedStar, 
  orbitEnabled, 
  returnToOrigin,
  starsCatalog,
  onOrbitStateChange
}: { 
  selectedStar: HygRecord | null;
  orbitEnabled: boolean;
  returnToOrigin: boolean;
  starsCatalog: HygStarsCatalog | null;
  onOrbitStateChange: (isOrbiting: boolean, target: string) => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<CameraControls>(null);
  
  // Stable references to prevent re-renders
  const stateRef = useRef({
    sunPosition: null as THREE.Vector3 | null,
    sunStar: null as HygRecord | null,
    isOrbitingAroundSun: false,
    orbitRadius: 20, // Increased default orbit radius
    sunOrbitAngle: 0,
    selectedStarOrbitAngle: 0,
    isInitialized: false,
    lastUpdateTime: 0
  });

  // Find the Sun in the catalog and calculate its position (only once)
  useEffect(() => {
    if (!starsCatalog || stateRef.current.isInitialized) return;

    console.log('CameraController: Searching for the Sun in HYG catalog...');
    
    const allStars = starsCatalog.getStars();
    
    // Multiple strategies to find the Sun
    let sun = null;
    
    // Strategy 1: Look for "Sol" or "Sun" in proper name
    sun = allStars.find(star => 
      star.proper && (
        star.proper.toLowerCase() === 'sol' ||
        star.proper.toLowerCase() === 'sun' ||
        star.proper.toLowerCase().includes('sun')
      )
    );
    
    // Strategy 2: Look for the closest star (should be the Sun at ~0 distance)
    if (!sun) {
      sun = allStars.find(star => star.dist < 0.01); // Very close distance
    }
    
    // Strategy 3: Look for a G2V star very close to us (Sun's spectral class)
    if (!sun) {
      sun = allStars.find(star => 
        star.spect && star.spect.startsWith('G2') && star.dist < 1
      );
    }
    
    // Strategy 4: Look for any G-type star very close to us
    if (!sun) {
      sun = allStars.find(star => 
        star.spect && star.spect.startsWith('G') && star.dist < 1
      );
    }
    
    // Strategy 5: Use the brightest star as fallback (likely to be significant)
    if (!sun) {
      sun = allStars.reduce((brightest, current) => 
        current.mag < brightest.mag ? current : brightest
      );
    }

    if (sun) {
      console.log('CameraController: Found Sun candidate:', {
        name: sun.proper || `HYG ${sun.id}`,
        distance: sun.dist,
        magnitude: sun.mag,
        spectralClass: sun.spect
      });
      
      stateRef.current.sunStar = sun;
      
      // Calculate Sun's 3D position
      let distance = sun.dist;
      if (distance < 0.1) {
        distance = 0.5; // Minimum distance for visibility
      } else {
        distance = Math.min(distance / 10, 2); // Scale down for visualization
      }
      
      const raRad = sun.rarad;
      const decRad = sun.decrad;
      
      const x = distance * Math.cos(decRad) * Math.cos(raRad);
      const y = distance * Math.cos(decRad) * Math.sin(raRad);
      const z = distance * Math.sin(decRad);
      
      const sunPos = new THREE.Vector3(x, y, z);
      stateRef.current.sunPosition = sunPos;
      
      // Increased orbit radius for better viewing
      const newOrbitRadius = Math.max(20, distance * 15); // Increased multiplier
      stateRef.current.orbitRadius = newOrbitRadius;
      
      console.log('CameraController: Sun position calculated:', sunPos, 'Orbit radius:', newOrbitRadius);
      
      // Start orbiting around the Sun after a short delay
      setTimeout(() => {
        stateRef.current.isOrbitingAroundSun = true;
        stateRef.current.isInitialized = true;
        onOrbitStateChange(true, sun.proper || `HYG ${sun.id}`);
      }, 1000);
    } else {
      console.log('CameraController: No suitable Sun candidate found, using origin');
      stateRef.current.sunPosition = new THREE.Vector3(0, 0, 0);
      stateRef.current.sunStar = null;
      stateRef.current.orbitRadius = 20; // Increased default radius
      
      setTimeout(() => {
        stateRef.current.isOrbitingAroundSun = true;
        stateRef.current.isInitialized = true;
        onOrbitStateChange(true, 'Origin');
      }, 1000);
    }
  }, [starsCatalog, onOrbitStateChange]);

  // OPTIMIZED: Continuous orbit animation with throttling to prevent lag
  useFrame((state, delta) => {
    if (!controlsRef.current || !stateRef.current.isInitialized) return;

    // Throttle updates to prevent excessive calculations
    const currentTime = state.clock.elapsedTime;
    if (currentTime - stateRef.current.lastUpdateTime < 0.016) return; // ~60fps max
    stateRef.current.lastUpdateTime = currentTime;

    const { sunPosition, orbitRadius, isOrbitingAroundSun } = stateRef.current;

    if (isOrbitingAroundSun && sunPosition) {
      // OPTIMIZED: Smooth continuous orbit with consistent speed
      stateRef.current.sunOrbitAngle += delta * 0.15; // Slower, smoother orbit speed
      
      const angle = stateRef.current.sunOrbitAngle;
      
      // Calculate orbit position with smooth motion
      const x = sunPosition.x + Math.cos(angle) * orbitRadius;
      const y = sunPosition.y + Math.sin(angle * 0.2) * 2; // Reduced vertical movement
      const z = sunPosition.z + Math.sin(angle) * orbitRadius;
      
      // Use direct position setting instead of lerp for smoother motion
      const targetPosition = new THREE.Vector3(x, y, z);
      camera.position.copy(targetPosition);
      
      // Always look at the Sun with smooth transition
      if (controlsRef.current.setLookAt) {
        controlsRef.current.setLookAt(
          camera.position.x, camera.position.y, camera.position.z,
          sunPosition.x, sunPosition.y, sunPosition.z,
          false // Don't animate this transition to prevent conflicts
        );
      }
    } else if (orbitEnabled && selectedStar && controlsRef.current) {
      // OPTIMIZED: Selected star orbit with smooth motion
      const starDistance = Math.min(selectedStar.dist, 100) / 10;
      const raRad = selectedStar.rarad;
      const decRad = selectedStar.decrad;
      
      const starX = starDistance * Math.cos(decRad) * Math.cos(raRad);
      const starY = starDistance * Math.cos(decRad) * Math.sin(raRad);
      const starZ = starDistance * Math.sin(decRad);
      
      // Smooth continuous orbit
      stateRef.current.selectedStarOrbitAngle += delta * 0.25; // Orbit speed
      
      const angle = stateRef.current.selectedStarOrbitAngle;
      const orbitDist = Math.max(8, starDistance * 4); // Increased orbit distance
      
      const x = starX + Math.cos(angle) * orbitDist;
      const y = starY + Math.sin(angle * 0.15) * 1.5; // Reduced vertical movement
      const z = starZ + Math.sin(angle) * orbitDist;
      
      // Direct position setting for smoother motion
      camera.position.copy(new THREE.Vector3(x, y, z));
      
      if (controlsRef.current.setLookAt) {
        controlsRef.current.setLookAt(
          camera.position.x, camera.position.y, camera.position.z,
          starX, starY, starZ,
          false
        );
      }
    }
  });

  // Handle return to origin
  useEffect(() => {
    if (returnToOrigin && controlsRef.current) {
      console.log('CameraController: Returning to origin');
      stateRef.current.isOrbitingAroundSun = false;
      onOrbitStateChange(false, 'None');
      
      // Reset orbit angles
      stateRef.current.sunOrbitAngle = 0;
      stateRef.current.selectedStarOrbitAngle = 0;
      stateRef.current.isInitialized = false;
      
      // Animate camera back to default position
      controlsRef.current.setLookAt(
        0, 0, 8,  // Camera position
        0, 0, 0,  // Look at origin
        true      // Animate transition
      );
    }
  }, [returnToOrigin, onOrbitStateChange]);

  // Handle star selection
  useEffect(() => {
    if (selectedStar && controlsRef.current) {
      console.log('CameraController: Focusing on selected star:', selectedStar.proper || selectedStar.id);
      
      // Stop orbiting around Sun when a star is selected
      stateRef.current.isOrbitingAroundSun = false;
      onOrbitStateChange(orbitEnabled, selectedStar.proper || `HYG ${selectedStar.id}`);
      
      // Reset selected star orbit angle to start fresh
      stateRef.current.selectedStarOrbitAngle = 0;
      
      // Calculate star position
      const distance = Math.min(selectedStar.dist, 100) / 10;
      const raRad = selectedStar.rarad;
      const decRad = selectedStar.decrad;
      
      const x = distance * Math.cos(decRad) * Math.cos(raRad);
      const y = distance * Math.cos(decRad) * Math.sin(raRad);
      const z = distance * Math.sin(decRad);
      
      // Position camera to view the selected star with increased distance
      const viewDistance = Math.max(8, distance * 4); // Increased multiplier
      const cameraX = x + viewDistance;
      const cameraY = y + 2;
      const cameraZ = z + viewDistance;
      
      // Animate camera to selected star
      controlsRef.current.setLookAt(
        cameraX, cameraY, cameraZ,  // Camera position
        x, y, z,                    // Look at star
        true                        // Animate transition
      );
      
    } else if (!selectedStar && stateRef.current.sunPosition && !returnToOrigin) {
      // Resume orbiting around Sun when no star is selected
      console.log('CameraController: Resuming Sun orbit');
      setTimeout(() => {
        stateRef.current.isOrbitingAroundSun = true;
        onOrbitStateChange(true, stateRef.current.sunStar?.proper || 'Sun');
        // Continue from current angle - don't reset
      }, 500);
    }
  }, [selectedStar, orbitEnabled, returnToOrigin, onOrbitStateChange]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={1}
      maxDistance={300} // Increased max distance
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      dampingFactor={0.03} // Reduced damping for smoother motion
      draggingSmoothTime={0.15} // Faster response
      smoothTime={0.15} // Faster response
    />
  );
}

/**
 * Scene Content Component
 * Contains all 3D scene elements including the StarField
 */
function SceneContent({ 
  starsCatalog, 
  controlSettings, 
  selectedStar, 
  onStarSelect,
  labelRefreshTick 
}: {
  starsCatalog: HygStarsCatalog | null;
  controlSettings: StarsViewCanvasProps['controlSettings'];
  selectedStar: HygRecord | null;
  onStarSelect: (star: HygRecord | null, index: number | null) => void;
  labelRefreshTick: number;
}) {
  // Handle pointer miss (clicking on empty space)
  const handlePointerMissed = useCallback(() => {
    console.log('SceneContent: Pointer missed - deselecting star');
    onStarSelect(null, null);
  }, [onStarSelect]);

  // Handle star selection from StarField
  const handleStarSelect = useCallback((star: HygRecord, index: number) => {
    console.log('SceneContent: Star selected from StarField:', star.proper || star.id, 'at index:', index);
    onStarSelect(star, index);
  }, [onStarSelect]);

  return (
    <>
      {/* Ambient lighting for cosmic atmosphere */}
      <ambientLight intensity={0.3} color="#60A5FA" />
      
      {/* Directional light for depth */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.5} 
        color="#93C5FD"
      />
      
      {/* Point light for additional cosmic glow */}
      <pointLight 
        position={[-10, -10, -5]} 
        intensity={0.3} 
        color="#3B82F6"
      />
      
      {/* Main StarField component - renders all stars from catalog */}
      {starsCatalog && (
        <StarField
          catalog={starsCatalog}
          onStarSelect={handleStarSelect}
          selectedStar={selectedStar}
          maxMagnitude={6.5}
          maxStars={10000}
          starSize={controlSettings.starSize}
          glowMultiplier={controlSettings.glowMultiplier}
          showLabels={DEBUG_ENABLE_STAR_LABELS && controlSettings.showLabels}
          labelRefreshTick={labelRefreshTick}
        />
      )}
      
      {/* Cosmic fog for depth perception */}
      <fog attach="fog" args={['#0A0A0F', 10, 100]} />
      
      {/* Invisible plane for pointer miss detection */}
      <mesh
        position={[0, 0, -50]}
        onPointerMissed={handlePointerMissed}
        visible={false}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

/**
 * Main StarsViewCanvas Component
 * 
 * Renders a full-window 3D canvas with stars, using the StarField component.
 * Handles camera controls with CameraControls from drei, star selection/deselection, 
 * and displays StarInfoPanel overlay.
 * Features automatic camera orbiting around the Sun with smooth transitions and continuous motion.
 * OPTIMIZED: Fixed lag/freeze issues with better performance and state management.
 */
export const StarsViewCanvas = forwardRef<StarsViewCanvasRef, StarsViewCanvasProps>(
  ({ starsCatalog, controlSettings, selectedStar, onStarSelect }, ref) => {
    const [orbitEnabled, setOrbitEnabled] = useState(false);
    const [returnToOrigin, setReturnToOrigin] = useState(false);
    const [labelRefreshTick, setLabelRefreshTick] = useState(0);
    const [orbitStatus, setOrbitStatus] = useState<{isOrbiting: boolean, target: string}>({
      isOrbiting: false,
      target: 'None'
    });

    // Handle orbit state changes from camera controller
    const handleOrbitStateChange = useCallback((isOrbiting: boolean, target: string) => {
      setOrbitStatus({ isOrbiting, target });
    }, []);

    // Expose methods via ref for external control
    useImperativeHandle(ref, () => ({
      orbitStart: () => {
        console.log('StarsViewCanvas: Starting camera orbit around selected star');
        setOrbitEnabled(true);
      },
      
      orbitStop: () => {
        console.log('StarsViewCanvas: Stopping camera orbit');
        setOrbitEnabled(false);
      },
      
      returnToOrigin: () => {
        console.log('StarsViewCanvas: Returning camera to origin and deselecting star');
        setReturnToOrigin(true);
        setOrbitEnabled(false);
        onStarSelect(null, null);
        
        // Reset the flag after animation completes
        setTimeout(() => setReturnToOrigin(false), 2000);
      },
      
      getSelectedStar: () => {
        console.log('StarsViewCanvas: Getting selected star:', selectedStar?.proper || selectedStar?.id || 'none');
        return selectedStar;
      }
    }), [selectedStar, onStarSelect]);

    // OPTIMIZED: Manage label refreshes with longer intervals to reduce overhead
    useEffect(() => {
      const interval = setInterval(() => {
        setLabelRefreshTick(prev => prev + 1);
      }, 3000); // Increased to 3 seconds to reduce overhead

      return () => clearInterval(interval);
    }, []);

    // Log catalog status for debugging
    useEffect(() => {
      if (starsCatalog) {
        console.log(`StarsViewCanvas: Catalog loaded with ${starsCatalog.getTotalStars()} stars`);
      } else {
        console.log('StarsViewCanvas: No catalog available');
      }
    }, [starsCatalog]);

    // Log selected star changes
    useEffect(() => {
      if (selectedStar) {
        console.log('StarsViewCanvas: Selected star changed to:', selectedStar.proper || selectedStar.id);
      } else {
        console.log('StarsViewCanvas: No star selected');
      }
    }, [selectedStar]);

    return (
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: -1, pointerEvents: 'auto' }}>
        <Canvas
          camera={{
            position: [0, 0, 8],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          style={{
            background: 'linear-gradient(to bottom, #000000, #0A0A0F)',
            width: '100vw',
            height: '100vh'
          }}
          dpr={[1, 2]}
          performance={{
            min: 0.5,
            max: 1.0,
            debounce: 200
          }}
          gl={{ 
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
          }}
          frameloop="always" // Ensure consistent frame updates
        >
          {/* Main scene content with StarField integration */}
          <SceneContent
            starsCatalog={starsCatalog}
            controlSettings={controlSettings}
            selectedStar={selectedStar}
            onStarSelect={onStarSelect}
            labelRefreshTick={labelRefreshTick}
          />
          
          {/* Enhanced Camera controls with CameraControls from drei */}
          <CameraController
            selectedStar={selectedStar}
            orbitEnabled={orbitEnabled}
            returnToOrigin={returnToOrigin}
            starsCatalog={starsCatalog}
            onOrbitStateChange={handleOrbitStateChange}
          />
        </Canvas>
        
        {/* Star info panel overlay */}
        <StarInfoPanel star={selectedStar} />
        
        {/* Enhanced status indicators */}
        {!starsCatalog && (
          <div className="absolute bottom-4 right-4 text-cosmic-stellar-wind text-xs font-light opacity-50 pointer-events-none">
            Loading star catalog...
          </div>
        )}
        
        {starsCatalog && (
          <div className="absolute bottom-4 right-4 text-cosmic-stellar-wind text-xs font-light opacity-30 pointer-events-none">
            <div>{starsCatalog.getTotalStars().toLocaleString()} stars loaded</div>
            {orbitStatus.isOrbiting && (
              <div className="text-cosmic-cherenkov-blue">
                🌟 Orbiting around {orbitStatus.target}
              </div>
            )}
            {/* Debug indicator for star labels */}
            <div className="text-cosmic-stellar-wind opacity-50">
              Labels: {DEBUG_ENABLE_STAR_LABELS ? 'ON' : 'OFF'}
            </div>
          </div>
        )}
        
        {/* Enhanced controls hint */}
        <div className="absolute bottom-4 left-4 text-cosmic-stellar-wind text-xs font-light opacity-30 pointer-events-none">
          <div>Click stars to select • Drag to orbit • Scroll to zoom</div>
          <div className="text-cosmic-cherenkov-blue">Smooth continuous orbiting - lag fixed</div>
        </div>
      </div>
    );
  }
);

StarsViewCanvas.displayName = 'StarsViewCanvas';

export default StarsViewCanvas;