import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { BurgerMenu } from './components/BurgerMenu';

/**
 * AppContent Component - Enhanced with Home Navigation State Clearing
 * 
 * Purpose: Central orchestrator that manages star suggestion fetching based on URL changes.
 * UPDATED: Now clears selectedStar state when navigating to Home page.
 * 
 * Features:
 * - URL-based emotion detection and star suggestion triggering
 * - Centralized data flow management
 * - Loading state propagation to child components
 * - Automatic cleanup when navigating away from emotion routes
 * - FIXED: Clear selectedStar state when navigating to Home page
 * - Enhanced logging for debugging data flow
 * 
 * Confidence Rating: High - Enhanced with Home navigation state clearing
 */
function AppContent() {
  const location = useLocation();
  const { catalog, loading: catalogLoading, error: catalogError } = useStarsCatalog();
  const { 
    suggestedStars, 
    isLoading: suggestionsLoading, 
    fetchSuggestionsForEmotion, 
    clearSuggestedStars 
  } = useSuggestedStars();
  
  const [selectedStar, setSelectedStar] = useState<HygStarData | null>(null);
  const [cameraCommand, setCameraCommand] = useState<any>(null);

  console.log("App: Current location.pathname:", location.pathname);
  console.log("App: suggestedStars.length:", suggestedStars.length);
  console.log("App: suggestionsLoading:", suggestionsLoading);
  console.log("App: selectedStar:", selectedStar ? selectedStar.hyg.proper || selectedStar.hyg.id : 'null');

  // Control settings for the star visualization - LABELS ENABLED
  const [controlSettings] = useState({
    starSize: 0.25,
    glowMultiplier: 2,
    showLabels: true,
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

  // FIXED: Clear selectedStar state when navigating to Home page
  useEffect(() => {
    if (location.pathname === '/') {
      if (selectedStar) {
        console.log('App: Navigated to Home page, clearing selectedStar state');
        setSelectedStar(null);
      }
    }
  }, [location.pathname, selectedStar]);

  // CENTRALIZED STAR SUGGESTION LOGIC: Monitor URL changes and trigger fetches
  useEffect(() => {
    console.log(`=== App: URL change detected: ${location.pathname} ===`);
    
    // Extract emotionId from /stars/:emotionId route
    const starsRouteMatch = location.pathname.match(/^\/stars\/([^\/]+)$/);
    
    if (starsRouteMatch) {
      const emotionId = starsRouteMatch[1];
      console.log(`App: Detected emotion route with emotionId: ${emotionId}`);
      console.log(`App: Current suggestedStars.length: ${suggestedStars.length}`);
      console.log(`App: Current suggestionsLoading: ${suggestionsLoading}`);
      
      // Only fetch if we don't already have suggestions for this emotion
      // This prevents unnecessary refetches when navigating within the same emotion
      const currentEmotionStars = suggestedStars.filter(star => 
        star.metadata?.emotion === emotionId
      );
      
      if (currentEmotionStars.length === 0 && !suggestionsLoading) {
        console.log(`App: No suggestions found for emotion ${emotionId}, triggering fetch`);
        
        fetchSuggestionsForEmotion(emotionId).catch(error => {
          console.error(`App: Failed to fetch suggestions for emotion ${emotionId}:`, error);
        });
      } else {
        console.log(`App: Already have ${currentEmotionStars.length} suggestions for emotion ${emotionId}, skipping fetch`);
      }
    } else {
      // Not on a stars route - clear suggestions if we have any
      if (suggestedStars.length > 0) {
        console.log(`App: Not on stars route (${location.pathname}), clearing ${suggestedStars.length} suggestions`);
        clearSuggestedStars();
      } else {
        console.log(`App: Not on stars route (${location.pathname}), no suggestions to clear`);
      }
    }
  }, [location.pathname, fetchSuggestionsForEmotion, clearSuggestedStars, suggestedStars, suggestionsLoading]);

  // Derive highlighted star IDs from suggested stars using starCatalogRef
  const highlightedStarIds = suggestedStars.map(star => star.starCatalogRef.hyg.id.toString());
  
  console.log("App: Derived highlightedStarIds:", highlightedStarIds);

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

  // Determine burger menu position based on current route
  const getBurgerMenuPosition = () => {
    // On StarSelection page, move burger menu to avoid conflict with right sidebar
    if (location.pathname.startsWith('/stars/')) {
      return 'right-96'; // Position it to the left of the 320px (w-80) sidebar
    }
    return 'right-4'; // Default position
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
        
        {/* Burger Menu with dynamic positioning */}
        <BurgerMenu className={getBurgerMenuPosition()} />
        
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
                  suggestedStars={suggestedStars}
                  isLoadingSuggestions={suggestionsLoading}
                />
              } 
            />
            <Route path="/dedicate/:starId" element={<Dedication />} />
            <Route path="/star/:dedicationId" element={<SharedStar />} />
          </Routes>
        </motion.div>
      </StarviewCameraProvider>
    </div>
  );
}

/**
 * Main App Component - Provides context wrapper
 */
function App() {
  return (
    <SuggestedStarsProvider>
      <Router>
        <AppContent />
      </Router>
    </SuggestedStarsProvider>
  );
}

export default App;