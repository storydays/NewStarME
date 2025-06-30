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
          title: `${dedication?.custom_name} - StarMe Cosmic Dedication`,
          text: `Witness this beautiful cosmic dedication: ${dedication?.custom_name}`,
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
      <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter via-cosmic-deep-space to-cosmic-quantum-field relative">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="w-12 h-12 border-2 border-cosmic-cherenkov-blue border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-cosmic-observation text-lg font-light">Accessing cosmic dedication...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!dedication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter to-cosmic-quantum-field flex items-center justify-center relative">
        <div className="relative z-10 text-center">
          <motion.div
            className="frosted-glass-strong rounded-2xl p-12 max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-4xl font-light text-cosmic-observation mb-6">Celestial Beacon Not Found</h1>
            <p className="text-cosmic-stellar-wind text-lg mb-8 font-light">This cosmic dedication doesn't exist or has been absorbed into the void.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-cosmic-cherenkov-blue to-cosmic-plasma-glow hover:from-cosmic-plasma-glow hover:to-cosmic-stellar-wind text-cosmic-observation px-8 py-3 rounded-xl font-light transition-all cherenkov-glow"
            >
              Create Your Own Cosmic Dedication
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const emotionColor = dedication.emotion?.color || '#6366F1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-dark-matter via-cosmic-deep-space to-cosmic-quantum-field relative overflow-y-auto">
      {/* UPDATED: Changed container to allow scrolling and align content to top */}
      <div className="relative z-10 container mx-auto px-6 py-8 min-h-screen">
        {/* Enhanced Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8 frosted-glass-strong border"
            style={{ 
              borderColor: `${emotionColor}40`
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Sparkles className="w-6 h-6 cherenkov-glow" style={{ color: emotionColor }} />
            <span className="text-cosmic-observation font-light text-lg">
              {dedication.emotion?.name || 'Cosmic Dedication'}
            </span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-6xl font-light text-cosmic-observation mb-6 cosmic-float"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {dedication.custom_name}
          </motion.h1>
        </motion.div>

        {/* Enhanced Main Star Display */}
        <motion.div
          className="max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="frosted-glass-strong rounded-3xl p-12 border border-cosmic-particle-trace text-center cosmic-float-card">
            {/* Enhanced Star Visualization */}
            <div className="relative mb-12 h-40 flex items-center justify-center">
              {/* Gravitational field effect */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-20"
                style={{ 
                  background: `radial-gradient(circle, ${dedication.star.visual_data.color} 0%, transparent 70%)`,
                  filter: 'blur(60px)'
                }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              
              {/* Cherenkov radiation glow */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-30"
                style={{ 
                  backgroundColor: dedication.star.visual_data.color,
                  filter: 'blur(40px)'
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              {/* Main star with enhanced effects */}
              <motion.div
                className="relative rounded-full flex items-center justify-center shadow-2xl"
                style={{ 
                  backgroundColor: dedication.star.visual_data.color,
                  width: dedication.star.visual_data.size * 64,
                  height: dedication.star.visual_data.size * 64,
                  boxShadow: `0 0 ${dedication.star.visual_data.size * 40}px ${dedication.star.visual_data.color}80, 0 0 ${dedication.star.visual_data.size * 80}px ${dedication.star.visual_data.color}40`
                }}
                animate={{ 
                  opacity: [dedication.star.visual_data.brightness, dedication.star.visual_data.brightness * 1.4, dedication.star.visual_data.brightness],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <StarIcon className="w-12 h-12 text-cosmic-observation" />
                
                {/* Enhanced particle emission */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: dedication.star.visual_data.color }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 120],
                      y: [0, (Math.random() - 0.5) * 120],
                      opacity: [0, 1, 0],
                      scale: [0, 2, 0]
                    }}
                    transition={{
                      duration: 4,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Enhanced Star Information */}
            <div className="space-y-6 mb-12">
              <div>
                <h2 className="text-3xl font-light text-cosmic-observation mb-3">
                  {dedication.star.scientific_name}
                </h2>
                <p className="text-cosmic-light-echo text-lg italic font-light">
                  {dedication.star.poetic_description}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 text-cosmic-stellar-wind font-light">
                <MapPin className="w-4 h-4" />
                <span className="font-mono text-sm tracking-wide">{dedication.star.coordinates}</span>
              </div>
            </div>

            {/* Enhanced Dedication Message */}
            <motion.div
              className="frosted-glass rounded-2xl p-8 mb-8 border border-cosmic-particle-trace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-red-400 cherenkov-glow" />
                <span className="text-cosmic-stellar-wind font-light">Cosmic Dedication Message</span>
              </div>
              <p className="text-cosmic-observation text-lg leading-relaxed font-light">
                "{dedication.message}"
              </p>
            </motion.div>

            {/* Enhanced Metadata */}
            <div className="flex items-center justify-center gap-6 text-cosmic-stellar-wind text-sm mb-8 font-light">
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

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={handleShare}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-cosmic-cherenkov-blue to-cosmic-plasma-glow hover:from-cosmic-plasma-glow hover:to-cosmic-stellar-wind text-cosmic-observation px-8 py-3 rounded-xl font-light transition-all cherenkov-glow"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
                Share This Cosmic Beacon
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-3 frosted-glass hover:frosted-glass-strong text-cosmic-observation px-8 py-3 rounded-xl font-light transition-all border border-cosmic-particle-trace"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                Create Your Own
              </motion.button>
            </div>

            {/* Enhanced share confirmation */}
            {showShareConfirm && (
              <motion.div
                className="mt-4 frosted-glass border border-green-400/30 rounded-lg p-3 text-green-300 text-sm font-light"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                Cosmic coordinates copied to clipboard!
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Call to Action */}
        <motion.div
          className="text-center pb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="frosted-glass-strong rounded-2xl p-8 max-w-2xl mx-auto border border-cosmic-particle-trace cosmic-float-card">
            <h3 className="text-2xl font-light text-cosmic-observation mb-4">
              Create Your Own Cosmic Dedication
            </h3>
            <p className="text-cosmic-light-echo mb-6 font-light leading-relaxed">
              Connect your emotions to the infinite cosmos with a personalized star dedication that resonates through eternity.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-cosmic-cherenkov-blue to-cosmic-plasma-glow hover:from-cosmic-plasma-glow hover:to-cosmic-stellar-wind text-cosmic-observation px-8 py-3 rounded-xl font-light transition-all flex items-center gap-2 mx-auto cherenkov-glow"
            >
              <ExternalLink className="w-5 h-5" />
              Begin Your Cosmic Journey
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}