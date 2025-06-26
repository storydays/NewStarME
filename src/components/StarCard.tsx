import React from 'react';
import { motion } from 'framer-motion';
import { Star as StarIcon, MapPin } from 'lucide-react';
import { Star } from '../types';

interface StarCardProps {
  star: Star;
  onSelect: (star: Star) => void;
  index: number;
}

export function StarCard({ star, onSelect, index }: StarCardProps) {
  return (
    <motion.div
      className="frosted-glass-strong rounded-2xl p-8 cursor-pointer group hover:frosted-glass transition-all duration-500 border border-cosmic-particle-trace hover:border-cosmic-energy-flux cosmic-float-card will-change-transform"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.6,
        ease: "backOut"
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(star)}
    >
      {/* Enhanced star visualization with physics effects */}
      <div className="relative mb-6 h-24 flex items-center justify-center">
        {/* Gravitational field effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
          style={{ 
            background: `radial-gradient(circle, ${star.visual_data.color} 0%, transparent 70%)`,
            filter: 'blur(30px)'
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Cherenkov radiation glow */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"
          style={{ 
            backgroundColor: star.visual_data.color,
            filter: 'blur(20px)'
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Main star with enhanced effects */}
        <motion.div
          className="relative rounded-full flex items-center justify-center cherenkov-glow"
          style={{ 
            backgroundColor: star.visual_data.color,
            width: star.visual_data.size * 36,
            height: star.visual_data.size * 36,
            boxShadow: `0 0 ${star.visual_data.size * 25}px ${star.visual_data.color}60, 0 0 ${star.visual_data.size * 50}px ${star.visual_data.color}20`
          }}
          animate={{ 
            opacity: [
              star.visual_data.brightness, 
              star.visual_data.brightness * 1.3, 
              star.visual_data.brightness
            ],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: `0 0 ${star.visual_data.size * 35}px ${star.visual_data.color}80, 0 0 ${star.visual_data.size * 70}px ${star.visual_data.color}30`
          }}
        >
          <StarIcon className="w-5 h-5 text-cosmic-observation drop-shadow-lg" />
          
          {/* Particle emission effect */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: star.visual_data.color }}
              animate={{
                x: [0, (Math.random() - 0.5) * 40],
                y: [0, (Math.random() - 0.5) * 40],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.8,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Enhanced star information */}
      <div className="space-y-4">
        <motion.h3 
          className="text-xl font-light text-cosmic-observation group-hover:text-cosmic-light-echo transition-colors duration-300"
          whileHover={{ x: 2 }}
        >
          {star.scientific_name}
        </motion.h3>
        
        <motion.p 
          className="text-cosmic-light-echo text-sm leading-relaxed group-hover:text-cosmic-observation transition-colors duration-300 font-light"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          {star.poetic_description}
        </motion.p>
        
        <div className="flex items-center gap-2 text-cosmic-stellar-wind text-xs font-light">
          <MapPin className="w-3 h-3" />
          <span className="font-mono tracking-wide">{star.coordinates}</span>
        </div>
        
        <div className="pt-2">
          <motion.div
            className="text-cosmic-cherenkov-blue text-sm font-light opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2"
            initial={{ x: -10 }}
            whileHover={{ x: 0 }}
          >
            <span>Select this celestial beacon</span>
            <motion.div
              className="w-4 h-0.5 bg-cosmic-cherenkov-blue rounded-full"
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>

      {/* Quantum field lines on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        initial={false}
        whileHover={{ opacity: 0.3 }}
      >
        <svg className="w-full h-full">
          <defs>
            <linearGradient id={`fieldGradient-${star.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={star.visual_data.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={star.visual_data.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 Q50,25 100,0 Q150,25 200,0"
            fill="none"
            stroke={`url(#fieldGradient-${star.id})`}
            strokeWidth="1"
            className="animate-pulse"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}