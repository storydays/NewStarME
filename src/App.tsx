import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarviewCanvas } from './render/StarviewCanvas';
import { Home } from './pages/Home';
import { StarSelection } from './pages/StarSelection';
import { Dedication } from './pages/Dedication';
import { SharedStar } from './pages/SharedStar';
import { SuggestedStarsProvider } from './context/SuggestedStarsContext';
import { useStarsCatalog } from './hooks/useStarsCatalog';
import { StarService } from './services/starService';

/**
 * AppContent Component - Enhanced with Refined Star Architecture
 * 
 * Purpose: Main application component that integrates the refined star data architecture.
 * Uses the central StarsCatalog as the single source of truth for all star operations.
 * 
 * Features:
 * - Central StarsCatalog integration
 * - SuggestedStars context for AI-generated suggestions
 * - Clean separation between catalog data and suggested data
 * - Enhanced 3D visualization with proper data flow
 * 
 * Confidence Rating: High - Clean integration of refined architecture
 */
function AppContent() {
  const { catalog, loading: catalogLoading, error: catalogError } = useStarsCatalog();
  const [selectedStar, setSelectedStar] = useState<any>(null);

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

  const handleStarSelect = (star: any, index: number | null) => {
    console.log('App: Star selected:', star?.proper || star?.id, 'at index:', index);
    setSelectedStar(star);
  };

  const handleStarClick = (star: any) => {
    console.log('App: Star clicked for modal display:', star?.scientific_name);
    // This will be handled by individual page components
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

  return (
    <Router>
      <div className="App cosmic-viewport">
        {/* Global 3D background canvas with StarsCatalog integration */}
        <StarviewCanvas
          starsCatalog={catalog}
          catalogLoading={catalogLoading}
          selectedStar={selectedStar}
          onStarSelect={handleStarSelect}
          starSize={controlSettings.starSize}
          glowMultiplier={controlSettings.glowMultiplier}
          showLabels={controlSettings.showLabels}
          renderingMode={controlSettings.renderingMode}
          onStarClick={handleStarClick}
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stars/:emotionId" element={<StarSelection />} />
            <Route path="/dedicate/:starId" element={<Dedication />} />
            <Route path="/star/:dedicationId" element={<SharedStar />} />
          </Routes>
        </motion.div>
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