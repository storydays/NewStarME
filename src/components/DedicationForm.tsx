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
    name: 'Digital Quantum',
    price: 'Free',
    features: ['Digital Certificate', 'Shareable Cosmic Link', 'Star Coordinates', 'Quantum Signature'],
    color: 'from-cosmic-cherenkov-blue to-cosmic-plasma-glow'
  },
  {
    id: 'premium' as const,  
    name: 'Stellar Premium',
    price: '$19',
    features: ['Everything in Digital', 'HD Star Visualization', 'Constellation Map', 'Premium Certificate', 'Gravitational Field Data'],
    color: 'from-cosmic-plasma-glow to-cosmic-stellar-wind'
  },
  {
    id: 'deluxe' as const,
    name: 'Cosmic Deluxe',
    price: '$49',
    features: ['Everything in Premium', 'Physical Certificate', 'Star Registry Entry', 'Cosmic Gift Box', 'Personalized Hologram'],
    color: 'from-cosmic-stellar-wind to-cosmic-light-echo'
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
      newErrors.custom_name = 'Please name your celestial beacon';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please inscribe your cosmic message';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email coordinates required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter valid email coordinates';
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
      {/* Enhanced Star Preview */}
      <motion.div 
        className="frosted-glass-strong rounded-2xl p-8 mb-12 border border-cosmic-particle-trace text-center cosmic-float-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center relative"
            style={{ 
              backgroundColor: star.visual_data.color,
              boxShadow: `0 0 40px ${star.visual_data.color}60, 0 0 80px ${star.visual_data.color}30`
            }}
            animate={{
              boxShadow: [
                `0 0 40px ${star.visual_data.color}60, 0 0 80px ${star.visual_data.color}30`,
                `0 0 60px ${star.visual_data.color}80, 0 0 120px ${star.visual_data.color}40`,
                `0 0 40px ${star.visual_data.color}60, 0 0 80px ${star.visual_data.color}30`
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <StarIcon className="w-8 h-8 text-cosmic-observation" />
            
            {/* Particle emission */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ backgroundColor: star.visual_data.color }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 60],
                  y: [0, (Math.random() - 0.5) * 60],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
          <div className="text-left">
            <h2 className="text-2xl font-light text-cosmic-observation">{star.scientific_name}</h2>
            <p className="text-cosmic-stellar-wind text-sm font-light">Selected for {emotion.name}</p>
          </div>
        </div>
        <p className="text-cosmic-light-echo font-light leading-relaxed">{star.poetic_description}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Enhanced Star Name Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-cosmic-observation font-light mb-3 text-lg">
            Name of the Person
          </label>
          <input
            type="text"
            value={formData.custom_name}
            onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
            placeholder="Eternal Light, Cosmic Memory, Stellar Hope..."
            className="w-full px-6 py-4 frosted-glass border border-cosmic-particle-trace rounded-xl text-cosmic-observation placeholder-cosmic-stellar-wind focus:border-cosmic-cherenkov-blue focus:ring-2 focus:ring-cosmic-cherenkov-blue/20 transition-all font-light"
          />
          {errors.custom_name && (
            <p className="text-red-400 text-sm mt-2 font-light">{errors.custom_name}</p>
          )}
        </motion.div>

        {/* Enhanced Message Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-cosmic-observation font-light mb-3 text-lg">
            Your Cosmic Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Inscribe a message that will resonate through the cosmic void for eternity..."
            rows={4}
            className="w-full px-6 py-4 frosted-glass border border-cosmic-particle-trace rounded-xl text-cosmic-observation placeholder-cosmic-stellar-wind focus:border-cosmic-cherenkov-blue focus:ring-2 focus:ring-cosmic-cherenkov-blue/20 transition-all resize-none font-light"
          />
          <div className="flex justify-between items-center mt-2">
            {errors.message && (
              <p className="text-red-400 text-sm font-light">{errors.message}</p>
            )}
            <p className="text-cosmic-stellar-wind text-sm ml-auto font-light">
              {formData.message.length}/500
            </p>
          </div>
        </motion.div>

        {/* Enhanced Gift Tiers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-cosmic-observation font-light mb-6 text-lg">
            Choose Your Cosmic Package
          </label>
          <div className="grid gap-4">
            {giftTiers.map((tier) => (
              <motion.div
                key={tier.id}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  formData.gift_tier === tier.id
                    ? 'border-cosmic-cherenkov-blue frosted-glass-strong'
                    : 'border-cosmic-particle-trace frosted-glass hover:border-cosmic-energy-flux'
                }`}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setFormData({ ...formData, gift_tier: tier.id })}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-5 h-5 rounded-full border-2 ${
                        formData.gift_tier === tier.id
                          ? 'border-cosmic-cherenkov-blue bg-cosmic-cherenkov-blue'
                          : 'border-cosmic-particle-trace'
                      }`}
                      animate={formData.gift_tier === tier.id ? {
                        boxShadow: [
                          '0 0 0px #2563EB',
                          '0 0 20px #2563EB',
                          '0 0 0px #2563EB'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <h3 className="text-lg font-light text-cosmic-observation">{tier.name}</h3>
                  </div>
                  <span className="text-xl font-light text-cosmic-stellar-wind">{tier.price}</span>
                </div>
                <ul className="text-sm text-cosmic-light-echo space-y-2 font-light">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cosmic-cherenkov-blue rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* Quantum field effect for selected tier */}
                {formData.gift_tier === tier.id && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border border-cosmic-cherenkov-blue opacity-50 pointer-events-none"
                    animate={{
                      scale: [1, 1.02, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Email Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-cosmic-observation font-light mb-3 text-lg">
            Email Coordinates
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cosmic-stellar-wind" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@cosmic.coordinates"
              className="w-full pl-12 pr-6 py-4 frosted-glass border border-cosmic-particle-trace rounded-xl text-cosmic-observation placeholder-cosmic-stellar-wind focus:border-cosmic-cherenkov-blue focus:ring-2 focus:ring-cosmic-cherenkov-blue/20 transition-all font-light"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm mt-2 font-light">{errors.email}</p>
          )}
          <p className="text-cosmic-stellar-wind text-sm mt-2 font-light">
            We'll transmit your star certificate to these coordinates
          </p>
        </motion.div>

        {/* Enhanced Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cosmic-cherenkov-blue to-cosmic-plasma-glow hover:from-cosmic-plasma-glow hover:to-cosmic-stellar-wind disabled:from-cosmic-particle-trace disabled:to-cosmic-energy-flux text-cosmic-observation font-light py-4 px-6 rounded-xl transition-all duration-500 flex items-center justify-center gap-3 group text-lg cherenkov-glow"
          whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <>
              <motion.div 
                className="w-5 h-5 border-2 border-cosmic-observation/30 border-t-cosmic-observation rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Inscribing your cosmic dedication...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Dedicate this message for eternity
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}