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
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 cursor-pointer group hover:bg-gradient-to-br hover:from-gray-700/60 hover:to-gray-800/60 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/70"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(star)}
    >
      {/* Star visualization */}
      <div className="relative mb-4 h-24 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
          style={{ 
            backgroundColor: star.visual_data.color,
            filter: 'blur(20px)'
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <motion.div
          className="relative rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: star.visual_data.color,
            width: star.visual_data.size * 32,
            height: star.visual_data.size * 32,
            boxShadow: `0 0 ${star.visual_data.size * 20}px ${star.visual_data.color}40`
          }}
          animate={{ 
            opacity: [star.visual_data.brightness, star.visual_data.brightness * 1.2, star.visual_data.brightness],
            rotate: [0, 360]
          }}
          transition={{ 
            opacity: { duration: 2, repeat: Infinity },
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' }
          }}
        >
          <StarIcon className="w-4 h-4 text-white/80" />
        </motion.div>

        {/* Sparkle effects */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${20 + i * 20}%`,
              left: `${30 + i * 15}%`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.5,
              repeat: Infinity
            }}
          />
        ))}
      </div>

      {/* Star information */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
          {star.scientific_name}
        </h3>
        
        <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors">
          {star.poetic_description}
        </p>
        
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <MapPin className="w-3 h-3" />
          <span className="font-mono">{star.coordinates}</span>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: star.visual_data.color }} />
            <span className="text-xs text-gray-400">
              Magnitude: {star.visual_data.brightness.toFixed(1)}
            </span>
          </div>
          
          <motion.div
            className="text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: -10 }}
            whileHover={{ x: 0 }}
          >
            Select Star →
          </motion.div>
        </div>
      </div>

      {/* Selection indicator */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
      </div>
    </motion.div>
  );
}