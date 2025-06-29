import React, { createContext, useContext, useCallback, ReactNode } from 'react';

/**
 * useStarviewCamera Hook - Camera Control Interface
 * 
 * Purpose: Provides a clean interface for UI components to control the 3D camera.
 * This hook allows pages like StarSelectionPage to directly trigger camera focus
 * without coupling to the canvas implementation details.
 * 
 * Features:
 * - focusOnStar(starCatalogId: string) - Focus camera on specific star
 * - resetCamera() - Return to default view
 * - centerView() - Center camera for optimal group viewing
 * - Context-based communication with StarviewCanvas
 * 
 * Confidence Rating: High - Clean abstraction for camera control
 */

interface CameraCommand {
  type: 'focusStar' | 'resetView' | 'centerView';
  starCatalogId?: string;
  position?: [number, number, number];
}

interface StarviewCameraContextType {
  sendCommand: (command: CameraCommand) => void;
}

const StarviewCameraContext = createContext<StarviewCameraContextType | undefined>(undefined);

interface StarviewCameraProviderProps {
  children: ReactNode;
  onCommand?: (command: CameraCommand) => void;
}

export function StarviewCameraProvider({ children, onCommand }: StarviewCameraProviderProps) {
  const sendCommand = useCallback((command: CameraCommand) => {
    console.log('StarviewCamera: Sending command:', command);
    if (onCommand) {
      onCommand(command);
    }
  }, [onCommand]);

  return (
    <StarviewCameraContext.Provider value={{ sendCommand }}>
      {children}
    </StarviewCameraContext.Provider>
  );
}

export function useStarviewCamera() {
  const context = useContext(StarviewCameraContext);
  if (context === undefined) {
    throw new Error('useStarviewCamera must be used within a StarviewCameraProvider');
  }

  const { sendCommand } = context;

  const focusOnStar = useCallback((starCatalogId: string) => {
    console.log(`useStarviewCamera: Focusing on star with catalog ID: ${starCatalogId}`);
    sendCommand({
      type: 'focusStar',
      starCatalogId
    });
  }, [sendCommand]);

  const resetCamera = useCallback(() => {
    console.log('useStarviewCamera: Resetting camera to default view');
    sendCommand({
      type: 'resetView'
    });
  }, [sendCommand]);

  const centerView = useCallback(() => {
    console.log('useStarviewCamera: Centering camera view');
    sendCommand({
      type: 'centerView'
    });
  }, [sendCommand]);

  return {
    focusOnStar,
    resetCamera,
    centerView
  };
}