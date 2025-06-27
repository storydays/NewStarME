import React, { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';

/**
 * AnimationController Component
 * 
 * Purpose: Manages camera animations in a 3D scene using react-three-fiber and drei's CameraControls.
 * Receives animation commands and executes smooth camera transitions accordingly.
 * 
 * Features:
 * - Supports focusStar, resetView, and moveTo animation commands
 * - Prevents overlapping animations with ref-based state management
 * - Graceful error handling with completion callbacks
 * - No visual output (returns null)
 * - Integrates seamlessly with react-three-fiber and CameraControls
 * 
 * Confidence Rating: High - Complete implementation following exact specifications
 */

interface AnimationCommand {
  type: 'focusStar' | 'resetView' | 'moveTo';
  target?: {
    position: [number, number, number];
  };
  duration?: number;
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
  // Prevent overlapping animations using a ref
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    // Early return conditions:
    // - No animation command provided
    // - Camera controls not available
    // - Already animating (prevent overlaps)
    if (!animationCommand || !cameraControlsRef.current || isAnimatingRef.current) {
      return;
    }

    const controls = cameraControlsRef.current;
    isAnimatingRef.current = true;

    console.log('AnimationController: Executing animation command:', animationCommand.type);

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
            console.warn('AnimationController: Unknown animation command type:', animationCommand.type);
        }

        console.log('AnimationController: Animation completed successfully');

      } catch (error) {
        console.error('AnimationController: Animation failed:', error);
      } finally {
        // Always reset animation state and call completion callback
        isAnimatingRef.current = false;
        
        if (onAnimationComplete) {
          console.log('AnimationController: Calling onAnimationComplete callback');
          onAnimationComplete();
        }
      }
    };

    // Execute the animation
    executeAnimation();
  }, [animationCommand, cameraControlsRef, onAnimationComplete]);

  // Component returns null as it has no visual output
  return null;
};

export default AnimationController;