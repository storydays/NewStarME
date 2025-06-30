import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, VolumeX, Volume2 } from 'lucide-react';

interface MusicPlayerProps {
  className?: string;
}

export function MusicPlayer({ className = '' }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Space-themed audio track URL (using a royalty-free space ambient track)
  const audioSrc = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'; // Placeholder - replace with actual space music

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.loop = true;
      
      const handleCanPlayThrough = () => {
        setIsLoaded(true);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [volume]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
      // Fallback: just toggle the visual state for demo purposes
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.volume > 0) {
      audio.volume = 0;
      setVolume(0);
    } else {
      audio.volume = 0.3;
      setVolume(0.3);
    }
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
      />

      {/* Music Player Button */}
      <motion.div
        className={`fixed top-4 z-50 flex items-center gap-2 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {/* Main Play/Pause Button */}
        <motion.button
          onClick={togglePlayPause}
          className="p-3 rounded-lg frosted-glass border border-cosmic-particle-trace hover:border-cosmic-energy-flux transition-all duration-300 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!isLoaded}
          title={isPlaying ? 'Pause space music' : 'Play space music'}
        >
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ 
              duration: isPlaying ? 8 : 0.3, 
              repeat: isPlaying ? Infinity : 0, 
              ease: "linear" 
            }}
          >
            <Music 
              className={`w-5 h-5 transition-colors duration-300 ${
                isPlaying 
                  ? 'text-cosmic-cherenkov-blue' 
                  : isLoaded 
                    ? 'text-cosmic-observation group-hover:text-cosmic-cherenkov-blue' 
                    : 'text-cosmic-stellar-wind'
              }`} 
            />
          </motion.div>

          {/* Pulsing effect when playing */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-cosmic-cherenkov-blue"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.button>

        {/* Volume Control */}
        <motion.button
          onClick={toggleMute}
          className="p-2 rounded-lg frosted-glass border border-cosmic-particle-trace hover:border-cosmic-energy-flux transition-all duration-300 opacity-80 hover:opacity-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={volume > 0 ? 'Mute' : 'Unmute'}
        >
          {volume > 0 ? (
            <Volume2 className="w-4 h-4 text-cosmic-observation" />
          ) : (
            <VolumeX className="w-4 h-4 text-cosmic-stellar-wind" />
          )}
        </motion.button>

        {/* Loading indicator */}
        {!isLoaded && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-cosmic-cherenkov-blue rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Sound waves animation when playing */}
        {isPlaying && (
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-cosmic-cherenkov-blue rounded-full"
                animate={{
                  height: [4, 12, 4],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}