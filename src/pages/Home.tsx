import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EmotionWheel } from '../components/EmotionWheel';
import { useSuggestedStars } from '../context/SuggestedStarsContext';
import { Emotion } from '../types';

export function Home() {
  const navigate = useNavigate();
  const { clearSuggestedStars } = useSuggestedStars();

  // FIXED: Clear suggested stars when Home page is displayed
  useEffect(() => {
    console.log('Home: Clearing suggested stars on page load');
    clearSuggestedStars();
  }, [clearSuggestedStars]);

  const handleEmotionSelect = (emotion: Emotion) => {
    navigate(`/stars/${emotion.id}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main content with refined physics-based layout */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen px-6 py-8">
        
        {/* Header with standardized cosmic typography - TOP SECTION */}
        <motion.div 
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-light text-cosmic-observation mb-4 tracking-tight cosmic-float"
            style={{ fontVariationSettings: "'wght' 300" }}
          >
            StarMe
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-cosmic-light-echo font-light leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Dedicate a star to someone special
          </motion.p>
        </motion.div>

        {/* Enhanced Emotion Wheel - MIDDLE SECTION - Centered with proper spacing */}
        <div className="flex-grow flex items-center justify-center">
          <motion.div
            className="relative flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "backOut" }}
          >
            {/* Quantum field effect around wheel */}
            <div className="absolute inset-0 rounded-full bg-quantum-field opacity-30 blur-2xl scale-125 animate-pulse" />
            
            <div className="relative z-10">
              <EmotionWheel onEmotionSelect={handleEmotionSelect} />
            </div>
          </motion.div>
        </div>

        {/* Enhanced explanation with standardized text - BOTTOM SECTION */}
        <motion.div
          className="text-center max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="frosted-glass rounded-2xl p-6 cosmic-float-card">
            <motion.p 
              className="text-lg md:text-xl text-cosmic-light-echo font-light leading-relaxed mb-3"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              Every star tells a story. Every dedication creates a lasting memory.
            </motion.p>
            <motion.p 
              className="text-xs text-cosmic-stellar-wind font-light quantum-fluctuation"
            >
              Select an emotion above to begin your cosmic journey
            </motion.p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}