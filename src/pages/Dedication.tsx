import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { DedicationForm } from '../components/DedicationForm';
import { StarField } from '../components/StarField';
import { useStars } from '../hooks/useStars';
import { useDedications } from '../hooks/useDedications';
import { emotions } from '../data/emotions';

export function Dedication() {
  const { starId } = useParams<{ starId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const emotionId = searchParams.get('emotion');
  const { stars, loading: starsLoading } = useStars();
  const { createDedication, loading: dedicationLoading } = useDedications();
  
  const star = stars.find(s => s.id === starId);
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
      // Handle error (show toast, etc.)
    }
  };

  if (starsLoading) {
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
            <p className="text-white text-xl">Loading star information...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!star || !emotion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Star or emotion not found</p>
          <button 
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
      <StarField density={80} color={emotion.color} />
      
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
            Back to star selection
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Dedicate Your Star
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Create a lasting dedication that will shine forever in the digital cosmos
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