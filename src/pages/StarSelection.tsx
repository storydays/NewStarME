import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Menu, Star as StarIcon, MapPin, Heart, Sparkles } from 'lucide-react';
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
  
  // Local state for selected star and sidebar
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
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

  // Update suggested stars when stars are loaded with enhanced highlighting
  useEffect(() => {
    if (stars && stars.length > 0) {
      console.log(`StarSelection: Setting ${stars.length} suggested stars for enhanced 3D highlighting with bigger sizes`);
      
      // Apply aurora-inspired gradient to suggested stars with bigger sizes
      const enhancedStars = stars.map(star => ({
        ...star,
        visual_data: {
          ...star.visual_data,
          // Bigger size for suggested stars
          size: star.visual_data.size * 2.5, // 2.5x bigger for suggested
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
    console.log(`StarSelection: Star selected for modal with purple styling: ${star.scientific_name}`);
    setSelectedStar(star);
  };

  const handleCloseModal = () => {
    console.log('StarSelection: Closing modal and resetting to overview state');
    setSelectedStar(null);
    // Reset starfield to overview state showing all suggested stars
    if (stars && stars.length > 0) {
      setSuggestedStars(stars);
    }
  };

  const handleDedicate = (star: Star) => {
    console.log(`StarSelection: Navigating to dedication for star: ${star.scientific_name}`);
    navigate(`/dedicate/${star.id}?emotion=${emotionId}`);
  };

  const handleNavigate = (index: number) => {
    console.log(`StarSelection: Navigating to star at index ${index}`);
    goToIndex(index);
  };

  const handleSidebarStarClick = (star: Star, index: number) => {
    console.log(`StarSelection: Sidebar star clicked: ${star.scientific_name}`);
    goToIndex(index);
    setSidebarExpanded(false); // Close sidebar after selection
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
      {/* Header - FIXED: Added pointer-events-auto to make button clickable */}
      <div className="absolute top-6 left-6 z-20 pointer-events-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-cosmic-stellar-wind hover:text-cosmic-observation transition-colors group font-light frosted-glass px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Return to emotions
        </button>
      </div>

      {/* Enhanced Right Sidebar with High Transparency - FIXED: Added pointer-events-auto */}
      <div className="fixed right-0 top-0 h-full z-30 pointer-events-auto">
        {/* Fancy hamburger trigger with enhanced styling */}
        <motion.button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="absolute top-6 right-6 w-14 h-14 rounded-xl flex items-center justify-center text-cosmic-observation hover:text-cosmic-cherenkov-blue transition-all duration-300 group"
          style={{
            background: 'rgba(248, 250, 252, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(248, 250, 252, 0.08)',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.1)'
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 12px 40px rgba(37, 99, 235, 0.2)',
            background: 'rgba(248, 250, 252, 0.05)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          
          {/* Fancy glow effect */}
          <div 
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(127, 255, 148, 0.1) 0%, rgba(57, 255, 20, 0.1) 100%)',
              filter: 'blur(8px)'
            }}
          />
        </motion.button>

        {/* Enhanced Sidebar panel with high transparency */}
        <AnimatePresence>
          {sidebarExpanded && (
            <motion.div
              className="h-full w-80 border-l"
              style={{
                background: 'rgba(0, 0, 0, 0.15)', // High transparency
                backdropFilter: 'blur(25px)',
                borderColor: 'rgba(248, 250, 252, 0.08)',
                boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.3)'
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="p-6 h-full flex flex-col">
                {/* Enhanced sidebar header with fancy styling */}
                <div className="mb-6">
                  <motion.div
                    className="flex items-center gap-3 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #7FFF94 0%, #39FF14 100%)',
                        boxShadow: '0 0 20px rgba(127, 255, 148, 0.4)'
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-light text-cosmic-observation">
                        {emotion.name} Stars
                      </h3>
                      <p className="text-cosmic-stellar-wind text-sm font-light">
                        {stars?.length || 0} celestial beacons
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Fancy divider */}
                  <div 
                    className="h-px w-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(127, 255, 148, 0.3) 50%, transparent 100%)'
                    }}
                  />
                </div>

                {/* Enhanced scrollable star list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {stars?.map((star, index) => (
                    <motion.div
                      key={star.id}
                      className="rounded-xl p-4 cursor-pointer transition-all duration-300 border group"
                      style={{
                        background: index === currentIndex 
                          ? 'rgba(248, 250, 252, 0.08)' 
                          : 'rgba(248, 250, 252, 0.03)',
                        backdropFilter: 'blur(15px)',
                        borderColor: index === currentIndex 
                          ? 'rgba(127, 255, 148, 0.3)' 
                          : 'rgba(248, 250, 252, 0.08)'
                      }}
                      whileHover={{ 
                        scale: 1.02, 
                        x: -4,
                        background: 'rgba(248, 250, 252, 0.1)',
                        borderColor: 'rgba(127, 255, 148, 0.4)'
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSidebarStarClick(star, index)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Enhanced star thumbnail with aurora gradient */}
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, #7FFF94 0%, #39FF14 100%)`,
                            boxShadow: '0 0 15px rgba(127, 255, 148, 0.4)'
                          }}
                        >
                          <StarIcon className="w-5 h-5 text-white relative z-10" />
                          
                          {/* Fancy rotating glow */}
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: 'conic-gradient(from 0deg, rgba(127, 255, 148, 0.8), rgba(57, 255, 20, 0.8), rgba(127, 255, 148, 0.8))',
                              filter: 'blur(4px)'
                            }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>
                        
                        {/* Enhanced star info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-cosmic-observation font-light text-sm truncate group-hover:text-cosmic-light-echo transition-colors">
                            {star.scientific_name}
                          </h4>
                          <p className="text-cosmic-stellar-wind text-xs font-light opacity-70 group-hover:opacity-100 transition-opacity">
                            {star.coordinates}
                          </p>
                        </div>

                        {/* Enhanced current indicator */}
                        {index === currentIndex && (
                          <motion.div 
                            className="w-3 h-3 rounded-full"
                            style={{
                              background: 'linear-gradient(135deg, #7FFF94 0%, #39FF14 100%)',
                              boxShadow: '0 0 10px rgba(127, 255, 148, 0.6)'
                            }}
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0.7, 1, 0.7]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced footer with fancy styling */}
                <motion.div
                  className="mt-6 pt-4"
                  style={{
                    borderTop: '1px solid rgba(248, 250, 252, 0.08)'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-cosmic-stellar-wind text-xs text-center font-light opacity-60">
                    Navigate through the cosmic catalog
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Selected Star Modal with Purple Styling - FIXED: Added pointer-events-auto */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            className="fixed inset-0 z-40 flex items-end justify-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Enhanced backdrop */}
            <div 
              className="absolute inset-0 backdrop-blur-sm"
              style={{
                background: 'rgba(0, 0, 0, 0.4)'
              }}
              onClick={handleCloseModal}
            />
            
            {/* Enhanced Modal with purple theme */}
            <motion.div
              className="relative w-full max-w-2xl mx-6 mb-6 rounded-2xl border overflow-hidden"
              style={{
                background: 'rgba(248, 250, 252, 0.05)',
                backdropFilter: 'blur(25px)',
                borderColor: 'rgba(157, 78, 221, 0.3)',
                boxShadow: '0 20px 60px rgba(157, 78, 221, 0.2)'
              }}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Enhanced close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-cosmic-stellar-wind hover:text-cosmic-observation transition-all duration-300 z-10"
                style={{
                  background: 'rgba(248, 250, 252, 0.05)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(248, 250, 252, 0.1)'
                }}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                {/* Enhanced star visualization with purple cosmic gradient */}
                <div className="text-center mb-6">
                  <div className="relative mb-4 h-24 flex items-center justify-center">
                    <motion.div
                      className="relative rounded-full flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #9D4EDD 0%, #6A0572 100%)',
                        width: selectedStar.visual_data.size * 80,
                        height: selectedStar.visual_data.size * 80,
                        boxShadow: '0 0 50px rgba(157, 78, 221, 0.6), 0 0 100px rgba(106, 5, 114, 0.3)'
                      }}
                      animate={{ 
                        scale: [1, 1.08, 1],
                        boxShadow: [
                          '0 0 50px rgba(157, 78, 221, 0.6), 0 0 100px rgba(106, 5, 114, 0.3)',
                          '0 0 70px rgba(157, 78, 221, 0.8), 0 0 140px rgba(106, 5, 114, 0.4)',
                          '0 0 50px rgba(157, 78, 221, 0.6), 0 0 100px rgba(106, 5, 114, 0.3)'
                        ]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <StarIcon className="w-10 h-10 text-white" />
                      
                      {/* Purple particle effects */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{ 
                            background: 'linear-gradient(135deg, #9D4EDD, #6A0572)',
                            boxShadow: '0 0 8px rgba(157, 78, 221, 0.8)'
                          }}
                          animate={{
                            x: [0, (Math.random() - 0.5) * 100],
                            y: [0, (Math.random() - 0.5) * 100],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0]
                          }}
                          transition={{
                            duration: 4,
                            delay: i * 0.3,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>

                  <h2 className="text-3xl font-light text-cosmic-observation mb-2">
                    {selectedStar.scientific_name}
                  </h2>
                  
                  <div className="flex items-center justify-center gap-2 text-cosmic-stellar-wind text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="font-mono">{selectedStar.coordinates}</span>
                  </div>
                </div>

                {/* Enhanced star description */}
                <div className="mb-6">
                  <p className="text-cosmic-light-echo text-center leading-relaxed font-light">
                    {selectedStar.poetic_description.length > 150 
                      ? selectedStar.poetic_description.substring(0, 150) + '...'
                      : selectedStar.poetic_description
                    }
                  </p>
                </div>

                {/* Enhanced action button with purple theme */}
                <div className="text-center">
                  <motion.button
                    onClick={() => handleDedicate(selectedStar)}
                    className="text-cosmic-observation font-light py-4 px-10 rounded-xl transition-all duration-500 flex items-center justify-center gap-3 mx-auto text-lg"
                    style={{
                      background: 'linear-gradient(135deg, #9D4EDD 0%, #6A0572 100%)',
                      boxShadow: '0 0 30px rgba(157, 78, 221, 0.4)'
                    }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      boxShadow: '0 0 40px rgba(157, 78, 221, 0.6)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Heart className="w-6 h-6" />
                    Dedicate This Star
                    <Sparkles className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}