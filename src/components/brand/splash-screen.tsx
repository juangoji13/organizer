'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NexoLogo } from '@/components/brand/nexo-logo';

export interface SplashScreenProps {
  forceShow?: boolean;
  onFinish?: () => void;
}

export function SplashScreen({ forceShow = false, onFinish }: SplashScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    try {
      const seen = sessionStorage.getItem('nexo_splash_seen');
      if (!seen) {
        setIsVisible(true);
      }
    } catch {
      // In privacy modes where sessionStorage is restricted, skip
      setIsVisible(false);
    }
  }, [forceShow]);

  useEffect(() => {
    if (!isVisible) return;

    // Sequence duration ~1.4s before exiting
    const timer = setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem('nexo_splash_seen', 'true');
      } catch {
        // ignore
      }
    }, 1450);

    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('nexo_splash_seen', 'true');
    } catch {
      // ignore
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        onFinish?.();
      }}
    >
      {isVisible && (
        <motion.div
          key="nexo-splash-overlay"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#000000] select-none overflow-hidden cursor-pointer"
          aria-label="Pantalla de bienvenida NEXO"
        >
          {/* Ambient luminous glow background */}
          <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-60 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,rgba(52,211,153,0.08)_40%,transparent_70%)]" />

          {/* Center Brand Identity Composition */}
          <div className="relative z-10 flex flex-col items-center">
            {/* 1. Kinetic SVG Logo */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <NexoLogo size="xl" animated={true} />
            </motion.div>

            {/* 2. Brand Title "N E X O" with Kinetic Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 14, letterSpacing: '0.2em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.35em' }}
              transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-mono text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white uppercase pl-[0.35em] drop-shadow-xs dark:drop-shadow-[0_0_16px_rgba(255,255,255,0.4)]"
            >
              NEXO
            </motion.div>

            {/* 3. Subtitle: WORKSPACE OPERATING SYSTEM */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] sm:text-[11px] font-mono tracking-[0.26em] text-zinc-500 dark:text-zinc-400 font-semibold uppercase mt-2.5 pl-[0.26em]"
            >
              WORKSPACE OPERATING SYSTEM
            </motion.p>

            {/* 4. Fine Kinetic Horizon Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="w-14 h-[1.5px] mt-4 rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-indigo-500 origin-center"
            />
          </div>

          {/* Subtle tap/click to continue prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute bottom-8 text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase"
          >
            Toca para continuar
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
