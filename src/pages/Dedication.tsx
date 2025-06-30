import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { DedicationForm } from '../components/DedicationForm';
import { useStar } from '../hooks/useStars';
import { useDedications } from '../hooks/useDedications';
import { emotions } from '../data/emotions';

export function Dedication() {
  const { starId } = useParams<{ starId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const emotionId = searchParams.get('emotion');
  const { star, loading: starLoading } = useStar(starId);
  const { createDedication, loading: dedicationLoading } = useDedications();
  
  const emotion = emotions.find(e => e.id === emotionId);

  const handleBack = () => {
    if (emotionId) {
      navigate(`/stars/${emotionId}`);
    } else {
      navigate('/');
    }
  };

  const handleDedicationSubmit = async (dedicationData: any) => {
    try {
      const dedication = await createDedication(dedicationData);
      navigate(`/star/${dedication.id}`);
    } catch (error) {
      console.error('Failed to create dedication:', error);
    }
  };

  if (starLoading) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative z-10 flex items-center justify-center min-h-screen pointer-events-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-2 border-cosmic-cherenkov-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cosmic-observation text-lg font-light">Preparing cosmic dedication interface...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!star || !emotion) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative z-10 flex items-center justify-center min-h-screen pointer-events-auto">
          <div className="text-center frosted-glass rounded-2xl p-8">
            <p className="text-red-400 text-xl mb-4 font-light">Celestial body not found</p>
            <button 
              onClick={() => navigate('/')}
              className="text-cosmic-cherenkov-blue hover:text-cosmic-plasma-glow transition-colors font-light"
            >
              ← Return to cosmic emotions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative z-10 container mx-auto px-6 py-12 pointer-events-auto">
        {/* Enhanced Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-cosmic-stellar-wind hover:text-cosmic-observation transition-colors mb-12 group font-light frosted-glass px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Return to star catalog
          </button>
          
          <div className="text-center max-w-2xl mx-auto">
            <motion.div 
              className="frosted-glass p-8 rounded-2xl mb-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl font-light text-cosmic-observation mb-6 cosmic-float"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Create Your Cosmic Message
              </motion.h1>
              
              <motion.p 
                className="text-xl text-cosmic-light-echo font-light leading-relaxed particle-drift"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Inscribe a note they will remember for their lifetime
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Dedication Form - REMOVED cosmic-float-card class */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DedicationForm
            star={star}
            emotion={emotion}
            onSubmit={handleDedicationSubmit}
            loading={dedicationLoading}
          />
        </motion.div>
      </div>
    </div>
  );
}