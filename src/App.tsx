import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarviewCanvas } from './render/StarviewCanvas';
import { Home } from './pages/Home';
import { StarSelection } from './pages/StarSelection';
import { Dedication } from './pages/Dedication';
import { SharedStar } from './pages/SharedStar';
import { HygStarsCatalog } from './data/StarsCatalog';
import { HygRecord } from './types';

function App() {
  const [hygCatalog, setHygCatalog] = useState<HygStarsCatalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedStar, setSelectedStar] = useState<HygRecord | null>(null);

  // Control settings for the star visualization - LABELS DISABLED BY DEFAULT
  const [controlSettings] = useState({
    starSize: 0.1,
    glowMultiplier: 1.2,
    showLabels: false // Changed from true to false
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
        // Continue without catalog - StarviewCanvas will handle gracefully
        setHygCatalog(null);
      } finally {
        setCatalogLoading(false);
      }
    }

    loadHygCatalog();
  }, []);

  const handleStarSelect = (star: HygRecord | null, index: number | null) => {
    console.log('Star selected:', star?.proper || star?.id, 'at index:', index);
    setSelectedStar(star);
  };

  return (
    <Router>
      <div className="App cosmic-viewport">
        {/* Global 3D background canvas with HYG catalog - positioned at top level */}
        <StarviewCanvas
          hygCatalog={hygCatalog}
          catalogLoading={catalogLoading}
          selectedStar={selectedStar}
          onStarSelect={handleStarSelect}
          starSize={controlSettings.starSize}
          glowMultiplier={controlSettings.glowMultiplier}
          showLabels={controlSettings.showLabels}
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

export default App;