import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, BookOpen, Info } from 'lucide-react';

interface BurgerMenuProps {
  className?: string;
}

export function BurgerMenu({ className = '' }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { id: 'login', label: 'Login', icon: User, href: '#' },
    { id: 'blog', label: 'Blog', icon: BookOpen, href: '#' },
    { id: 'about', label: 'About', icon: Info, href: '#' }
  ];

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        onClick={toggleMenu}
        className={`fixed top-4 z-50 p-3 rounded-lg frosted-glass border border-cosmic-particle-trace hover:border-cosmic-energy-flux transition-all duration-300 ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-cosmic-observation" />
        ) : (
          <Menu className="w-5 h-5 text-cosmic-observation" />
        )}
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Side Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 h-full w-80 z-40 frosted-glass-strong border-l border-cosmic-particle-trace"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              duration: 0.4 
            }}
          >
            <div className="p-8 pt-20">
              {/* Menu Header */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-light text-cosmic-observation mb-2">
                  Menu
                </h2>
                <div className="w-12 h-0.5 bg-cosmic-cherenkov-blue"></div>
              </motion.div>

              {/* Menu Items */}
              <nav className="space-y-4">
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.a
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-4 p-4 rounded-xl frosted-glass hover:frosted-glass-strong border border-cosmic-particle-trace hover:border-cosmic-energy-flux transition-all duration-300 group"
                      onClick={closeMenu}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 rounded-lg frosted-glass flex items-center justify-center group-hover:bg-cosmic-cherenkov-blue/20 transition-colors duration-300">
                        <IconComponent className="w-5 h-5 text-cosmic-observation group-hover:text-cosmic-cherenkov-blue transition-colors duration-300" />
                      </div>
                      <span className="text-cosmic-observation font-light text-lg group-hover:text-cosmic-light-echo transition-colors duration-300">
                        {item.label}
                      </span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-2 h-2 bg-cosmic-cherenkov-blue rounded-full"></div>
                      </div>
                    </motion.a>
                  );
                })}
              </nav>

              {/* Menu Footer */}
              <motion.div
                className="mt-12 pt-8 border-t border-cosmic-particle-trace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-cosmic-stellar-wind text-sm font-light text-center">
                  StarMe - Where memories live forever
                </p>
              </motion.div>
            </div>

            {/* Cosmic particle effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cosmic-cherenkov-blue rounded-full opacity-30"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [0, Math.random() * 40 - 20],
                    y: [0, Math.random() * 40 - 20],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}