import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EmotionWheel } from '../components/EmotionWheel';
import { Emotion } from '../types';

export function Home() {
  const navigate = useNavigate();

  const handleEmotionSelect = (emotion: Emotion) => {
    navigate(`/stars/${emotion.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter via-cosmic-deep-space to-cosmic-quantum-field relative overflow-hidden">
      
      {/* Gravitational lensing effect overlay */}
      <div className="absolute inset-0 bg-gravitational-lensing opacity-20 pointer-events-none" />
      
      {/* Main content with physics-based layout */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        
        {/* Header with cosmic typography */}
        <motion.div 
          className="text-center mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-light text-cosmic-observation mb-6 tracking-tight cosmic-float"
            style={{ fontVariationSettings: "'wght' 300" }}
          >
            StarMe
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-cosmic-light-echo font-light leading-relaxed mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Dedicate a star to someone special
          </motion.p>
          <motion.p 
            className="text-lg text-cosmic-stellar-wind font-light particle-drift"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Choose the emotion that connects you to the cosmos
          </motion.p>
        </motion.div>

        {/* Enhanced Emotion Wheel - Central Focus */}
        <motion.div
          className="mb-16 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "backOut" }}
        >
          {/* Quantum field effect around wheel */}
          <div className="absolute inset-0 rounded-full bg-quantum-field opacity-30 blur-3xl scale-150 animate-pulse" />
          
          <div className="relative z-10">
            <EmotionWheel onEmotionSelect={handleEmotionSelect} />
          </div>
        </motion.div>

        {/* Enhanced explanation with frosted glass */}
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="frosted-glass rounded-2xl p-8 cosmic-float-card">
            <motion.p 
              className="text-cosmic-light-echo text-lg font-light leading-relaxed mb-4"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              Every star tells a story. Every dedication creates a lasting memory.
            </motion.p>
            <motion.p 
              className="text-cosmic-stellar-wind text-base font-light quantum-fluctuation"
            >
              Select an emotion above to begin your cosmic journey
            </motion.p>
          </div>
        </motion.div>

        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cosmic-cherenkov-blue rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}