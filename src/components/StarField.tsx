import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface StarFieldProps {
  density?: number;
  color?: string;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  parallaxFactor: number;
  redshift: number;
}

export function StarField({ density = 150, color = '#FFFFFF', className = '' }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isWebGLSupported, setIsWebGLSupported] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL support for gravitational lensing effects
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setIsWebGLSupported(!!gl);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking for gravitational lensing effect
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Generate stars with physics-based properties
    const generateStars = () => {
      const stars: Star[] = [];
      
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * canvas.width / (window.devicePixelRatio || 1),
          y: Math.random() * canvas.height / (window.devicePixelRatio || 1),
          z: Math.random() * 1000 + 100, // Depth for parallax
          radius: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          parallaxFactor: Math.random() * 0.5 + 0.1,
          redshift: Math.random() * 0.3 // For color shifting effect
        });
      }
      
      starsRef.current = stars;
    };

    generateStars();

    // Physics-based animation loop
    let time = 0;
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Dark matter density variations
      const darkMatterDensity = Math.sin(time * 0.001) * 0.1 + 0.9;
      
      starsRef.current.forEach((star, index) => {
        // Parallax effect based on mouse position
        const parallaxX = (mouseRef.current.x - rect.width / 2) * star.parallaxFactor * 0.01;
        const parallaxY = (mouseRef.current.y - rect.height / 2) * star.parallaxFactor * 0.01;
        
        // Gravitational lensing effect near mouse
        const distanceToMouse = Math.sqrt(
          Math.pow(star.x - mouseRef.current.x, 2) + 
          Math.pow(star.y - mouseRef.current.y, 2)
        );
        
        const lensingEffect = Math.max(0, 1 - distanceToMouse / 200);
        const lensedRadius = star.radius * (1 + lensingEffect * 0.5);
        
        // Quantum fluctuation and redshift effects
        const twinkle = Math.sin(time * star.twinkleSpeed + index) * 0.3 + 0.7;
        const redshiftEffect = Math.sin(time * 0.001 + star.redshift * 10) * 0.2 + 0.8;
        const alpha = star.opacity * twinkle * darkMatterDensity;
        
        // Color shifting based on redshift (simulating cosmic expansion)
        const hue = star.redshift * 60; // Blue to red shift
        const starColor = `hsl(${240 + hue}, 70%, ${70 + redshiftEffect * 30}%)`;
        
        // Render star with gravitational effects
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Gravitational lensing glow
        if (lensingEffect > 0.1) {
          const gradient = ctx.createRadialGradient(
            star.x + parallaxX, star.y + parallaxY, 0,
            star.x + parallaxX, star.y + parallaxY, lensedRadius * 3
          );
          gradient.addColorStop(0, starColor);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(star.x + parallaxX, star.y + parallaxY, lensedRadius * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Main star
        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(star.x + parallaxX, star.y + parallaxY, lensedRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Cherenkov radiation trail for bright stars
        if (star.radius > 1.5 && alpha > 0.7) {
          ctx.globalAlpha = alpha * 0.3;
          ctx.fillStyle = '#2563EB';
          ctx.beginPath();
          ctx.arc(
            star.x + parallaxX - 2, 
            star.y + parallaxY, 
            lensedRadius * 0.5, 
            0, Math.PI * 2
          );
          ctx.fill();
        }
        
        ctx.restore();
        
        // Particle drift simulation
        star.x += Math.sin(time * 0.0001 + index) * 0.1;
        star.y += Math.cos(time * 0.0001 + index) * 0.05;
        
        // Wrap around edges
        if (star.x < -10) star.x = rect.width + 10;
        if (star.x > rect.width + 10) star.x = -10;
        if (star.y < -10) star.y = rect.height + 10;
        if (star.y > rect.height + 10) star.y = -10;
      });

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [density, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  );
}

// Enhanced AnimatedStar component with dark energy research aesthetics
export function AnimatedStar({ 
  x, 
  y, 
  size = 4, 
  color = '#2563EB',
  delay = 0,
  type = 'quantum'
}: { 
  x: number; 
  y: number; 
  size?: number; 
  color?: string; 
  delay?: number;
  type?: 'quantum' | 'particle' | 'field' | 'cosmic-ray';
}) {
  const getAnimationByType = () => {
    switch (type) {
      case 'quantum':
        return {
          scale: [0, 1.2, 1],
          opacity: [0, 1, 0.8],
          rotate: [0, 180, 360]
        };
      case 'particle':
        return {
          scale: [0, 1],
          opacity: [0, 1, 0.6],
          x: [0, Math.random() * 20 - 10],
          y: [0, Math.random() * 20 - 10]
        };
      case 'field':
        return {
          scale: [0.8, 1.3, 1],
          opacity: [0.3, 1, 0.7],
          filter: ['blur(0px)', 'blur(2px)', 'blur(0px)']
        };
      case 'cosmic-ray':
        return {
          scale: [0, 1.5, 0.8],
          opacity: [0, 1, 0.9],
          rotate: [0, 720],
          boxShadow: [
            `0 0 ${size}px ${color}`,
            `0 0 ${size * 3}px ${color}`,
            `0 0 ${size * 2}px ${color}`
          ]
        };
      default:
        return {
          scale: [0, 1.2, 1],
          opacity: [0, 1, 0.8]
        };
    }
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={getAnimationByType()}
      transition={{ 
        duration: type === 'cosmic-ray' ? 3 : 2, 
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      <div
        className="rounded-full relative"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: color,
          boxShadow: `0 0 ${size * 2}px ${color}40`
        }}
      >
        {/* Particle trail effect */}
        {type === 'cosmic-ray' && (
          <motion.div
            className="absolute top-1/2 left-full w-8 h-0.5 -translate-y-1/2"
            style={{ 
              background: `linear-gradient(90deg, ${color}, transparent)`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scaleX: [0, 1, 0]
            }}
            transition={{
              duration: 1,
              delay: delay + 0.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
        
        {/* Quantum field fluctuation */}
        {type === 'field' && (
          <motion.div
            className="absolute inset-0 rounded-full border"
            style={{ 
              borderColor: color,
              borderWidth: '1px'
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{
              duration: 2,
              delay: delay + 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

// Gravitational Wave Visualization Component
export function GravitationalWaves({ 
  centerX, 
  centerY, 
  intensity = 0.5 
}: { 
  centerX: number; 
  centerY: number; 
  intensity?: number; 
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border border-cosmic-cherenkov-blue/20 rounded-full"
          style={{
            left: centerX - (50 + i * 30),
            top: centerY - (50 + i * 30),
            width: (100 + i * 60),
            height: (100 + i * 60)
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, intensity, 0]
          }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}