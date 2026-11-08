'use client';

import React, { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface NexoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showGlow?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-14 h-14',
  xl: 'w-24 h-24 sm:w-28 sm:h-28',
};

export function NexoLogo({
  size = 'md',
  animated = false,
  className,
  showGlow = true,
}: NexoLogoProps) {
  const rawId = useId();
  // Sanitize id for SVG attribute compatibility
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '');

  const primaryGradId = `nexo-primary-grad-${id}`;
  const orbitalGradId = `nexo-orbital-grad-${id}`;
  const glowFilterId = `nexo-glow-${id}`;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none',
        sizeClasses[size],
        className
      )}
      aria-label="NEXO Kinetic Mark"
      role="img"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'w-full h-full overflow-visible',
          showGlow &&
            'drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_0_14px_rgba(56,189,248,0.42)]'
        )}
      >
        <defs>
          {/* Primary Nexus Gradient: Light mode (slate/obsidian with sapphire-emerald sheen) vs Dark mode (luminescent white to cyan-emerald) */}
          <linearGradient id={primaryGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="text-zinc-950 dark:text-white" stopColor="currentColor" />
            <stop offset="48%" className="text-sky-600 dark:text-sky-400" stopColor="currentColor" />
            <stop offset="100%" className="text-emerald-600 dark:text-emerald-400" stopColor="currentColor" />
          </linearGradient>

          {/* Complementary Dynamic Orbit Gradient */}
          <linearGradient id={orbitalGradId} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" className="text-emerald-600 dark:text-emerald-300" stopColor="currentColor" />
            <stop offset="52%" className="text-cyan-600 dark:text-cyan-400" stopColor="currentColor" />
            <stop offset="100%" className="text-indigo-600 dark:text-indigo-300" stopColor="currentColor" />
          </linearGradient>

          {/* High precision glow filter */}
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {animated ? (
          <>
            {/* 1. Dynamic Nexus Lemniscate (Infinity Loop) */}
            <motion.path
              d="M 50 50 C 64 26 86 26 86 50 C 86 74 64 74 50 50 C 36 26 14 26 14 50 C 14 74 36 74 50 50 Z"
              fill="none"
              stroke={`url(#${primaryGradId})`}
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* 2. Inclined Dynamic Orbital Ring 1 (-35 deg tilt) */}
            <motion.path
              d="M 50 17 C 72 17 88 32 88 50 C 88 68 72 83 50 83 C 28 83 12 68 12 50 C 12 32 28 17 50 17 Z"
              transform="rotate(-35 50 50)"
              fill="none"
              stroke={`url(#${orbitalGradId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.25, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* 3. Counter Orbital Ring 2 (+35 deg tilt, micro-segmented) */}
            <motion.path
              d="M 50 19 C 71 19 86 33 86 50 C 86 67 71 81 50 81 C 29 81 14 67 14 50 C 14 33 29 19 50 19 Z"
              transform="rotate(35 50 50)"
              fill="none"
              stroke={`url(#${primaryGradId})`}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 3.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* 4. Radiant Center Core Nexus Node */}
            <motion.circle
              cx="50"
              cy="50"
              r="4.6"
              fill="none"
              stroke={`url(#${primaryGradId})`}
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.45,
                delay: 0.62,
                type: 'spring',
                stiffness: 400,
                damping: 24,
              }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="2.2"
              className="fill-zinc-950 dark:fill-white"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.7,
                type: 'spring',
                stiffness: 500,
                damping: 26,
              }}
            />

            {/* 5. Orbital Satellite Micro Nodes */}
            <motion.circle
              cx="14"
              cy="50"
              r="2.2"
              className="fill-sky-500 dark:fill-cyan-300"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: 0.82,
                type: 'spring',
                stiffness: 500,
                damping: 25,
              }}
            />
            <motion.circle
              cx="86"
              cy="50"
              r="2.2"
              className="fill-emerald-500 dark:fill-emerald-300"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: 0.82,
                type: 'spring',
                stiffness: 500,
                damping: 25,
              }}
            />
          </>
        ) : (
          <>
            {/* Static high-performance rendering */}
            <path
              d="M 50 50 C 64 26 86 26 86 50 C 86 74 64 74 50 50 C 36 26 14 26 14 50 C 14 74 36 74 50 50 Z"
              fill="none"
              stroke={`url(#${primaryGradId})`}
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 17 C 72 17 88 32 88 50 C 88 68 72 83 50 83 C 28 83 12 68 12 50 C 12 32 28 17 50 17 Z"
              transform="rotate(-35 50 50)"
              fill="none"
              stroke={`url(#${orbitalGradId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 50 19 C 71 19 86 33 86 50 C 86 67 71 81 50 81 C 29 81 14 67 14 50 C 14 33 29 19 50 19 Z"
              transform="rotate(35 50 50)"
              fill="none"
              stroke={`url(#${primaryGradId})`}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 3.5"
              opacity="0.85"
            />
            <circle
              cx="50"
              cy="50"
              r="4.6"
              fill="none"
              stroke={`url(#${primaryGradId})`}
              strokeWidth="2"
            />
            <circle cx="50" cy="50" r="2.2" className="fill-zinc-950 dark:fill-white" />
            <circle cx="14" cy="50" r="2.2" className="fill-sky-500 dark:fill-cyan-300" />
            <circle cx="86" cy="50" r="2.2" className="fill-emerald-500 dark:fill-emerald-300" />
          </>
        )}
      </svg>
    </div>
  );
}
