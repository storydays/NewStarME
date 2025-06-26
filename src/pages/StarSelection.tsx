import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import { StarCard } from '../components/StarCard';
import { StarField } from '../components/StarField';
import { useStars } from '../hooks/useStars';
import { emotions } from '../data/emotions';
import { Star } from '../types';

export function StarSelection() {
  const { emotionId } = useParams<{ emotionId: string }>();
  const navigate = useNavigate();
  const { stars, loading, error } = useStars(emotionId);
  
  const emotion = emotions.find(e => e.id === emotionId);

  if (!emotion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter to-cosmic-quantum-field flex items-center justify-center">
        <p className="text-cosmic-observation text-xl">Emotion not found</p>
      </div>
    );
  }

  const handleStarSelect = (star: Star) => {
    navigate(`/dedicate/${star.id}?emotion=${emotionId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter via-cosmic-deep-space to-cosmic-quantum-field relative">
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
      <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter to-cosmic-quantum-field flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter via-cosmic-deep-space to-cosmic-quantum-field relative">
      <StarField density={100} color={emotion.color} className="opacity-40" />
      
      {/* Gravitational lensing effect */}
      <div className="absolute inset-0 bg-gravitational-lensing opacity-15 pointer-events-none" />
      
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
              Choose Your Celestial Beacon
            </motion.h1>
            
            <motion.p 
              className="text-xl text-cosmic-light-echo font-light leading-relaxed particle-drift"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Each star has been carefully selected to resonate with the cosmic frequency of {emotion.name.toLowerCase()}
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced Stars Grid */}
        <motion.div
          className="cosmic-grid max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {stars.map((star, index) => (
            <StarCard
              key={star.id}
              star={star}
              onSelect={handleStarSelect}
              index={index}
            />
          ))}
        </motion.div>

        {/* Enhanced Empty State */}
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