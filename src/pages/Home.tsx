import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EmotionWheel } from '../components/EmotionWheel';
import { StarField, AnimatedStar, GravitationalWaves } from '../components/StarField';
import { Emotion } from '../types';

export function Home() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cosmicParticles, setCosmicParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    type: 'quantum' | 'particle' | 'field' | 'cosmic-ray';
    delay: number;
  }>>([]);

  // Generate cosmic particles for enhanced visual effects
  useEffect(() => {
    const particles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      type: ['quantum', 'particle', 'field', 'cosmic-ray'][Math.floor(Math.random() * 4)] as any,
      delay: Math.random() * 3
    }));
    setCosmicParticles(particles);
  }, []);

  // Track mouse for gravitational effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEmotionSelect = (emotion: Emotion) => {
    navigate(`/stars/${emotion.id}`);
  };

  return (
    <div className="cosmic-viewport dark-energy-bg relative overflow-hidden">
      {/* Enhanced StarField with gravitational lensing */}
      <StarField density={200} color="#2563EB" />
      
      {/* Gravitational waves emanating from mouse position */}
      <GravitationalWaves 
        centerX={mousePosition.x} 
        centerY={mousePosition.y} 
        intensity={0.3} 
      />
      
      {/* Cosmic particle effects */}
      {cosmicParticles.map(particle => (
        <AnimatedStar
          key={particle.id}
          x={particle.x}
          y={particle.y}
          size={Math.random() * 6 + 2}
          color="#3B82F6"
          delay={particle.delay}
          type={particle.type}
        />
      ))}
      
      {/* Main content container */}
      <div className="relative z-20 cosmic-container">
        {/* Hero Section with Research Aesthetics */}
        <motion.div 
          className="text-center pt-stellar pb-galactic px-planetary"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Main Title with Gravitational Typography */}
          <motion.h1 
            className="text-cosmic-6xl md:text-8xl font-black mb-galactic"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 25%, #60A5FA 50%, #93C5FD 75%, #DBEAFE 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontVariationSettings: '"wght" 900, "slnt" 0'
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: "backOut" }}
          >
            COSMIC DEDICATION
          </motion.h1>
          
          {/* Subtitle with Dark Energy Research Terminology */}
          <motion.div
            className="mb-stellar max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <p className="text-cosmic-2xl md:text-cosmic-3xl text-cosmic-stellar-wind mb-molecular leading-relaxed font-light">
              Eternalize memories through quantum-entangled stellar dedications
            </p>
            <p className="text-cosmic-lg text-cosmic-cosmic-ray leading-relaxed">
              Connect consciousness to cosmic phenomena via dark energy field interactions
            </p>
          </motion.div>
          
          {/* Research Metrics Display */}
          <motion.div
            className="flex items-center justify-center gap-stellar text-cosmic-cosmic-ray text-cosmic-sm mb-stellar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="flex items-center gap-molecular quantum-field px-planetary py-molecular rounded-full">
              <div className="w-molecular h-molecular bg-cosmic-cherenkov-blue rounded-full animate-cherenkov-pulse" />
              <span className="font-mono">Observable Universe: 13.8B years</span>
            </div>
            <div className="flex items-center gap-molecular quantum-field px-planetary py-molecular rounded-full">
              <div className="w-molecular h-molecular bg-cosmic-plasma-glow rounded-full animate-quantum-fluctuation" />
              <span className="font-mono">Dark Energy: 68.3%</span>
            </div>
            <div className="flex items-center gap-molecular quantum-field px-planetary py-molecular rounded-full">
              <div className="w-molecular h-molecular bg-cosmic-stellar-wind rounded-full animate-particle-drift" />
              <span className="font-mono">Stellar Density: 10²³ objects</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Emotion Selection Interface */}
        <motion.div
          className="text-center mb-stellar"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {/* Section Header with Scientific Terminology */}
          <div className="mb-stellar">
            <h2 className="text-cosmic-4xl md:text-cosmic-5xl font-bold text-cosmic-observation mb-molecular">
              QUANTUM EMOTIONAL RESONANCE
            </h2>
            <p className="text-cosmic-stellar-wind text-cosmic-lg mb-planetary max-w-3xl mx-auto leading-relaxed">
              Select the quantum state that best represents your dedication's emotional frequency
            </p>
            
            {/* Instruction with Research Aesthetic */}
            <div className="quantum-field px-stellar py-planetary rounded-2xl max-w-2xl mx-auto">
              <p className="text-cosmic-cosmic-ray text-cosmic-base">
                <span className="text-cosmic-cherenkov-blue font-medium">PROTOCOL:</span> 
                {' '}Initiate emotional-stellar entanglement by selecting your resonant frequency below
              </p>
            </div>
          </div>
          
          {/* Enhanced Emotion Wheel */}
          <EmotionWheel onEmotionSelect={handleEmotionSelect} />
        </motion.div>

        {/* Research Features Grid */}
        <motion.div 
          className="cosmic-grid max-w-7xl mx-auto px-planetary pb-stellar"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          {[
            {
              title: 'Verified Stellar Objects',
              description: 'Each celestial body verified through astronomical databases with precise coordinate mapping and spectral analysis.',
              icon: '⭐',
              metric: '40 catalogued objects',
              color: '#2563EB'
            },
            {
              title: 'Quantum Entanglement Protocol',
              description: 'Emotional states mapped to stellar characteristics via quantum field theory and consciousness-matter interaction models.',
              icon: '🔬',
              metric: '8 resonance frequencies',
              color: '#3B82F6'
            },
            {
              title: 'Permanent Field Storage',
              description: 'Dedications stored in distributed quantum-resistant systems ensuring persistence beyond cosmic timescales.',
              icon: '♾️',
              metric: 'Infinite preservation',
              color: '#60A5FA'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="cosmic-float-card p-stellar text-center cherenkov-interaction"
              whileHover={{ 
                scale: 1.02, 
                y: -8,
                boxShadow: `0 0 50px ${feature.color}40, inset 0 0 30px ${feature.color}10`
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Feature Icon with Particle Effects */}
              <div className="text-6xl mb-planetary relative">
                <span className="relative z-10">{feature.icon}</span>
                <motion.div
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{ backgroundColor: feature.color }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 3,
                    delay: index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              {/* Feature Content */}
              <h3 className="text-cosmic-2xl font-bold text-cosmic-observation mb-molecular">
                {feature.title}
              </h3>
              <p className="text-cosmic-cosmic-ray leading-relaxed mb-planetary text-cosmic-base">
                {feature.description}
              </p>
              
              {/* Metric Display */}
              <div 
                className="quantum-field px-planetary py-molecular rounded-full text-cosmic-sm font-mono"
                style={{ borderColor: `${feature.color}40` }}
              >
                <span style={{ color: feature.color }}>●</span>
                {' '}{feature.metric}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}