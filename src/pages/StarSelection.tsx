import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Star as StarIcon, MapPin, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { useStarsForEmotion } from '../hooks/useStarsCatalog';
import { useSuggestedStars } from '../context/SuggestedStarsContext';
import { StarService } from '../services/starService';
import { emotions } from '../data/emotions';
import { HygStarData, SuggestedStar } from '../types';

/**
 * StarSelection Component - Enhanced with Refined Architecture
 * 
 * Purpose: Displays emotion-specific star selection using the refined architecture.
 * Integrates SuggestedStars from AI with StarsCatalog data seamlessly.
 * 
 * Features:
 * - Uses useStarsForEmotion hook for catalog-based selection
 * - Generates SuggestedStar objects with catalog links
 * - Modal display for star details
 * - Camera focus integration for 3D visualization
 * 
 * Confidence Rating: High - Clean integration with refined architecture
 */
export function StarSelection() {
  const { emotionId } = useParams<{ emotionId: string }>();
  const navigate = useNavigate();
  const { stars: catalogStars, loading, error } = useStarsForEmotion(emotionId, 5);
  const { 
    setSuggestedStars, 
    clearSuggestedStars, 
    selectedStar, 
    setSelectedStar,
    triggerStarFocus 
  } = useSuggestedStars();
  
  // Local state for modal
  const [modalStar, setModalStar] = useState<HygStarData | null>(null);
  const [suggestedStarsData, setSuggestedStarsData] = useState<SuggestedStar[]>([]);
  
  const emotion = emotions.find(e => e.id === emotionId);

  // Generate SuggestedStar objects when catalog stars are loaded
  useEffect(() => {
    async function generateSuggestedStars() {
      if (!emotionId || catalogStars.length === 0) return;

      try {
        console.log(`StarSelection: Generating suggested stars for emotion: ${emotionId}`);
        
        // Try to get AI-generated suggestions first
        const aiSuggestedStars = await StarService.getSuggestedStarsForEmotion(emotionId);
        
        if (aiSuggestedStars.length > 0) {
          console.log(`StarSelection: Using ${aiSuggestedStars.length} AI-generated suggested stars`);
          setSuggestedStarsData(aiSuggestedStars);
          setSuggestedStars(aiSuggestedStars);
        } else {
          // Fallback to catalog-based suggestions
          console.log('StarSelection: Falling back to catalog-based suggestions');
          const catalogSuggestions: SuggestedStar[] = catalogStars.map((catalogStar, index) => ({
            id: `catalog-${catalogStar.hyg.id}`,
            name: catalogStar.hyg.proper || `HYG ${catalogStar.hyg.id}`,
            description: `A magnificent ${emotionId} star shining in the cosmic depths`,
            metadata: {
              emotion: emotionId,
              confidence: 0.8,
              source: 'catalog'
            },
            starCatalogId: catalogStar.hyg.id.toString()
          }));
          
          setSuggestedStarsData(catalogSuggestions);
          setSuggestedStars(catalogSuggestions);
        }
      } catch (error) {
        console.error('Error generating suggested stars:', error);
        
        // Create basic fallback suggestions
        const fallbackSuggestions: SuggestedStar[] = catalogStars.map((catalogStar, index) => ({
          id: `fallback-${catalogStar.hyg.id}`,
          name: catalogStar.hyg.proper || `Star ${index + 1}`,
          description: `A beautiful star perfect for ${emotionId}`,
          metadata: {
            emotion: emotionId,
            confidence: 0.5,
            source: 'fallback'
          },
          starCatalogId: catalogStar.hyg.id.toString()
        }));
        
        setSuggestedStarsData(fallbackSuggestions);
        setSuggestedStars(fallbackSuggestions);
      }
    }

    generateSuggestedStars();
    
    // Clear suggested stars when leaving this page
    return () => {
      console.log('StarSelection: Clearing suggested stars on unmount');
      clearSuggestedStars();
    };
  }, [emotionId, catalogStars]);

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

  const handleStarSelect = (catalogStar: HygStarData, index: number) => {
    console.log(`StarSelection: Star selected: ${catalogStar.hyg.proper || catalogStar.hyg.id}`);
    setSelectedStar(catalogStar);
    setModalStar(catalogStar);
    triggerStarFocus(catalogStar, index);
  };

  const handleCloseModal = () => {
    console.log('StarSelection: Closing modal');
    setModalStar(null);
  };

  const handleDedicate = (catalogStar: HygStarData) => {
    console.log(`StarSelection: Navigating to dedication for star: ${catalogStar.hyg.proper || catalogStar.hyg.id}`);
    // For now, use a placeholder star ID - this would need to be enhanced
    // to create a proper Star record or use the catalog ID
    navigate(`/dedicate/catalog-${catalogStar.hyg.id}?emotion=${emotionId}`);
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