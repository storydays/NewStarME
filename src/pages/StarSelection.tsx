import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Star as StarIcon, MapPin, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { useStarsForEmotion } from '../hooks/useStarsCatalog';
import { useSuggestedStars } from '../context/SuggestedStarsContext';
import { useStarviewCamera } from '../hooks/useStarviewCamera';
import { emotions } from '../data/emotions';
import { HygStarData } from '../types';

/**
 * StarSelection Component - ENHANCED: Detailed Logging for Debugging
 * 
 * Purpose: Emotion-based star selection interface with comprehensive logging
 * to trace the execution flow and identify state propagation issues.
 * 
 * ENHANCED LOGGING:
 * - Detailed logs for every useEffect execution
 * - Function call tracing with parameters
 * - State change monitoring
 * - Error boundary logging
 * - Execution timing information
 * 
 * Confidence Rating: High - Comprehensive debugging implementation
 */

interface StarSelectionProps {
  selectedStar: HygStarData | null;
  setSelectedStar: (star: HygStarData | null) => void;
  onStarClick: (star: HygStarData) => void;
}

export function StarSelection({ selectedStar, setSelectedStar, onStarClick }: StarSelectionProps) {
  const { emotionId } = useParams<{ emotionId: string }>();
  const navigate = useNavigate();
  const { stars: catalogStars, loading, error } = useStarsForEmotion(emotionId, 5);
  const { fetchSuggestionsForEmotion } = useSuggestedStars();
  const { focusOnStar, centerView } = useStarviewCamera();
  
  // Local state for modal
  const [modalStar, setModalStar] = useState<HygStarData | null>(null);
  
  // ENHANCED: Track which emotion we've fetched suggestions for
  const lastSuggestionEmotionRef = useRef<string | null>(null);
  const isUnmountingRef = useRef(false);
  const loadSuggestionsCallCountRef = useRef(0);
  
  const emotion = emotions.find(e => e.id === emotionId);

  console.log('=== StarSelection: Component render ===');
  console.log('StarSelection: emotionId:', emotionId);
  console.log('StarSelection: catalogStars.length:', catalogStars.length);
  console.log('StarSelection: loading:', loading);
  console.log('StarSelection: error:', error);
  console.log('StarSelection: lastSuggestionEmotionRef.current:', lastSuggestionEmotionRef.current);
  console.log('StarSelection: isUnmountingRef.current:', isUnmountingRef.current);

  // ENHANCED: Detailed suggestion fetching with comprehensive logging
  useEffect(() => {
    const effectStartTime = Date.now();
    const callId = ++loadSuggestionsCallCountRef.current;
    
    console.log(`=== StarSelection: loadSuggestions useEffect #${callId} START ===`);
    console.log(`StarSelection: useEffect #${callId} - emotionId:`, emotionId);
    console.log(`StarSelection: useEffect #${callId} - catalogStars.length:`, catalogStars.length);
    console.log(`StarSelection: useEffect #${callId} - lastSuggestionEmotionRef.current:`, lastSuggestionEmotionRef.current);
    console.log(`StarSelection: useEffect #${callId} - isUnmountingRef.current:`, isUnmountingRef.current);

    async function loadSuggestions() {
      const functionStartTime = Date.now();
      console.log(`StarSelection: loadSuggestions function #${callId} START`);
      
      // Early returns to prevent unnecessary work
      if (!emotionId) {
        console.log(`StarSelection: loadSuggestions #${callId} - EARLY RETURN: no emotionId`);
        return;
      }
      
      if (catalogStars.length === 0) {
        console.log(`StarSelection: loadSuggestions #${callId} - EARLY RETURN: no catalogStars (length: ${catalogStars.length})`);
        return;
      }
      
      if (isUnmountingRef.current) {
        console.log(`StarSelection: loadSuggestions #${callId} - EARLY RETURN: component unmounting`);
        return;
      }
      
      // ENHANCED: Only fetch if we haven't already fetched for this emotion
      if (lastSuggestionEmotionRef.current === emotionId) {
        console.log(`StarSelection: loadSuggestions #${callId} - EARLY RETURN: Already fetched suggestions for ${emotionId}`);
        return;
      }

      try {
        console.log(`StarSelection: loadSuggestions #${callId} - PROCEEDING: Fetching suggestions for emotion: ${emotionId}`);
        console.log(`StarSelection: loadSuggestions #${callId} - About to call fetchSuggestionsForEmotion with:`, emotionId);
        
        // ENHANCED: Log the function call with timing
        const fetchStartTime = Date.now();
        console.log(`StarSelection: loadSuggestions #${callId} - CALLING fetchSuggestionsForEmotion at ${fetchStartTime}`);
        
        await fetchSuggestionsForEmotion(emotionId);
        
        const fetchEndTime = Date.now();
        console.log(`StarSelection: loadSuggestions #${callId} - fetchSuggestionsForEmotion COMPLETED in ${fetchEndTime - fetchStartTime}ms`);
        
        // Track that we've fetched for this emotion
        lastSuggestionEmotionRef.current = emotionId;
        console.log(`StarSelection: loadSuggestions #${callId} - Updated lastSuggestionEmotionRef to:`, emotionId);
        
        // Only center view if component is still mounted
        if (!isUnmountingRef.current) {
          console.log(`StarSelection: loadSuggestions #${callId} - Calling centerView()`);
          centerView();
          console.log(`StarSelection: loadSuggestions #${callId} - centerView() completed`);
        } else {
          console.log(`StarSelection: loadSuggestions #${callId} - SKIPPED centerView() - component unmounting`);
        }
        
        const functionEndTime = Date.now();
        console.log(`StarSelection: loadSuggestions #${callId} - COMPLETED successfully in ${functionEndTime - functionStartTime}ms`);
        
      } catch (error) {
        const errorTime = Date.now();
        console.error(`StarSelection: loadSuggestions #${callId} - ERROR at ${errorTime}:`, error);
        console.error(`StarSelection: loadSuggestions #${callId} - Error details:`, {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
      }
    }

    console.log(`StarSelection: useEffect #${callId} - About to call loadSuggestions()`);
    loadSuggestions().then(() => {
      const effectEndTime = Date.now();
      console.log(`StarSelection: useEffect #${callId} - loadSuggestions() promise resolved in ${effectEndTime - effectStartTime}ms`);
    }).catch((error) => {
      const effectErrorTime = Date.now();
      console.error(`StarSelection: useEffect #${callId} - loadSuggestions() promise rejected in ${effectErrorTime - effectStartTime}ms:`, error);
    });

    console.log(`=== StarSelection: loadSuggestions useEffect #${callId} END ===`);
  }, [emotionId, catalogStars.length]); // ENHANCED: Removed fetchSuggestionsForEmotion and centerView from dependencies

  // ENHANCED: Reset suggestion tracking when emotion changes with detailed logging
  useEffect(() => {
    console.log('=== StarSelection: emotion change tracking useEffect START ===');
    console.log('StarSelection: emotion change - emotionId:', emotionId);
    console.log('StarSelection: emotion change - lastSuggestionEmotionRef.current:', lastSuggestionEmotionRef.current);
    
    if (emotionId && lastSuggestionEmotionRef.current && lastSuggestionEmotionRef.current !== emotionId) {
      console.log(`StarSelection: EMOTION CHANGED from ${lastSuggestionEmotionRef.current} to ${emotionId}, resetting suggestion tracking`);
      lastSuggestionEmotionRef.current = null;
      console.log('StarSelection: emotion change - Reset lastSuggestionEmotionRef to null');
    } else {
      console.log('StarSelection: emotion change - No reset needed');
    }
    
    console.log('=== StarSelection: emotion change tracking useEffect END ===');
  }, [emotionId]);

  // ENHANCED: Cleanup function with detailed logging
  useEffect(() => {
    console.log('=== StarSelection: cleanup useEffect START ===');
    console.log('StarSelection: cleanup - Setting up cleanup for emotionId:', emotionId);
    
    return () => {
      console.log('=== StarSelection: CLEANUP FUNCTION EXECUTING ===');
      console.log('StarSelection: Component unmounting for emotionId:', emotionId);
      isUnmountingRef.current = true;
      
      // Reset unmounting flag after cleanup
      setTimeout(() => {
        console.log('StarSelection: Resetting unmounting flag after cleanup');
        isUnmountingRef.current = false;
      }, 100);
      
      console.log('=== StarSelection: CLEANUP FUNCTION COMPLETED ===');
    };
  }, [emotionId]);

  if (!emotion) {
    console.log('StarSelection: EARLY RETURN - emotion not found for emotionId:', emotionId);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cosmic-observation text-xl">Emotion not found</p>
      </div>
    );
  }

  const handleBack = () => {
    console.log('StarSelection: handleBack called');
    navigate('/');
  };

  const handleStarSelect = (catalogStar: HygStarData, index: number) => {
    console.log(`StarSelection: handleStarSelect called with star: ${catalogStar.hyg.proper || catalogStar.hyg.id}, index: ${index}`);
    
    // Update global selected star state
    setSelectedStar(catalogStar);
    console.log('StarSelection: setSelectedStar called');
    
    // Show modal
    setModalStar(catalogStar);
    console.log('StarSelection: setModalStar called');
    
    // Focus camera on selected star using direct camera control
    const catalogId = catalogStar.hyg.id.toString();
    console.log('StarSelection: About to call focusOnStar with catalogId:', catalogId);
    focusOnStar(catalogId);
    console.log('StarSelection: focusOnStar called');
  };

  const handleCloseModal = () => {
    console.log('StarSelection: handleCloseModal called');
    setModalStar(null);
  };

  const handleDedicate = (catalogStar: HygStarData) => {
    console.log(`StarSelection: handleDedicate called for star: ${catalogStar.hyg.proper || catalogStar.hyg.id}`);
    navigate(`/dedicate/catalog-${catalogStar.hyg.id}?emotion=${emotionId}`);
  };

  if (loading) {
    console.log('StarSelection: Rendering loading state');
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
    console.log('StarSelection: Rendering error state:', error);
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative z-10 flex items-center justify-center min-h-screen pointer-events-auto">
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">Unable to access star catalog</p>
            <p className="text-cosmic-stellar-wind text-sm mb-4">{error}</p>
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

  console.log('StarSelection: Rendering main component with catalogStars.length:', catalogStars?.length || 0);

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

      {/* Enhanced Right Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 z-30 pointer-events-auto">
        <div 
          className="h-full border-l"
          style={{
            background: 'rgba(248, 250, 252, 0.02)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(248, 250, 252, 0.06)',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
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
                    {catalogStars?.length || 0} celestial beacons
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Star List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {catalogStars?.map((catalogStar, index) => (
                <motion.div
                  key={catalogStar.hyg.id}
                  className="rounded-lg p-3 cursor-pointer transition-all duration-300 border group"
                  style={{
                    backdropFilter: 'blur(12px)',
                    background: selectedStar?.hyg.id === catalogStar.hyg.id
                      ? 'rgba(248, 250, 252, 0.06)' 
                      : 'rgba(248, 250, 252, 0.02)',
                    borderColor: selectedStar?.hyg.id === catalogStar.hyg.id
                      ? 'rgba(127, 255, 148, 0.2)' 
                      : 'rgba(248, 250, 252, 0.04)'
                  }}
                  whileHover={{ 
                    scale: 1.01,
                    background: 'rgba(248, 250, 252, 0.08)',
                    borderColor: 'rgba(127, 255, 148, 0.3)'
                  }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleStarSelect(catalogStar, index)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center relative"
                      style={{
                        background: 'rgba(127, 255, 148, 0.1)',
                        border: '1px solid rgba(127, 255, 148, 0.2)'
                      }}
                    >
                      <StarIcon className="w-4 h-4 text-cosmic-observation" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-cosmic-observation font-light text-sm truncate group-hover:text-cosmic-light-echo transition-colors">
                        {catalogStar.hyg.proper || `HYG ${catalogStar.hyg.id}`}
                      </h4>
                      <p className="text-cosmic-stellar-wind text-xs font-light opacity-60 group-hover:opacity-80 transition-opacity truncate">
                        Magnitude: {catalogStar.hyg.mag.toFixed(2)}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-cosmic-stellar-wind opacity-0 group-hover:opacity-60 transition-all transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
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

      {/* Star Detail Modal */}
      <AnimatePresence>
        {modalStar && (
          <motion.div
            className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <motion.div
              className="relative w-full max-w-2xl mx-6 rounded-2xl border overflow-hidden pointer-events-auto"
              style={{
                background: 'rgba(248, 250, 252, 0.03)',
                backdropFilter: 'blur(25px)',
                borderColor: 'rgba(157, 78, 221, 0.2)',
                boxShadow: '0 20px 60px rgba(157, 78, 221, 0.15)',
                marginBottom: '32px'
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
                  {/* Star Visualization */}
                  <div className="flex-shrink-0">
                    <div className="relative h-16 w-16 flex items-center justify-center">
                      <motion.div
                        className="relative rounded-full flex items-center justify-center"
                        style={{ 
                          background: `linear-gradient(135deg, ${modalStar.render.color} 0%, ${modalStar.render.color}80 100%)`,
                          width: modalStar.render.size * 64,
                          height: modalStar.render.size * 64,
                          boxShadow: `0 0 30px ${modalStar.render.color}40, 0 0 60px ${modalStar.render.color}20`
                        }}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            `0 0 30px ${modalStar.render.color}40, 0 0 60px ${modalStar.render.color}20`,
                            `0 0 40px ${modalStar.render.color}60, 0 0 80px ${modalStar.render.color}30`,
                            `0 0 30px ${modalStar.render.color}40, 0 0 60px ${modalStar.render.color}20`
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
                      {modalStar.hyg.proper || `HYG ${modalStar.hyg.id}`}
                    </h2>
                    
                    <div className="flex items-center gap-2 text-cosmic-stellar-wind text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="font-mono">
                        RA: {modalStar.hyg.ra.toFixed(3)}°, Dec: {modalStar.hyg.dec.toFixed(3)}°
                      </span>
                    </div>

                    <div className="text-cosmic-light-echo text-sm leading-relaxed font-light space-y-1">
                      <p>Magnitude: {modalStar.hyg.mag.toFixed(2)}</p>
                      <p>Distance: {modalStar.hyg.dist.toFixed(1)} parsecs</p>
                      {modalStar.hyg.spect && <p>Spectral Class: {modalStar.hyg.spect}</p>}
                      {modalStar.hyg.con && <p>Constellation: {modalStar.hyg.con}</p>}
                    </div>
                  </div>

                  {/* Dedicate Button */}
                  <div className="flex-shrink-0">
                    <motion.button
                      onClick={() => handleDedicate(modalStar)}
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