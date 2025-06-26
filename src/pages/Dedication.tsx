import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { DedicationForm } from '../components/DedicationForm';
import { StarField } from '../components/StarField';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
        <StarField density={60} className="opacity-30" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-light">Preparing your dedication...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!star || !emotion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4 font-light">Star not found</p>
          <button 
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 transition-colors font-light"
          >
            ← Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative">
      <StarField density={60} color={emotion.color} className="opacity-30" />
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-12 group font-light"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to stars
          </button>
          
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light text-white mb-6">
              Create Your Dedication
            </h1>
            
            <p className="text-xl text-blue-100 font-light leading-relaxed">
              Write a message that will shine forever among the stars
            </p>
          </div>
        </motion.div>

        {/* Dedication Form */}
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