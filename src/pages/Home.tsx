import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EmotionWheel } from '../components/EmotionWheel';
import { StarField } from '../components/StarField';
import { Emotion } from '../types';

export function Home() {
  const navigate = useNavigate();

  const handleEmotionSelect = (emotion: Emotion) => {
    navigate(`/stars/${emotion.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Subtle starfield background */}
      <StarField density={80} color="#60A5FA" className="opacity-30" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight">
            StarMe
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 font-light leading-relaxed">
            Dedicate a star to someone special
          </p>
          <p className="text-lg text-blue-200 mt-4 font-light">
            Choose the emotion that connects you
          </p>
        </motion.div>

        {/* Emotion Wheel - Central Focus */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <EmotionWheel onEmotionSelect={handleEmotionSelect} />
        </motion.div>

        {/* Simple explanation */}
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="text-blue-100 text-lg font-light leading-relaxed">
            Every star tells a story. Every dedication creates a lasting memory.
          </p>
          <p className="text-blue-200 text-base mt-4 font-light">
            Select an emotion above to begin your journey
          </p>
        </motion.div>

      </div>
    </div>
  );
}