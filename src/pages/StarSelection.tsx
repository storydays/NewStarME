import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Eye, MousePointer } from 'lucide-react';
import { useStars } from '../hooks/useStars';
import { useSuggestedStars } from '../context/SuggestedStarsContext';
import { emotions } from '../data/emotions';
import { Star } from '../types';

export function StarSelection() {
  const { emotionId } = useParams<{ emotionId: string }>();
  const navigate = useNavigate();
  const { stars, loading, error } = useStars(emotionId);
  const { setSuggestedStars, clearSuggestedStars } = useSuggestedStars();
  
  const emotion = emotions.find(e => e.id === emotionId);

  // Update suggested stars when stars are loaded
  useEffect(() => {
    if (stars && stars.length > 0) {
      console.log(`StarSelection: Setting ${stars.length} suggested stars for 3D highlighting`);
      setSuggestedStars(stars);
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
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Enhanced Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-cosmic-stellar-wind hover:text-cosmic-observation transition-colors mb-12 group font-light frosted-glass px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Return to cosmic emotions
          </button>
          
          <div className="text-center max-w-2xl mx-auto">
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8 frosted-glass-strong border"
              style={{ 
                borderColor: `${emotion.color}40`
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Heart className="w-5 h-5 cherenkov-glow" style={{ color: emotion.color }} />
              <span className="text-cosmic-observation font-light text-lg">{emotion.name}</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl font-light text-cosmic-observation mb-6 cosmic-float"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Celestial Beacons Await
            </motion.h1>
            
            <motion.p 
              className="text-xl text-cosmic-light-echo font-light leading-relaxed particle-drift mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {stars.length} stars have been carefully selected to resonate with the cosmic frequency of {emotion.name.toLowerCase()}
            </motion.p>

            {/* 3D Interaction Guide */}
            <motion.div
              className="frosted-glass-strong rounded-2xl p-8 border border-cosmic-particle-trace max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-cosmic-cherenkov-blue" />
                <h3 className="text-lg font-light text-cosmic-observation">3D Star Selection</h3>
              </div>
              
              <div className="space-y-4 text-sm text-cosmic-light-echo font-light">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cosmic-cherenkov-blue animate-pulse"></div>
                  <span>Highlighted stars are glowing in cyan blue</span>
                </div>
                <div className="flex items-center gap-3">
                  <MousePointer className="w-4 h-4 text-cosmic-stellar-wind" />
                  <span>Click any highlighted star to select it</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span>Selected stars will glow in golden yellow</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-cosmic-particle-trace">
                <p className="text-xs text-cosmic-stellar-wind">
                  Use mouse to orbit • Scroll to zoom • Click stars to proceed to dedication
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Empty State - No cards, just guidance */}
        {stars.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="frosted-glass rounded-2xl p-12 max-w-md mx-auto">
              <p className="text-cosmic-stellar-wind text-xl font-light mb-4">
                No celestial bodies detected for {emotion.name}
              </p>
              <p className="text-cosmic-light-echo text-sm font-light">
                The cosmic algorithms are still processing this emotional frequency
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}