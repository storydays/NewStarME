import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Home, Trophy, Candy as Candle, Leaf, Compass, Palette } from 'lucide-react';
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
  const radius = 140;
  const centerX = 200;
  const centerY = 200;

  return (
    <div className="relative w-[400px] h-[400px] mx-auto">
      {/* Outer glow ring */}
      <div className="absolute inset-4 rounded-full bg-gradient-radial from-blue-500/10 to-transparent animate-pulse" />
      
      {/* Center hub */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
      </motion.div>

      {/* Emotion segments */}
      {emotions.map((emotion, index) => {
        const angle = (index * 360) / emotions.length;
        const radians = (angle * Math.PI) / 180;
        const x = centerX + Math.cos(radians) * radius;
        const y = centerY + Math.sin(radians) * radius;
        
        const IconComponent = iconMap[emotion.icon as keyof typeof iconMap];

        return (
          <motion.div
            key={emotion.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: x, top: y }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEmotionSelect(emotion)}
          >
            {/* Halo effect */}
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ 
                backgroundColor: emotion.color,
                transform: 'scale(1.5)',
                animationDuration: '3s'
              }}
            />
            
            {/* Main emotion circle */}
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl group-hover:shadow-2xl"
              style={{
                backgroundColor: emotion.color,
                boxShadow: `0 0 30px ${emotion.color}60`
              }}
            >
              <IconComponent className="w-8 h-8 text-white drop-shadow-lg" />
              
              {/* Sparkle effects */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-80 animate-bounce" style={{ animationDelay: `${index * 0.2}s` }} />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full opacity-60 animate-bounce" style={{ animationDelay: `${index * 0.2 + 0.5}s` }} />
            </div>

            {/* Emotion label */}
            <motion.div
              className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 text-center"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <div className="bg-gray-900/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                {emotion.name}
              </div>
            </motion.div>

            {/* Tooltip */}
            <motion.div 
              className="absolute bottom-full mb-6 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg text-sm max-w-48 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              initial={{ y: 10 }}
              whileHover={{ y: 0 }}
            >
              {emotion.description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
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
              stroke="url(#gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: index * 0.1, duration: 1 }}
            />
          );
        })}
        <defs>
          <linearGradient id="gradient">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}