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
  
  const radius = 140;
  const centerX = 200;
  const centerY = 200;

  const handleEmotionClick = (emotion: Emotion) => {
    onEmotionSelect(emotion);
  };

  return (
    <div className="relative w-[400px] h-[400px] mx-auto">
      
      {/* Central hub */}
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
      >
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-white mx-auto mb-1" />
          <span className="text-white text-xs font-light">Choose</span>
        </div>
      </motion.div>

      {/* Emotion segments */}
      <AnimatePresence>
        {emotions.map((emotion, index) => {
          const angle = (index * 360) / emotions.length;
          const radians = (angle * Math.PI) / 180;
          const x = centerX + Math.cos(radians) * radius;
          const y = centerY + Math.sin(radians) * radius;
          
          const IconComponent = iconMap[emotion.icon as keyof typeof iconMap];
          const isHovered = hoveredEmotion === emotion.id;

          return (
            <motion.div
              key={emotion.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: x, top: y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "backOut" }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmotionClick(emotion)}
              onMouseEnter={() => setHoveredEmotion(emotion.id)}
              onMouseLeave={() => setHoveredEmotion(null)}
            >
              {/* Glow effect */}
              <motion.div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                style={{ 
                  backgroundColor: emotion.color,
                  transform: 'scale(2)',
                  filter: 'blur(20px)'
                }}
              />
              
              {/* Main emotion circle */}
              <motion.div
                className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/20"
                style={{
                  backgroundColor: `${emotion.color}20`,
                  borderColor: emotion.color
                }}
                whileHover={{
                  backgroundColor: `${emotion.color}30`,
                  boxShadow: `0 0 30px ${emotion.color}40`
                }}
              >
                <IconComponent 
                  className="w-8 h-8 text-white drop-shadow-lg" 
                  style={{ color: emotion.color }}
                />
              </motion.div>

              {/* Emotion label */}
              <motion.div 
                className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                initial={{ y: 10, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
              >
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                  <div className="font-medium text-white text-sm mb-1">
                    {emotion.name}
                  </div>
                  <div className="text-white/70 text-xs max-w-32 leading-relaxed">
                    {emotion.description.split(' ').slice(0, 6).join(' ')}...
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}