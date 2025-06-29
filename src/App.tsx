import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarviewCanvas } from './render/StarviewCanvas';
import { StarviewCameraProvider } from './hooks/useStarviewCamera';
import { Home } from './pages/Home';
import { StarSelection } from './pages/StarSelection';
import { Dedication } from './pages/Dedication';
import { SharedStar } from './pages/SharedStar';
import { SuggestedStarsProvider, useSuggestedStars } from './context/SuggestedStarsContext';
import { useStarsCatalog } from './hooks/useStarsCatalog';
import { StarService } from './services/starService';
import { HygStarData } from './types';

/**
 * AppContent Component - Central State Management
 * 
 * Purpose: Holds global selectedStar state and orchestrates data flow between components.
 * No longer handles camera control or side effects - focuses only on shared state.
 * 
 * Features:
 * - Central selectedStar state (HygStarData | null)
 * - Derives highlightedStarIds from SuggestedStarsContext
 * - Passes data to StarviewCanvas without triggering camera effects
 * - Clean separation of concerns
 * 
 * Confidence Rating: High - Simplified state management
 */
function AppContent() {
  const { catalog, loading: catalogLoading, error: catalogError } = useStarsCatalog();
  const { suggestedStars } = useSuggestedStars();
  const [selectedStar, setSelectedStar] = useState<HygStarData | null>(null);
  const [cameraCommand, setCameraCommand] = useState<any>(null);

  console.log("suggested stars: ", suggestedStars)

  // Control settings for the star visualization
  const [controlSettings] = useState({
    starSize: 0.25,
    glowMultiplier: 2,
    showLabels: false,
    renderingMode: 'classic' as 'classic' | 'instanced'
  });

  // Initialize StarService with catalog when available
  useEffect(() => {
    if (catalog) {
      console.log('App: Setting StarsCatalog in StarService');
      StarService.setStarsCatalog(catalog);
    }
  }, [catalog]);

  // Initialize StarService
  useEffect(() => {
    StarService.initializeStars().catch(console.error);
  }, []);

  // Derive highlighted star IDs from suggested stars
  const highlightedStarIds = suggestedStars.map(star => star.starCatalogId);

  const handleStarSelect = (star: HygStarData | null, index: number | null) => {
    console.log('App: Star selected:', star?.hyg.proper || star?.hyg.id, 'at index:', index);
    setSelectedStar(star);
  };

  const handleStarClick = (star: HygStarData) => {
    console.log('App: Star clicked for modal display:', star.hyg.proper || star.hyg.id);
    // This will be handled by individual page components
  };

  const handleCameraCommand = (command: any) => {
    console.log('App: Received camera command:', command);
    setCameraCommand(command);
  };

  if (catalogLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter via-cosmic-deep-space to-cosmic-quantum-field relative">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-2 border-cosmic-cherenkov-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cosmic-observation text-lg font-light">Loading star catalog...</p>
            <p className="text-cosmic-stellar-wind text-sm font-light mt-2">
              Initializing {catalog?.getTotalStars() || 0} celestial bodies
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter via-cosmic-deep-space to-cosmic-quantum-field relative">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-400 text-xl mb-4 font-light">Failed to load star catalog</p>
            <p className="text-cosmic-stellar-wind text-sm font-light">{catalogError}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  console.log(selectedStar)

  return (
    <Router>
      <div className="App cosmic-viewport">
        <StarviewCameraProvider onCommand={handleCameraCommand}>
          {/* Global 3D background canvas with props-based data flow */}
          <StarviewCanvas
            starsCatalog={catalog}
            catalogLoading={catalogLoading}
            selectedStar={selectedStar}
            highlightedStarIds={highlightedStarIds}
            onStarSelect={handleStarSelect}
            onStarClick={handleStarClick}
            starSize={controlSettings.starSize}
            glowMultiplier={controlSettings.glowMultiplier}
            showLabels={controlSettings.showLabels}
            renderingMode={controlSettings.renderingMode}
            cameraCommand={cameraCommand}
            onCameraCommandComplete={() => setCameraCommand(null)}
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/stars/:emotionId" 
                element={
                  <StarSelection 
                    selectedStar={selectedStar}
                    setSelectedStar={setSelectedStar}
                    onStarClick={handleStarClick}
                  />
                } 
              />
              <Route path="/dedicate/:starId" element={<Dedication />} />
              <Route path="/star/:dedicationId" element={<SharedStar />} />
            </Routes>
          </motion.div>
        </StarviewCameraProvider>
      </div>
    </Router>
  );
}

/**
 * Main App Component - Provides context wrapper
 */
function App() {
  return (
    <SuggestedStarsProvider>
      <AppContent />
    </SuggestedStarsProvider>
  );
}

export default App;