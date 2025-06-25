import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Heart, Star as StarIcon } from 'lucide-react';
import { Star, Emotion } from '../types';

interface DedicationFormProps {
  star: Star;
  emotion: Emotion;
  onSubmit: (dedication: {
    star_id: string;
    custom_name: string;
    message: string;
    gift_tier: 'basic' | 'premium' | 'deluxe';
    email: string;
  }) => void;
  loading?: boolean;
}

const giftTiers = [
  {
    id: 'basic' as const,
    name: 'Celestial',
    price: 'Free',
    features: ['Digital Star Certificate', 'Shareable Link', 'Star Coordinates'],
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'premium' as const,  
    name: 'Stellar',
    price: '$19',
    features: ['Everything in Celestial', 'HD Star Photo', 'Constellation Map', 'Premium Certificate'],
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'deluxe' as const,
    name: 'Cosmic',
    price: '$49',
    features: ['Everything in Stellar', 'Physical Certificate', 'Star Registry Entry', 'Gift Box'],
    color: 'from-pink-500 to-red-600'
  }
];

export function DedicationForm({ star, emotion, onSubmit, loading = false }: DedicationFormProps) {
  const [formData, setFormData] = useState({
    custom_name: '',
    message: '',
    gift_tier: 'basic' as const,
    email: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.custom_name.trim()) {
      newErrors.custom_name = 'Please give your star a name';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please write a dedication message';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit({
      star_id: star.id,
      ...formData
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Star Preview */}
      <motion.div 
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: star.visual_data.color,
              boxShadow: `0 0 20px ${star.visual_data.color}40`
            }}
          >
            <StarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{star.scientific_name}</h2>
            <p className="text-gray-400 text-sm">Selected for {emotion.name}</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm">{star.poetic_description}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-white font-medium mb-2">
            Give Your Star a Name
          </label>
          <input
            type="text"
            value={formData.custom_name}
            onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
            placeholder="e.g., Sarah's Light, Forever Together, Hope's Beacon"
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {errors.custom_name && (
            <p className="text-red-400 text-sm mt-1">{errors.custom_name}</p>
          )}
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-white font-medium mb-2">
            Your Dedication Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Write a heartfelt message that will be forever associated with your star..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.message && (
              <p className="text-red-400 text-sm">{errors.message}</p>
            )}
            <p className="text-gray-400 text-sm ml-auto">
              {formData.message.length}/500
            </p>
          </div>
        </motion.div>

        {/* Gift Tiers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-white font-medium mb-4">
            Choose Your Experience
          </label>
          <div className="grid gap-4">
            {giftTiers.map((tier) => (
              <motion.div
                key={tier.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.gift_tier === tier.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData({ ...formData, gift_tier: tier.id })}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.gift_tier === tier.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }`} />
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  </div>
                  <span className="text-xl font-bold text-blue-400">{tier.price}</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-white font-medium mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full pl-11 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">
            We'll send your star certificate and sharing link here
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 group"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Your Star Dedication...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Dedicate Your Star
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}