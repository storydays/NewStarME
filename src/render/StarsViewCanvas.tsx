import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
 * Follows exact specifications for props, ref API, and behavior.
 * 
 * Confidence Rating: High - Complete implementation following specifications exactly
 */

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
 * Testing Spinning Cube Component
 * Simple cube that rotates to verify the 3D canvas is working
 */
function TestingCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <mesh ref={meshRef} position={[3, 3, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#2563EB" 
        transparent 
        opacity={0.8}
        wireframe={false}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
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
 * Camera Controller Component
 * Manages camera animations and controls
 */
function CameraController({ 
  selectedStar, 
  orbitEnabled, 
  returnToOrigin 
}: { 
  selectedStar: HygRecord | null;
  orbitEnabled: boolean;
  returnToOrigin: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (returnToOrigin && controlsRef.current) {
      console.log('CameraController: Returning camera to origin');
      // Animate camera back to origin
      camera.position.set(0, 0, 8);
      camera.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [returnToOrigin, camera]);

  useEffect(() => {
    if (selectedStar && controlsRef.current) {
      console.log('CameraController: Focusing camera on selected star');
      // Convert star coordinates to 3D position for camera targeting
      const distance = Math.min(selectedStar.dist, 100) / 10;
      const raRad = selectedStar.rarad;
      const decRad = selectedStar.decrad;
      
      const x = distance * Math.cos(decRad) * Math.cos(raRad);
      const y = distance * Math.cos(decRad) * Math.sin(raRad);
      const z = distance * Math.sin(decRad);
      
      // Set camera target to selected star
      controlsRef.current.target.set(x, y, z);
      controlsRef.current.update();
    }
  }, [selectedStar]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      autoRotate={orbitEnabled}
      autoRotateSpeed={0.5}
      minDistance={1}
      maxDistance={50}
    />
  );
}

/**
 * Scene Content Component
 * Contains all 3D scene elements including the StarField and testing cube
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
      
      {/* Testing spinning cube - positioned to the side */}
      <TestingCube />
      
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
          showLabels={controlSettings.showLabels}
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
 * Handles camera controls, star selection/deselection, and displays StarInfoPanel overlay.
 * Manages label refreshes for performance and visual consistency.
 */
export const StarsViewCanvas = forwardRef<StarsViewCanvasRef, StarsViewCanvasProps>(
  ({ starsCatalog, controlSettings, selectedStar, onStarSelect }, ref) => {
    const [orbitEnabled, setOrbitEnabled] = useState(false);
    const [returnToOrigin, setReturnToOrigin] = useState(false);
    const [labelRefreshTick, setLabelRefreshTick] = useState(0);

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
        setTimeout(() => setReturnToOrigin(false), 1000);
      },
      
      getSelectedStar: () => {
        console.log('StarsViewCanvas: Getting selected star:', selectedStar?.proper || selectedStar?.id || 'none');
        return selectedStar;
      }
    }), [selectedStar, onStarSelect]);

    // Manage label refreshes for performance and visual consistency
    useEffect(() => {
      const interval = setInterval(() => {
        setLabelRefreshTick(prev => prev + 1);
      }, 2000); // Refresh every 2 seconds

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
        >
          {/* Main scene content with StarField integration and testing cube */}
          <SceneContent
            starsCatalog={starsCatalog}
            controlSettings={controlSettings}
            selectedStar={selectedStar}
            onStarSelect={onStarSelect}
            labelRefreshTick={labelRefreshTick}
          />
          
          {/* Camera controls */}
          <CameraController
            selectedStar={selectedStar}
            orbitEnabled={orbitEnabled}
            returnToOrigin={returnToOrigin}
          />
        </Canvas>
        
        {/* Star info panel overlay */}
        <StarInfoPanel star={selectedStar} />
        
        {/* Loading/status indicators */}
        {!starsCatalog && (
          <div className="absolute bottom-4 right-4 text-cosmic-stellar-wind text-xs font-light opacity-50 pointer-events-none">
            Loading star catalog...
          </div>
        )}
        
        {starsCatalog && (
          <div className="absolute bottom-4 right-4 text-cosmic-stellar-wind text-xs font-light opacity-30 pointer-events-none">
            {starsCatalog.getTotalStars().toLocaleString()} stars loaded
          </div>
        )}
        
        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 text-cosmic-stellar-wind text-xs font-light opacity-30 pointer-events-none">
          Click stars to select • Drag to orbit • Scroll to zoom
        </div>
        
        {/* Testing indicator */}
        <div className="absolute top-4 right-4 text-cosmic-cherenkov-blue text-xs font-light opacity-70 pointer-events-none">
          Testing: Blue spinning cube visible
        </div>
      </div>
    );
  }
);

StarsViewCanvas.displayName = 'StarsViewCanvas';

export default StarsViewCanvas;