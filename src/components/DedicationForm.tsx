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
    name: 'Digital',
    price: 'Free',
    features: ['Digital Certificate', 'Shareable Link', 'Star Coordinates'],
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'premium' as const,  
    name: 'Premium',
    price: '$19',
    features: ['Everything in Digital', 'HD Star Photo', 'Constellation Map', 'Premium Certificate'],
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'deluxe' as const,
    name: 'Deluxe',
    price: '$49',
    features: ['Everything in Premium', 'Physical Certificate', 'Star Registry Entry', 'Gift Box'],
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
      newErrors.custom_name = 'Please name your star';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please write your message';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
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
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: star.visual_data.color,
              boxShadow: `0 0 30px ${star.visual_data.color}40`
            }}
          >
            <StarIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-light text-white">{star.scientific_name}</h2>
            <p className="text-blue-200 text-sm font-light">Selected for {emotion.name}</p>
          </div>
        </div>
        <p className="text-blue-100 font-light leading-relaxed">{star.poetic_description}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Star Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-white font-light mb-3 text-lg">
            Name Your Star
          </label>
          <input
            type="text"
            value={formData.custom_name}
            onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
            placeholder="Sarah's Light, Forever Together, Hope's Beacon..."
            className="w-full px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all font-light"
          />
          {errors.custom_name && (
            <p className="text-red-400 text-sm mt-2 font-light">{errors.custom_name}</p>
          )}
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-white font-light mb-3 text-lg">
            Your Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Write a heartfelt message that will be forever connected to your star..."
            rows={4}
            className="w-full px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none font-light"
          />
          <div className="flex justify-between items-center mt-2">
            {errors.message && (
              <p className="text-red-400 text-sm font-light">{errors.message}</p>
            )}
            <p className="text-blue-300 text-sm ml-auto font-light">
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
          <label className="block text-white font-light mb-6 text-lg">
            Choose Your Package
          </label>
          <div className="grid gap-4">
            {giftTiers.map((tier) => (
              <motion.div
                key={tier.id}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.gift_tier === tier.id
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-white/20 bg-white/5 hover:border-white/30'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setFormData({ ...formData, gift_tier: tier.id })}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      formData.gift_tier === tier.id
                        ? 'border-blue-400 bg-blue-400'
                        : 'border-white/40'
                    }`} />
                    <h3 className="text-lg font-light text-white">{tier.name}</h3>
                  </div>
                  <span className="text-xl font-light text-blue-300">{tier.price}</span>
                </div>
                <ul className="text-sm text-blue-100 space-y-2 font-light">
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
          <label className="block text-white font-light mb-3 text-lg">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full pl-12 pr-6 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all font-light"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm mt-2 font-light">{errors.email}</p>
          )}
          <p className="text-blue-300 text-sm mt-2 font-light">
            We'll send your star certificate here
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-light py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group text-lg"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating your dedication...
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