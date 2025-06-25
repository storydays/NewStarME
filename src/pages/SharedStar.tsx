import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star as StarIcon, 
  Heart, 
  MapPin, 
  Calendar, 
  Share2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { StarField } from '../components/StarField';
import { useDedications } from '../hooks/useDedications';
import { DedicationWithStar } from '../types';

export function SharedStar() {
  const { dedicationId } = useParams<{ dedicationId: string }>();
  const navigate = useNavigate();
  const { getDedication, loading } = useDedications();
  const [dedication, setDedication] = useState<DedicationWithStar | null>(null);
  const [showShareConfirm, setShowShareConfirm] = useState(false);

  useEffect(() => {
    async function fetchDedication() {
      if (!dedicationId) return;
      
      const result = await getDedication(dedicationId);
      setDedication(result);
    }

    fetchDedication();
  }, [dedicationId, getDedication]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${dedication?.custom_name} - StarMe Dedication`,
          text: `See this beautiful star dedication: ${dedication?.custom_name}`,
          url: url
        });
      } catch (error) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowShareConfirm(true);
      setTimeout(() => setShowShareConfirm(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
        <StarField density={100} className="opacity-30" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-light">Loading dedication...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!dedication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center relative">
        <StarField density={80} className="opacity-30" />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-4xl font-light text-white mb-6">Star Not Found</h1>
            <p className="text-blue-200 text-lg mb-8 font-light">This dedication doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-light transition-all"
            >
              Create Your Own Star
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const emotionColor = dedication.emotion?.color || '#6366F1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <StarField density={120} color={emotionColor} className="opacity-30" />

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8 backdrop-blur-sm border"
            style={{ 
              backgroundColor: `${emotionColor}15`,
              borderColor: `${emotionColor}40`
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Sparkles className="w-6 h-6" style={{ color: emotionColor }} />
            <span className="text-white font-light text-lg">
              {dedication.emotion?.name || 'Star Dedication'}
            </span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-6xl font-light text-white mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {dedication.custom_name}
          </motion.h1>
        </motion.div>

        {/* Main Star Display */}
        <motion.div
          className="max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10 text-center">
            {/* Star Visualization */}
            <div className="relative mb-12 h-32 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full opacity-20"
                style={{ 
                  backgroundColor: dedication.star.visual_data.color,
                  filter: 'blur(40px)'
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <motion.div
                className="relative rounded-full flex items-center justify-center shadow-2xl"
                style={{ 
                  backgroundColor: dedication.star.visual_data.color,
                  width: dedication.star.visual_data.size * 48,
                  height: dedication.star.visual_data.size * 48,
                  boxShadow: `0 0 ${dedication.star.visual_data.size * 30}px ${dedication.star.visual_data.color}60`
                }}
                animate={{ 
                  opacity: [dedication.star.visual_data.brightness, dedication.star.visual_data.brightness * 1.3, dedication.star.visual_data.brightness]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity 
                }}
              >
                <StarIcon className="w-8 h-8 text-white/90" />
              </motion.div>
            </div>

            {/* Star Information */}
            <div className="space-y-6 mb-12">
              <div>
                <h2 className="text-3xl font-light text-white mb-3">
                  {dedication.star.scientific_name}
                </h2>
                <p className="text-blue-100 text-lg italic font-light">
                  {dedication.star.poetic_description}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 text-blue-200 font-light">
                <MapPin className="w-4 h-4" />
                <span className="font-mono text-sm">{dedication.star.coordinates}</span>
              </div>
            </div>

            {/* Dedication Message */}
            <motion.div
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-blue-200 font-light">Dedication Message</span>
              </div>
              <p className="text-white text-lg leading-relaxed font-light">
                "{dedication.message}"
              </p>
            </motion.div>

            {/* Metadata */}
            <div className="flex items-center justify-center gap-6 text-blue-300 text-sm mb-8 font-light">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Dedicated {new Date(dedication.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={handleShare}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-light transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
                Share This Star
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-light transition-all border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                Create Your Own
              </motion.button>
            </div>

            {/* Share confirmation */}
            {showShareConfirm && (
              <motion.div
                className="mt-4 bg-green-500/20 border border-green-400/30 rounded-lg p-3 text-green-300 text-sm font-light"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                Link copied to clipboard!
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/10">
            <h3 className="text-2xl font-light text-white mb-4">
              Create Your Own Star Dedication
            </h3>
            <p className="text-blue-100 mb-6 font-light leading-relaxed">
              Connect your emotions to the cosmos with a personalized star dedication that lasts forever.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-light transition-all flex items-center gap-2 mx-auto"
            >
              <ExternalLink className="w-5 h-5" />
              Start Your Journey
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}