import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';

/**
 * AnimationController Component - Enhanced with Continuous Orbiting
 * 
 * Purpose: Manages both discrete and continuous camera animations in a 3D scene.
 * Supports one-shot animations (focusStar, resetView, moveTo) and continuous orbiting.
 * 
 * Features:
 * - Discrete animations: focusStar, resetView, moveTo (triggered by useEffect)
 * - Continuous animations: orbit (handled by useFrame)
 * - Prevents overlapping animations with ref-based state management
 * - Smooth transitions between animation modes
 * - Graceful error handling with completion callbacks
 * - No visual output (returns null)
 * 
 * Confidence Rating: High - Complete refactoring with continuous orbit support
 */

interface AnimationCommand {
  type: 'focusStar' | 'resetView' | 'moveTo' | 'orbit';
  target?: {
    position: [number, number, number];
  };
  duration?: number;
  // Orbit-specific parameters
  center?: [number, number, number];
  radius?: number;
  speed?: number;
  elevation?: number;
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
    speed: 0.3, // radians per second
    elevation: 0.2,
    currentAngle: 0,
    lastTime: 0
  });

  // Handle discrete animations (focusStar, resetView, moveTo)
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
            // Move camera to position offset from target star and look at star's position
            if (!animationCommand.target?.position) {
              console.warn('AnimationController: focusStar command missing target position');
              break;
            }
            
            const [x, y, z] = animationCommand.target.position;
            const distance = 5; // Fixed offset distance as specified
            
            // Calculate camera position with offset
            const cameraPos: [number, number, number] = [
              x + distance, 
              y + distance, 
              z + distance
            ];
            
            console.log(`AnimationController: Focusing on star at [${x}, ${y}, ${z}], camera at [${cameraPos.join(', ')}]`);
            
            // Execute smooth camera movement and look-at simultaneously
            await controls.setLookAt(
              ...cameraPos,     // Camera position
              ...animationCommand.target.position, // Look-at target
              true              // Animate smoothly
            );
            break;
          }

          case 'resetView': {
            // Return camera to default position (2,2,2) looking at origin (0,0,0)
            console.log('AnimationController: Resetting camera to default view');
            
            await controls.setLookAt(
              2, 2, 2,    // Camera position
              0, 0, 0,    // Look-at target (origin)
              true        // Animate smoothly
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
    orbit.currentAngle = 0; // Reset angle
    orbit.lastTime = 0; // Reset timing
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
    const y = centerY + Math.sin(orbit.currentAngle * orbit.elevation) * 2; // Gentle vertical movement
    const z = centerZ + Math.sin(orbit.currentAngle) * orbit.radius;

    // Update camera position and look-at target
    // Use setLookAt without animation (false) for smooth continuous movement
    controls.setLookAt(
      x, y, z,                    // Camera position
      centerX, centerY, centerZ,  // Look-at target (orbit center)
      false                       // No animation - direct update for smooth orbit
    );
  });

  // Component returns null as it has no visual output
  return null;
};

export default AnimationController;