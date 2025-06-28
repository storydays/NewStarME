import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Star as StarIcon, MapPin, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { useStars } from '../hooks/useStars';
import { useStarNavigation } from '../hooks/useStarNavigation';
import { useSuggestedStars } from '../context/SuggestedStarsContext';
import { emotions } from '../data/emotions';
import { Star } from '../types';

export function StarSelection() {
  const { emotionId } = useParams<{ emotionId: string }>();
  const navigate = useNavigate();
  const { stars, loading, error } = useStars(emotionId);
  const { setSuggestedStars, clearSuggestedStars, triggerStarFocus } = useSuggestedStars();
  
  // Local state for selected star modal
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  
  const emotion = emotions.find(e => e.id === emotionId);

  // Star navigation hook with camera focus integration
  const {
    currentIndex,
    currentStar,
    canGoPrev,
    canGoNext,
    goToPrev,
    goToNext,
    goToIndex,
    setCurrentIndex
  } = useStarNavigation({
    stars,
    onStarFocus: (star, index) => {
      console.log(`StarSelection: Focusing camera on star ${star.scientific_name} at index ${index}`);
      triggerStarFocus(star, index);
    }
  });

  // Update suggested stars when stars are loaded
  useEffect(() => {
    if (stars && stars.length > 0) {
      console.log(`StarSelection: Setting ${stars.length} suggested stars for enhanced 3D highlighting`);
      
      // Apply aurora-inspired gradient to suggested stars
      const enhancedStars = stars.map(star => ({
        ...star,
        visual_data: {
          ...star.visual_data,
          size: star.visual_data.size * 2.5, // Bigger size for suggested
          color: '#7FFF94', // Aurora green start
          gradientEnd: '#39FF14' // Aurora green end
        }
      }));
      
      setSuggestedStars(enhancedStars);
    }
    
    // Clear suggested stars when leaving this page
    return () => {
      console.log('StarSelection: Clearing suggested stars on unmount');
      clearSuggestedStars();
    };
  }, [stars]);

  if (!emotion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cosmic-observation text-xl">Emotion not found</p>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleStarSelect = (star: Star) => {
    console.log(`StarSelection: Star selected for modal: ${star.scientific_name}`);
    setSelectedStar(star);
  };

  const handleCloseModal = () => {
    console.log('StarSelection: Closing modal');
    setSelectedStar(null);
  };

  const handleDedicate = (star: Star) => {
    console.log(`StarSelection: Navigating to dedication for star: ${star.scientific_name}`);
    navigate(`/dedicate/${star.id}?emotion=${emotionId}`);
  };

  const handleSidebarStarClick = (star: Star, index: number) => {
    console.log(`StarSelection: Sidebar star clicked: ${star.scientific_name}`);
    goToIndex(index);
    setSelectedStar(star); // Open modal when clicking from sidebar
  };

  if (loading) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative z-10 flex items-center justify-center min-h-screen pointer-events-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-2 border-cosmic-cherenkov-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cosmic-observation text-lg font-light">Scanning the cosmic depths...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative z-10 flex items-center justify-center min-h-screen pointer-events-auto">
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">Unable to access star catalog</p>
            <button 
              onClick={handleBack}
              className="text-cosmic-cherenkov-blue hover:text-cosmic-plasma-glow transition-colors font-light"
            >
              ← Return to emotion selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Header */}
      <div className="absolute top-6 left-6 z-20 pointer-events-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-cosmic-stellar-wind hover:text-cosmic-observation transition-colors group font-light frosted-glass px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Return to emotions
        </button>
      </div>

      {/* Minimalist Transparent Right Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 z-30 pointer-events-auto">
        <div 
          className="h-full border-l"
          style={{
            background: 'rgba(248, 250, 252, 0.02)', // 98% transparency
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(248, 250, 252, 0.06)',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Minimalist Header */}
            <div className="mb-6">
              <motion.div
                className="flex items-center gap-3 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(127, 255, 148, 0.15)',
                    border: '1px solid rgba(127, 255, 148, 0.3)'
                  }}
                >
                  <Sparkles className="w-4 h-4 text-cosmic-observation" />
                </div>
                <div>
                  <h3 className="text-lg font-light text-cosmic-observation">
                    {emotion.name} Stars
                  </h3>
                  <p className="text-cosmic-stellar-wind text-xs font-light opacity-70">
                    {stars?.length || 0} celestial beacons
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Elegant Star List - FIXED: Move dynamic styles to animate prop */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {stars?.map((star, index) => (
                <motion.div
                  key={star.id}
                  className="rounded-lg p-3 cursor-pointer transition-all duration-300 border group"
                  style={{
                    // FIXED: Only static styles remain in style prop
                    backdropFilter: 'blur(12px)'
                  }}
                  animate={{
                    // FIXED: Dynamic styles moved to animate prop for proper Framer Motion updates
                    background: index === currentIndex 
                      ? 'rgba(248, 250, 252, 0.06)' 
                      : 'rgba(248, 250, 252, 0.02)',
                    borderColor: index === currentIndex 
                      ? 'rgba(127, 255, 148, 0.2)' 
                      : 'rgba(248, 250, 252, 0.04)'
                  }}
                  whileHover={{ 
                    scale: 1.01,
                    background: 'rgba(248, 250, 252, 0.08)',
                    borderColor: 'rgba(127, 255, 148, 0.3)'
                  }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSidebarStarClick(star, index)}
                  initial={{ opacity: 0, x: 20 }}
                  transition={{ 
                    delay: 0.1 + index * 0.03,
                    // FIXED: Ensure smooth transitions for background and border changes
                    background: { duration: 0.3, ease: "easeOut" },
                    borderColor: { duration: 0.3, ease: "easeOut" }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Minimalist Star Icon */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center relative"
                      style={{
                        background: 'rgba(127, 255, 148, 0.1)',
                        border: '1px solid rgba(127, 255, 148, 0.2)'
                      }}
                    >
                      <StarIcon className="w-4 h-4 text-cosmic-observation" />
                    </div>
                    
                    {/* Star Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-cosmic-observation font-light text-sm truncate group-hover:text-cosmic-light-echo transition-colors">
                        {star.scientific_name}
                      </h4>
                      <p className="text-cosmic-stellar-wind text-xs font-light opacity-60 group-hover:opacity-80 transition-opacity truncate">
                        {star.coordinates}
                      </p>
                    </div>

                    {/* Subtle Arrow */}
                    <ChevronRight className="w-4 h-4 text-cosmic-stellar-wind opacity-0 group-hover:opacity-60 transition-all transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Minimalist Footer */}
            <motion.div
              className="mt-4 pt-4"
              style={{
                borderTop: '1px solid rgba(248, 250, 252, 0.04)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-cosmic-stellar-wind text-xs text-center font-light opacity-50">
                Click any star to view details
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Compact Bottom Modal - FIXED: Pointer events configuration */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              // Only close modal if clicking directly on the backdrop
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            {/* Compact Modal - 32px from bottom, centered */}
            <motion.div
              className="relative w-full max-w-2xl mx-6 rounded-2xl border overflow-hidden pointer-events-auto"
              style={{
                background: 'rgba(248, 250, 252, 0.03)', // High transparency
                backdropFilter: 'blur(25px)',
                borderColor: 'rgba(157, 78, 221, 0.2)',
                boxShadow: '0 20px 60px rgba(157, 78, 221, 0.15)',
                marginBottom: '32px' // 32px from bottom edge
              }}
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-cosmic-stellar-wind hover:text-cosmic-observation transition-all duration-300 z-10 pointer-events-auto"
                style={{
                  background: 'rgba(248, 250, 252, 0.05)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(248, 250, 252, 0.1)'
                }}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-6">
                  {/* High-Quality Star Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="relative h-16 w-16 flex items-center justify-center">
                      <motion.div
                        className="relative rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #9D4EDD 0%, #6A0572 100%)',
                          width: selectedStar.visual_data.size * 64,
                          height: selectedStar.visual_data.size * 64,
                          boxShadow: '0 0 30px rgba(157, 78, 221, 0.4), 0 0 60px rgba(106, 5, 114, 0.2)'
                        }}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            '0 0 30px rgba(157, 78, 221, 0.4), 0 0 60px rgba(106, 5, 114, 0.2)',
                            '0 0 40px rgba(157, 78, 221, 0.6), 0 0 80px rgba(106, 5, 114, 0.3)',
                            '0 0 30px rgba(157, 78, 221, 0.4), 0 0 60px rgba(106, 5, 114, 0.2)'
                          ]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <StarIcon className="w-6 h-6 text-white" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Star Information */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-light text-cosmic-observation mb-1 truncate">
                      {selectedStar.scientific_name}
                    </h2>
                    
                    <div className="flex items-center gap-2 text-cosmic-stellar-wind text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="font-mono">{selectedStar.coordinates}</span>
                    </div>

                    {/* Brief Description - Max 2 lines */}
                    <p className="text-cosmic-light-echo text-sm leading-relaxed font-light line-clamp-2">
                      {selectedStar.poetic_description.length > 120 
                        ? selectedStar.poetic_description.substring(0, 120) + '...'
                        : selectedStar.poetic_description
                      }
                    </p>
                  </div>

                  {/* Prominent Dedicate Button */}
                  <div className="flex-shrink-0">
                    <motion.button
                      onClick={() => handleDedicate(selectedStar)}
                      className="text-cosmic-observation font-light py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm pointer-events-auto"
                      style={{
                        background: 'linear-gradient(135deg, #9D4EDD 0%, #6A0572 100%)',
                        boxShadow: '0 0 20px rgba(157, 78, 221, 0.3)'
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: '0 0 25px rgba(157, 78, 221, 0.4)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Heart className="w-4 h-4" />
                      Dedicate This Star
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}