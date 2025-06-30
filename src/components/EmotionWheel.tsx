import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Home, Trophy, Candy as Candle, Leaf, Compass, Palette, Sparkles } from 'lucide-react';
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
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  
  const radius = 140;
  const centerX = 200;
  const centerY = 200;

  const handleEmotionClick = (emotion: Emotion) => {
    setSelectedEmotion(emotion.id);
    
    // Trigger supernova burst effect
    setTimeout(() => {
      onEmotionSelect(emotion);
    }, 400);
  };

  return (
    <div className="relative w-[400px] h-[400px] mx-auto">
      
      {/* Gravitational field lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <radialGradient id="fieldGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[...Array(5)].map((_, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={60 + i * 30}
            fill="none"
            stroke="url(#fieldGradient)"
            strokeWidth="1"
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </svg>

      {/* Central hub with enhanced cosmic design */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full frosted-glass-strong flex items-center justify-center orbital-slow"
        whileHover={{ scale: 1.05 }}
        animate={selectedEmotion ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.8, ease: "backOut" }}
      >
        <div className="text-center relative">
          {/* Rotating star icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-cosmic-cherenkov-blue mx-auto mb-1" />
          </motion.div>
          {/* Static text */}
          <div className="text-cosmic-observation text-xs font-light">Eternal</div>
          <div className="text-cosmic-observation text-xs font-light">Memories</div>
        </div>
        
        {/* Particle effects around center */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cosmic-plasma-glow rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: `0 ${30 + i * 5}px`,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </motion.div>

      {/* Enhanced emotion segments with visible labels */}
      <AnimatePresence>
        {emotions.map((emotion, index) => {
          const angle = (index * 360) / emotions.length;
          const radians = (angle * Math.PI) / 180;
          const x = centerX + Math.cos(radians) * radius;
          const y = centerY + Math.sin(radians) * radius;
          
          const IconComponent = iconMap[emotion.icon as keyof typeof iconMap];
          const isHovered = hoveredEmotion === emotion.id;
          const isSelected = selectedEmotion === emotion.id;

          return (
            <motion.div
              key={emotion.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group will-change-transform"
              style={{ left: x, top: y }}
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
                y: isSelected ? -10 : 0
              }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.8, 
                ease: "backOut",
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.02,
                y: -2,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmotionClick(emotion)}
              onMouseEnter={() => setHoveredEmotion(emotion.id)}
              onMouseLeave={() => setHoveredEmotion(null)}
            >
              {/* Orbital motion container */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 30 + index * 5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {/* Gravitational lensing glow effect */}
                <motion.div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-xl"
                  style={{ 
                    backgroundColor: emotion.color,
                    transform: 'scale(2)',
                  }}
                  animate={isHovered ? {
                    scale: [2, 2.2, 2],
                    opacity: [0.4, 0.6, 0.4]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Cherenkov radiation trail */}
                {isHovered && (
                  <motion.div
                    className="absolute top-1/2 left-full w-8 h-0.5 -translate-y-1/2 cherenkov-trail"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 0.8 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                
                {/* Main emotion circle */}
                <motion.div
                  className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 frosted-glass border-2"
                  style={{
                    borderColor: emotion.color,
                    boxShadow: isHovered 
                      ? `0 0 30px ${emotion.color}60, 0 0 60px ${emotion.color}30`
                      : `0 0 15px ${emotion.color}30`
                  }}
                  animate={isSelected ? {
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360],
                  } : isHovered ? {
                    backgroundColor: `${emotion.color}20`,
                  } : {}}
                  transition={{ 
                    duration: isSelected ? 0.8 : 0.3,
                    ease: isSelected ? "backOut" : "easeOut"
                  }}
                >
                  <IconComponent 
                    className="w-6 h-6 text-cosmic-observation drop-shadow-lg transition-all duration-300 mb-1" 
                    style={{ 
                      color: isHovered ? emotion.color : '#F8FAFC',
                      filter: isHovered ? `drop-shadow(0 0 8px ${emotion.color})` : 'none'
                    }}
                  />
                  
                  {/* Emotion name label */}
                  <div 
                    className="text-xs font-light text-cosmic-observation text-center leading-tight"
                    style={{ 
                      color: isHovered ? emotion.color : '#F8FAFC',
                      textShadow: '0 0 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    {emotion.name}
                  </div>
                  
                  {/* Quantum fluctuation particles */}
                  {isHovered && [...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full"
                      style={{ backgroundColor: emotion.color }}
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        opacity: 0,
                        scale: 0
                      }}
                      animate={{
                        x: (Math.random() - 0.5) * 30,
                        y: (Math.random() - 0.5) * 30,
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Supernova burst effect for selection */}
      {selectedEmotion && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-cosmic-cherenkov-blue"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
    </div>
  );
}