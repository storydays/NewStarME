import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
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

  const handleDedicate = (star: Star) => {
    console.log(`StarSelection: Navigating to dedication for star: ${star.scientific_name}`);
    navigate(`/dedicate/${star.id}?emotion=${emotionId}`);
  };

  const handleNavigate = (index: number) => {
    console.log(`StarSelection: Navigating to star at index ${index}`);
    goToIndex(index);
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
    <></>
  );
}