import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star as StarIcon, 
  MapPin, 
  Heart,
  Sparkles
} from 'lucide-react';
import { Star } from '../types';

/**
 * StarNavigationPanel Component
 * 
 * Purpose: Floating navigation panel that allows users to browse through
 * suggested stars with prev/next controls and displays current star info.
 * 
 * Features:
 * - Prev/Next navigation through suggested stars
 * - Current star information display
 * - Smooth animations and transitions
 * - "Write in the star" action button
 * - Progress indicator showing current position
 * - Auto-hide when no stars available
 * - UPDATED: More compact and transparent design for clearer view
 * 
 * Confidence Rating: High - Standard navigation pattern with smooth UX
 */

interface StarNavigationPanelProps {
  stars: Star[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onDedicate: (star: Star) => void;
  emotionColor: string;
  emotionName: string;
}

export function StarNavigationPanel({
  stars,
  currentIndex,
  onNavigate,
  onDedicate,
  emotionColor,
  emotionName
}: StarNavigationPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show panel when stars are available
  useEffect(() => {
    if (stars.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [stars.length]);

  // Don't render if no stars
  if (stars.length === 0) {
    return null;
  }

  const currentStar = stars[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < stars.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleDedicate = () => {
    onDedicate(currentStar);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto"
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            delay: 0.2 
          }}
        >
          <div className="frosted-glass-lighter rounded-2xl border border-cosmic-particle-trace p-4 max-w-md mx-auto">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {stars.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-cosmic-cherenkov-blue' 
                      : 'bg-cosmic-particle-trace'
                  }`}
                  animate={index === currentIndex ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              ))}
            </div>

            {/* Star Information */}
            <motion.div
              key={currentIndex}
              className="text-center mb-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Star Visual */}
              <div className="relative mb-3 h-12 flex items-center justify-center">
                <motion.div
                  className="relative rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: currentStar.visual_data.color,
                    width: currentStar.visual_data.size * 40,
                    height: currentStar.visual_data.size * 40,
                    boxShadow: `0 0 ${currentStar.visual_data.size * 25}px ${currentStar.visual_data.color}60`
                  }}
                  animate={{ 
                    opacity: [
                      currentStar.visual_data.brightness, 
                      currentStar.visual_data.brightness * 1.3, 
                      currentStar.visual_data.brightness
                    ],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <StarIcon className="w-5 h-5 text-cosmic-observation" />
                </motion.div>
              </div>

              {/* Star Name */}
              <h3 className="text-lg font-light text-cosmic-observation mb-2">
                {currentStar.scientific_name}
              </h3>

              {/* Star Description */}
              <p className="text-cosmic-light-echo text-xs leading-relaxed mb-2 font-light">
                {currentStar.poetic_description}
              </p>

              {/* Coordinates */}
              <div className="flex items-center justify-center gap-2 text-cosmic-stellar-wind text-xs font-light">
                <MapPin className="w-3 h-3" />
                <span className="font-mono">{currentStar.coordinates}</span>
              </div>
            </motion.div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-3 mb-4">
              {/* Previous Button */}
              <motion.button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  canGoPrev 
                    ? 'frosted-glass hover:frosted-glass-strong text-cosmic-observation border border-cosmic-particle-trace hover:border-cosmic-energy-flux' 
                    : 'bg-cosmic-particle-trace/30 text-cosmic-stellar-wind/50 cursor-not-allowed'
                }`}
                whileHover={canGoPrev ? { scale: 1.05, y: -2 } : {}}
                whileTap={canGoPrev ? { scale: 0.95 } : {}}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              {/* Star Counter */}
              <div className="text-center">
                <div className="text-cosmic-observation font-light text-sm">
                  {currentIndex + 1} of {stars.length}
                </div>
                <div className="text-cosmic-stellar-wind text-xs font-light">
                  {emotionName} Stars
                </div>
              </div>

              {/* Next Button */}
              <motion.button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  canGoNext 
                    ? 'frosted-glass hover:frosted-glass-strong text-cosmic-observation border border-cosmic-particle-trace hover:border-cosmic-energy-flux' 
                    : 'bg-cosmic-particle-trace/30 text-cosmic-stellar-wind/50 cursor-not-allowed'
                }`}
                whileHover={canGoNext ? { scale: 1.05, y: -2 } : {}}
                whileTap={canGoNext ? { scale: 0.95 } : {}}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Dedicate Button */}
            <motion.button
              onClick={handleDedicate}
              className="w-full bg-gradient-to-r from-cosmic-cherenkov-blue to-cosmic-plasma-glow hover:from-cosmic-plasma-glow hover:to-cosmic-stellar-wind text-cosmic-observation font-light py-2.5 px-4 rounded-xl transition-all duration-500 flex items-center justify-center gap-2 group cherenkov-glow text-sm"
              style={{
                background: `linear-gradient(90deg, ${emotionColor}80, ${emotionColor}60)`
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Write in the star
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </motion.button>

            {/* Instructions */}
            <motion.div
              className="mt-3 text-center text-cosmic-stellar-wind text-xs font-light opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1 }}
            >
              Click highlighted stars in the 3D view or use navigation above
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}