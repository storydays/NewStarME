import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarviewCanvas } from './render/StarviewCanvas';
import { Home } from './pages/Home';
import { StarSelection } from './pages/StarSelection';
import { Dedication } from './pages/Dedication';
import { SharedStar } from './pages/SharedStar';
import { HygStarsCatalog } from './data/StarsCatalog';
import { HygRecord, Star } from './types';
import { SuggestedStarsProvider, useSuggestedStars } from './context/SuggestedStarsContext';

/**
 * AppContent Component - Enhanced with Centralized Star Selection
 * 
 * Separated from App to allow access to SuggestedStarsContext
 * Enhanced with centralized star selection state management to fix
 * synchronization issues between 3D view and modal display.
 */
function AppContent() {
  const [hygCatalog, setHygCatalog] = useState<HygStarsCatalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const { suggestedStars, focusedStarIndex, selectedHygRecord, setSelectedHygRecord, setSelectedModalStar } = useSuggestedStars();

  // Control settings for the star visualization
  const [controlSettings] = useState({
    starSize: 0.25,
    glowMultiplier: 2,
    showLabels: false
  });

  useEffect(() => {
    async function loadHygCatalog() {
      try {
        console.log('Loading HYG catalog in App.tsx...');
        setCatalogLoading(true);
        
        // Load the HYG catalog from the public directory
        const catalog = await HygStarsCatalog.fromUrl('/hygdata_v41.csv.gz', false);
        
        console.log(`HYG catalog loaded successfully: ${catalog.getTotalStars()} stars`);
        setHygCatalog(catalog);
      } catch (error) {
        console.warn('Failed to load HYG catalog in App.tsx:', error);
        setHygCatalog(null);
      } finally {
        setCatalogLoading(false);
      }
    }

    loadHygCatalog();
  }, []);

  // Handle star selection from 3D canvas (for purple color in 3D view)
  const handleStarSelect = (star: HygRecord | null, index: number | null) => {
    console.log('App: Star selected from canvas:', star?.proper || star?.id || 'null');
    setSelectedHygRecord(star);
  };

  // NEW: Handle star click for modal display (used in StarSelection page)
  const handleCanvasStarClick = (star: Star) => {
    console.log('App: Star clicked for modal display:', star.scientific_name);
    setSelectedModalStar(star);
  };

  return (
    <Router>
      <div className="App cosmic-viewport" onClick={() => console.log('Click event received on App div!')}>
        {/* Global 3D background canvas with HYG catalog */}
        <StarviewCanvas
          hygCatalog={hygCatalog}
          catalogLoading={catalogLoading}
          selectedStar={selectedHygRecord}
          onStarSelect={handleStarSelect}
          starSize={controlSettings.starSize}
          glowMultiplier={controlSettings.glowMultiplier}
          showLabels={controlSettings.showLabels}
          highlightedStars={suggestedStars}
          focusedStarIndex={focusedStarIndex}
          onStarClick={handleCanvasStarClick} // NEW: Pass star click handler for modal support
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