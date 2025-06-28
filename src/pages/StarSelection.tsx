import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Menu, Star as StarIcon, MapPin, Heart } from 'lucide-react';
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
      console.log(`StarSelection: Setting ${stars.length} suggested stars for enhanced 3D highlighting`);
      
      // Apply aurora-inspired gradient to suggested stars
      const enhancedStars = stars.map(star => ({
        ...star,
        visual_data: {
          ...star.visual_data,
          // Reduce size by 15-20% and apply aurora gradient
          size: star.visual_data.size * 0.8, // 20% reduction
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
  }, [stars, setSuggestedStars, clearSuggestedStars]);

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
      <div className="min-h-screen relative">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
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
      <div className="min-h-screen flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-cosmic-stellar-wind hover:text-cosmic-observation transition-colors group font-light frosted-glass px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Return to emotions
        </button>
      </div>

      {/* Right Sidebar */}
      <div className="fixed right-0 top-0 h-full z-30">
        {/* Hamburger trigger */}
        <motion.button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="absolute top-6 right-6 w-12 h-12 frosted-glass-strong rounded-lg flex items-center justify-center text-cosmic-observation hover:text-cosmic-cherenkov-blue transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-6 h-6" />
        </motion.button>

        {/* Sidebar panel */}
        <AnimatePresence>
          {sidebarExpanded && (
            <motion.div
              className="h-full w-80 bg-black/80 backdrop-blur-lg border-l border-cosmic-particle-trace"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="p-6 h-full flex flex-col">
                {/* Sidebar header */}
                <div className="mb-6">
                  <h3 className="text-xl font-light text-cosmic-observation mb-2">
                    {emotion.name} Stars
                  </h3>
                  <p className="text-cosmic-stellar-wind text-sm font-light">
                    {stars?.length || 0} celestial beacons available
                  </p>
                </div>

                {/* Scrollable star list */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {stars?.map((star, index) => (
                    <motion.div
                      key={star.id}
                      className="frosted-glass rounded-lg p-4 cursor-pointer hover:frosted-glass-strong transition-all duration-300 border border-cosmic-particle-trace hover:border-cosmic-energy-flux"
                      whileHover={{ scale: 1.02, x: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSidebarStarClick(star, index)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Star thumbnail with aurora gradient */}
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center relative"
                          style={{
                            background: `linear-gradient(135deg, #7FFF94 0%, #39FF14 100%)`,
                            boxShadow: '0 0 12px #7FFF9460'
                          }}
                        >
                          <StarIcon className="w-4 h-4 text-white" />
                        </div>
                        
                        {/* Star info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-cosmic-observation font-light text-sm truncate">
                            {star.scientific_name}
                          </h4>
                          <p className="text-cosmic-stellar-wind text-xs font-light">
                            {star.coordinates}
                          </p>
                        </div>

                        {/* Current indicator */}
                        {index === currentIndex && (
                          <div className="w-2 h-2 bg-cosmic-cherenkov-blue rounded-full animate-pulse" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Star Modal */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            className="fixed inset-0 z-40 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            
            {/* Modal */}
            <motion.div
              className="relative w-full max-w-2xl mx-6 mb-6 frosted-glass-strong rounded-2xl border border-cosmic-particle-trace overflow-hidden"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full frosted-glass flex items-center justify-center text-cosmic-stellar-wind hover:text-cosmic-observation transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                {/* Star visualization with warm cosmic gradient */}
                <div className="text-center mb-6">
                  <div className="relative mb-4 h-20 flex items-center justify-center">
                    <motion.div
                      className="relative rounded-full flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #FF69B4 0%, #8B0000 100%)',
                        width: selectedStar.visual_data.size * 60,
                        height: selectedStar.visual_data.size * 60,
                        boxShadow: '0 0 40px #FF69B480, 0 0 80px #8B000040'
                      }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          '0 0 40px #FF69B480, 0 0 80px #8B000040',
                          '0 0 60px #FF69B4A0, 0 0 120px #8B000060',
                          '0 0 40px #FF69B480, 0 0 80px #8B000040'
                        ]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <StarIcon className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>

                  <h2 className="text-2xl font-light text-cosmic-observation mb-2">
                    {selectedStar.scientific_name}
                  </h2>
                  
                  <div className="flex items-center justify-center gap-2 text-cosmic-stellar-wind text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="font-mono">{selectedStar.coordinates}</span>
                  </div>
                </div>

                {/* Star description */}
                <div className="mb-6">
                  <p className="text-cosmic-light-echo text-center leading-relaxed font-light">
                    {selectedStar.poetic_description.length > 150 
                      ? selectedStar.poetic_description.substring(0, 150) + '...'
                      : selectedStar.poetic_description
                    }
                  </p>
                </div>

                {/* Action button */}
                <div className="text-center">
                  <motion.button
                    onClick={() => handleDedicate(selectedStar)}
                    className="bg-gradient-to-r from-cosmic-cherenkov-blue to-cosmic-plasma-glow hover:from-cosmic-plasma-glow hover:to-cosmic-stellar-wind text-cosmic-observation font-light py-3 px-8 rounded-xl transition-all duration-500 flex items-center justify-center gap-3 mx-auto cherenkov-glow"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Heart className="w-5 h-5" />
                    Dedicate This Star
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