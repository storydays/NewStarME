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
      {/* Logo text in top left corner */}
      <div className="absolute top-4 left-4 z-20">
        <img 
          src="/src/assets/logotext_poweredby_360w.png" 
          alt="Powered by" 
          className="h-6 opacity-70 hover:opacity-100 transition-opacity duration-300"
        />
      </div>

      {/* Main content with refined physics-based layout */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen px-6 py-8">
        
        {/* Header with enhanced cosmic typography - TOP SECTION */}
        <motion.div 
          className="text-center max-w-2xl mx-auto flex-shrink-0 flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-light bg-gradient-to-r from-cosmic-cherenkov-blue via-cosmic-plasma-glow to-cosmic-stellar-wind bg-clip-text text-transparent mb-4 tracking-wider cosmic-float text-center"
            style={{ 
              fontVariationSettings: "'wght' 300",
              textShadow: '0 0 30px rgba(37, 99, 235, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',
              filter: 'drop-shadow(0 0 20px rgba(37, 99, 235, 0.4))'
            }}
          >
            StarMe
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-cosmic-light-echo font-light leading-relaxed text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Where memories live forever – not die in feeds
          </motion.p>
        </motion.div>

        {/* Enhanced Emotion Wheel - MIDDLE SECTION - Centered with proper spacing */}
        <div className="flex-grow flex items-center justify-center flex-shrink-0">
          <motion.div
            className="relative flex-shrink-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "backOut" }}
          >
            {/* Quantum field effect around wheel */}
            <div className="absolute inset-0 rounded-full bg-quantum-field opacity-30 blur-2xl scale-125 animate-pulse" />
            
            <div className="relative z-10 flex items-center justify-center">
              <EmotionWheel onEmotionSelect={handleEmotionSelect} />
            </div>
          </motion.div>
        </div>

        {/* Spacer for bottom section - removed explanation text */}
        <div className="flex-shrink-0 h-16"></div>

      </div>
    </div>
  );
}