import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarViewCanvas } from './components/StarViewCanvas';
import { Home } from './pages/Home';
import { StarSelection } from './pages/StarSelection';
import { Dedication } from './pages/Dedication';
import { SharedStar } from './pages/SharedStar';
import { HygStarsCatalog } from './data/StarsCatalog';

function App() {
  const [hygCatalog, setHygCatalog] = useState<HygStarsCatalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    async function loadHygCatalog() {
      try {
        console.log('Loading HYG catalog in App.tsx...');
        setCatalogLoading(true);
        
        // Load the HYG catalog from the public directory
        const catalog = await HygStarsCatalog.fromUrl('/hygdata_v41.csv.gz', true);
        
        console.log(`HYG catalog loaded successfully: ${catalog.getTotalStars()} stars`);
        setHygCatalog(catalog);
      } catch (error) {
        console.warn('Failed to load HYG catalog in App.tsx:', error);
        // Continue without catalog - StarViewCanvas will handle gracefully
        setHygCatalog(null);
      } finally {
        setCatalogLoading(false);
      }
    }

    loadHygCatalog();
  }, []);

  return (
    <Router>
      <div className="App cosmic-viewport">
        {/* Global 3D background canvas with HYG catalog - positioned at top level */}
        <StarViewCanvas hygCatalog={hygCatalog} catalogLoading={catalogLoading} />
        
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