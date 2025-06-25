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
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 cursor-pointer group hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(star)}
    >
      {/* Star visualization */}
      <div className="relative mb-6 h-20 flex items-center justify-center">
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
            opacity: [star.visual_data.brightness, star.visual_data.brightness * 1.2, star.visual_data.brightness]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity 
          }}
        >
          <StarIcon className="w-4 h-4 text-white/90" />
        </motion.div>
      </div>

      {/* Star information */}
      <div className="space-y-4">
        <h3 className="text-xl font-light text-white group-hover:text-blue-100 transition-colors">
          {star.scientific_name}
        </h3>
        
        <p className="text-blue-100 text-sm leading-relaxed group-hover:text-white transition-colors font-light">
          {star.poetic_description}
        </p>
        
        <div className="flex items-center gap-2 text-blue-200 text-xs font-light">
          <MapPin className="w-3 h-3" />
          <span className="font-mono">{star.coordinates}</span>
        </div>
        
        <div className="pt-2">
          <motion.div
            className="text-blue-300 text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: -10 }}
            whileHover={{ x: 0 }}
          >
            Select this star →
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}