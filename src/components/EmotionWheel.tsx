import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Home, Trophy, Candle, Leaf, Compass, Palette, Sparkles } from 'lucide-react';
import { emotions } from '../data/emotions';
import { Emotion } from '../types';

const iconMap = {
  heart: Heart,
  users: Users,
  home: Home,
  trophy: Trophy,
  candle: Candle,
  leaf: Leaf,
  compass: Compass,
  palette: Palette
};

interface EmotionWheelProps {
  onEmotionSelect: (emotion: Emotion) => void;
}

export function EmotionWheel({ onEmotionSelect }: EmotionWheelProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isSupernova, setIsSupernova] = useState(false);
  
  // Reduced size for single-viewport containment (80vh max)
  const radius = 120; // Reduced from 140
  const centerX = 180;  // Reduced from 200
  const centerY = 180;  // Reduced from 200

  const handleEmotionClick = (emotion: Emotion) => {
    setSelectedEmotion(emotion.id);
    setIsSupernova(true);
    
    // Supernova effect duration
    setTimeout(() => {
      onEmotionSelect(emotion);
    }, 800);
  };

  return (
    <div className="relative w-[360px] h-[360px] mx-auto max-h-[80vh] cosmic-container">
      {/* Dark matter background field */}
      <div className="absolute inset-0 dark-energy-bg rounded-full opacity-20" />
      
      {/* Gravitational lensing effects */}
      <div className="absolute inset-2 gravitational-lens rounded-full" />
      
      {/* Quantum field fluctuations */}
      <motion.div 
        className="absolute inset-6 rounded-full bg-gradient-to-r from-cosmic-quantum-field/10 to-cosmic-particle-trace/10"
        animate={{ 
          scale: [1, 1.02, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Central hub with research-inspired design */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full gravitational-center quantum-field"
        animate={{ 
          rotate: isSupernova ? [0, 360] : 360,
          scale: isSupernova ? [1, 1.5, 1] : 1
        }}
        transition={{ 
          rotate: { duration: isSupernova ? 0.8 : 30, repeat: isSupernova ? 1 : Infinity, ease: "linear" },
          scale: { duration: 0.8, ease: "easeOut" }
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-cosmic-energy-flux to-cosmic-cherenkov-blue flex items-center justify-center relative overflow-hidden">
          {/* Particle collision effect */}
          <div className="absolute inset-0 bg-gradient-conic from-cosmic-void via-cosmic-cherenkov-blue to-cosmic-void opacity-30 animate-orbital-fast" />
          
          {/* Central text */}
          <div className="relative z-10 text-center">
            <Sparkles className="w-6 h-6 text-cosmic-observation mx-auto mb-1 animate-quantum-fluctuation" />
            <span className="text-cosmic-xs font-medium text-cosmic-observation tracking-wider">
              ETERNALIZE
            </span>
          </div>
        </div>
      </motion.div>

      {/* Emotion orbital segments */}
      <AnimatePresence>
        {emotions.map((emotion, index) => {
          const angle = (index * 360) / emotions.length;
          const radians = (angle * Math.PI) / 180;
          const x = centerX + Math.cos(radians) * radius;
          const y = centerY + Math.sin(radians) * radius;
          
          const IconComponent = iconMap[emotion.icon as keyof typeof iconMap];
          const isSelected = selectedEmotion === emotion.id;

          return (
            <motion.div
              key={emotion.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group cosmic-cursor"
              style={{ left: x, top: y }}
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ 
                scale: isSelected ? [1, 1.5, 1] : 1, 
                opacity: 1, 
                rotate: 0,
                y: isSelected ? [0, -10, 0] : 0
              }}
              transition={{ 
                initial: { delay: index * 0.1, duration: 0.8, ease: "backOut" },
                scale: { duration: 0.6, ease: "easeOut" },
                y: { duration: 0.6, ease: "easeOut" }
              }}
              whileHover={{ 
                scale: 1.15,
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmotionClick(emotion)}
            >
              {/* Dark matter halo effect */}
              <motion.div 
                className="absolute inset-0 rounded-full opacity-20 animate-gravitational-wave"
                style={{ 
                  backgroundColor: emotion.color,
                  transform: 'scale(2)',
                  filter: 'blur(15px)'
                }}
                animate={{
                  scale: [2, 2.5, 2],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 3,
                  delay: index * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Cherenkov radiation ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-60"
                style={{ 
                  borderColor: emotion.color,
                  transform: 'scale(1.5)'
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1.5, 1.8, 1.5]
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />
              
              {/* Main emotion orb with particle physics styling */}
              <motion.div
                className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 cosmic-float-card cherenkov-interaction"
                style={{
                  backgroundColor: emotion.color,
                  boxShadow: `0 0 30px ${emotion.color}60, inset 0 0 20px ${emotion.color}20`
                }}
                animate={isSelected ? {
                  boxShadow: [
                    `0 0 30px ${emotion.color}60`,
                    `0 0 100px ${emotion.color}80, 0 0 200px ${emotion.color}40`,
                    `0 0 30px ${emotion.color}60`
                  ]
                } : {}}
                transition={{ duration: 0.8 }}
              >
                <IconComponent className="w-6 h-6 text-cosmic-observation drop-shadow-lg relative z-10" />
                
                {/* Quantum fluctuation particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cosmic-observation rounded-full"
                    style={{
                      top: `${20 + i * 20}%`,
                      left: `${25 + i * 15}%`
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: [0, Math.cos(i * 60) * 10, 0],
                      y: [0, Math.sin(i * 60) * 10, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3 + index * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>

              {/* Research-inspired tooltip */}
              <motion.div 
                className="absolute bottom-full mb-6 left-1/2 transform -translate-x-1/2 quantum-field text-cosmic-observation p-3 rounded-lg text-cosmic-sm max-w-48 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                initial={{ y: 10, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
              >
                <div className="font-medium text-cosmic-base mb-1" style={{ color: emotion.color }}>
                  {emotion.name.toUpperCase()}
                </div>
                <div className="text-cosmic-xs text-cosmic-cosmic-ray leading-relaxed">
                  {emotion.description}
                </div>
                
                {/* Tooltip arrow with field effect */}
                <div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent"
                  style={{ borderTopColor: 'rgba(26, 26, 46, 0.8)' }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Gravitational field lines connecting to center */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        <defs>
          <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {emotions.map((_, index) => {
          const angle = (index * 360) / emotions.length;
          const radians = (angle * Math.PI) / 180;
          const x = centerX + Math.cos(radians) * radius;
          const y = centerY + Math.sin(radians) * radius;
          
          return (
            <motion.line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="url(#fieldGradient)"
              strokeWidth="1"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 1.5,
                ease: "easeOut"
              }}
            />
          );
        })}
      </svg>

      {/* Supernova burst effect */}
      <AnimatePresence>
        {isSupernova && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 3, 5], 
              opacity: [0, 0.8, 0] 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="w-full h-full rounded-full bg-gradient-radial from-cosmic-cherenkov-blue via-cosmic-plasma-glow to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}