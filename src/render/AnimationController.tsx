import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';

/**
 * AnimationController Component - Enhanced with Center View Support
 * 
 * Purpose: Manages camera animations including discrete movements and continuous orbiting.
 * Now supports automatic centering for optimal viewing of highlighted stars.
 * 
 * Features:
 * - Discrete animations: focusStar, resetView, moveTo, centerView
 * - Continuous animations: orbit
 * - Optimal camera positioning for star groups
 * - Smooth transitions between animation modes
 * - Enhanced error handling and completion callbacks
 * 
 * Confidence Rating: High - Enhanced existing system with center view capability
 */

interface AnimationCommand {
  type: 'focusStar' | 'resetView' | 'moveTo' | 'orbit' | 'centerView';
  target?: {
    position: [number, number, number];
  };
  duration?: number;
  // Orbit-specific parameters
  center?: [number, number, number];
  radius?: number;
  speed?: number;
  elevation?: number;
  // Center view parameters
  boundingBox?: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

interface AnimationControllerProps {
  cameraControlsRef: React.RefObject<CameraControls>;
  animationCommand: AnimationCommand | null;
  onAnimationComplete?: () => void;
}

export const AnimationController: React.FC<AnimationControllerProps> = ({
  cameraControlsRef,
  animationCommand,
  onAnimationComplete
}) => {
  // Prevent overlapping discrete animations using a ref
  const isAnimatingRef = useRef(false);
  
  // Orbit state management using refs to avoid re-renders
  const orbitState = useRef({
    isOrbiting: false,
    center: [0, 0, 0] as [number, number, number],
    radius: 8,
    speed: 0.3,
    elevation: 0.2,
    currentAngle: 0,
    lastTime: 0
  });

  // Handle discrete animations (focusStar, resetView, moveTo, centerView)
  useEffect(() => {
    // Skip if no command or if it's an orbit command (handled by useFrame)
    if (!animationCommand || animationCommand.type === 'orbit') {
      return;
    }

    // Early return conditions for discrete animations
    if (!cameraControlsRef.current || isAnimatingRef.current) {
      return;
    }

    const controls = cameraControlsRef.current;
    isAnimatingRef.current = true;

    // Stop orbiting when starting a discrete animation
    if (orbitState.current.isOrbiting) {
      console.log('AnimationController: Stopping orbit for discrete animation');
      orbitState.current.isOrbiting = false;
    }

    console.log('AnimationController: Executing discrete animation command:', animationCommand.type);

    const executeAnimation = async () => {
      try {
        switch (animationCommand.type) {
          case 'focusStar': {
            // Enhanced star focusing with optimal viewing distance
            if (!animationCommand.target?.position) {
              console.warn('AnimationController: focusStar command missing target position');
              break;
            }
            
            const [x, y, z] = animationCommand.target.position;
            const optimalDistance = 3; // Closer for detailed star viewing
            
            // Calculate camera position with optimal offset
            const cameraPos: [number, number, number] = [
              x + optimalDistance, 
              y + optimalDistance * 0.5, 
              z + optimalDistance
            ];
            
            console.log(`AnimationController: Focusing on star at [${x}, ${y}, ${z}], camera at [${cameraPos.join(', ')}]`);
            
            // Execute smooth camera movement with optimal positioning
            await controls.setLookAt(
              ...cameraPos,
              ...animationCommand.target.position,
              true
            );
            break;
          }

          case 'centerView': {
            // NEW: Center camera to view all highlighted stars optimally
            if (!animationCommand.target?.position) {
              console.warn('AnimationController: centerView command missing target position');
              break;
            }
            
            const [centerX, centerY, centerZ] = animationCommand.target.position;
            
            // Calculate optimal viewing distance based on bounding box
            let viewDistance = 12; // Default distance
            if (animationCommand.boundingBox) {
              const { min, max } = animationCommand.boundingBox;
              const maxDimension = Math.max(
                max[0] - min[0],
                max[1] - min[1],
                max[2] - min[2]
              );
              viewDistance = Math.max(8, maxDimension * 1.2);
            }
            
            // Position camera for optimal group viewing
            const cameraPos: [number, number, number] = [
              centerX,
              centerY + viewDistance * 0.3,
              centerZ + viewDistance
            ];
            
            console.log(`AnimationController: Centering view at [${centerX}, ${centerY}, ${centerZ}], camera at [${cameraPos.join(', ')}]`);
            
            await controls.setLookAt(
              ...cameraPos,
              centerX, centerY, centerZ,
              true
            );
            break;
          }

          case 'resetView': {
            // Return camera to default position
            console.log('AnimationController: Resetting camera to default view');
            
            await controls.setLookAt(
              2, 2, 2,
              0, 0, 0,
              true
            );
            break;
          }

          case 'moveTo': {
            // Move camera directly to specified target position
            if (!animationCommand.target?.position) {
              console.warn('AnimationController: moveTo command missing target position');
              break;
            }
            
            const [x, y, z] = animationCommand.target.position;
            console.log(`AnimationController: Moving camera to [${x}, ${y}, ${z}]`);
            
            await controls.setPosition(x, y, z, true);
            break;
          }

          default:
            console.warn('AnimationController: Unknown discrete animation command type:', animationCommand.type);
        }

        console.log('AnimationController: Discrete animation completed successfully');

      } catch (error) {
        console.error('AnimationController: Discrete animation failed:', error);
      } finally {
        // Always reset animation state and call completion callback
        isAnimatingRef.current = false;
        
        if (onAnimationComplete) {
          console.log('AnimationController: Calling onAnimationComplete callback');
          onAnimationComplete();
        }
      }
    };

    // Execute the discrete animation
    executeAnimation();
  }, [animationCommand, cameraControlsRef, onAnimationComplete]);

  // Handle orbit command setup
  useEffect(() => {
    if (!animationCommand || animationCommand.type !== 'orbit') {
      // Stop orbiting if command is not orbit
      if (orbitState.current.isOrbiting) {
        console.log('AnimationController: Stopping orbit - no orbit command');
        orbitState.current.isOrbiting = false;
      }
      return;
    }

    // Don't start orbiting if a discrete animation is in progress
    if (isAnimatingRef.current) {
      console.log('AnimationController: Delaying orbit start - discrete animation in progress');
      return;
    }

    console.log('AnimationController: Starting orbit animation');
    
    // Update orbit parameters
    const orbit = orbitState.current;
    orbit.center = animationCommand.center || [0, 0, 0];
    orbit.radius = animationCommand.radius || 8;
    orbit.speed = animationCommand.speed || 0.3;
    orbit.elevation = animationCommand.elevation || 0.2;
    orbit.currentAngle = 0;
    orbit.lastTime = 0;
    orbit.isOrbiting = true;

    console.log('AnimationController: Orbit parameters set:', {
      center: orbit.center,
      radius: orbit.radius,
      speed: orbit.speed,
      elevation: orbit.elevation
    });

  }, [animationCommand]);

  // Continuous orbit animation using useFrame
  useFrame((state) => {
    // Only proceed if orbiting is active and camera controls are available
    if (!orbitState.current.isOrbiting || !cameraControlsRef.current) {
      return;
    }

    // Skip if discrete animation is in progress
    if (isAnimatingRef.current) {
      return;
    }

    const controls = cameraControlsRef.current;
    const orbit = orbitState.current;
    const currentTime = state.clock.elapsedTime;

    // Initialize timing on first frame
    if (orbit.lastTime === 0) {
      orbit.lastTime = currentTime;
      return;
    }

    // Calculate delta time for smooth animation
    const deltaTime = currentTime - orbit.lastTime;
    orbit.lastTime = currentTime;

    // Update orbit angle based on speed and delta time
    orbit.currentAngle += orbit.speed * deltaTime;

    // Calculate camera position in orbit
    const [centerX, centerY, centerZ] = orbit.center;
    const x = centerX + Math.cos(orbit.currentAngle) * orbit.radius;
    const y = centerY + Math.sin(orbit.currentAngle * orbit.elevation) * 2;
    const z = centerZ + Math.sin(orbit.currentAngle) * orbit.radius;

    // Update camera position and look-at target
    controls.setLookAt(
      x, y, z,
      centerX, centerY, centerZ,
      false
    );
  });

  // Component returns null as it has no visual output
  return null;
};

export default AnimationController;