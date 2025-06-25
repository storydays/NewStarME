import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { StarCard } from '../components/StarCard';
import { StarField } from '../components/StarField';
import { useStars } from '../hooks/useStars';
import { emotions } from '../data/emotions';
import { Star } from '../types';

export function StarSelection() {
  const { emotionId } = useParams<{ emotionId: string }>();
  const navigate = useNavigate();
  const { stars, loading, error } = useStars(emotionId);
  
  const emotion = emotions.find(e => e.id === emotionId);

  if (!emotion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <p className="text-white text-xl">Emotion not found</p>
      </div>
    );
  }

  const handleStarSelect = (star: Star) => {
    navigate(`/dedicate/${star.id}?emotion=${emotionId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
        <StarField density={100} />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">Finding stars that match your {emotion.name.toLowerCase()}...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Error loading stars</p>
          <button 
            onClick={handleBack}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to emotions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
      <StarField density={120} color={emotion.color} />
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to emotions
          </button>
          
          <div className="text-center">
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6"
              style={{ 
                backgroundColor: `${emotion.color}20`,
                border: `2px solid ${emotion.color}40`
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: emotion.color }} />
              <span className="text-white font-medium text-lg">{emotion.name}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Choose Your Star
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-2">
              {emotion.description}
            </p>
            
            <p className="text-gray-400">
              Select from {stars.length} carefully curated stars that embody {emotion.name.toLowerCase()}
            </p>
          </div>
        </motion.div>

        {/* Stars Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {stars.map((star, index) => (
            <StarCard
              key={star.id}
              star={star}
              onSelect={handleStarSelect}
              index={index}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {stars.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-400 text-xl">No stars found for {emotion.name}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}