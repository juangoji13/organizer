'use client';

import confetti from 'canvas-confetti';

/**
 * Trigger subtle haptic vibration on supporting mobile devices
 */
export function triggerTactilePop(pattern: number | number[] = 15) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptics not allowed or not supported
    }
  }
}

/**
 * Dramatic Celebration for Completed Job Delivery
 * Dual-cannon emerald & electric cyan confetti explosion
 */
export function triggerDeliveryCelebration() {
  triggerTactilePop([20, 40, 20]);

  // Left cannon
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0.1, y: 0.8 },
    colors: ['#10b981', '#06b6d4', '#3b82f6', '#34d399', '#ffffff'],
    disableForReducedMotion: true,
  });

  // Right cannon
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 0.9, y: 0.8 },
    colors: ['#10b981', '#06b6d4', '#3b82f6', '#34d399', '#ffffff'],
    disableForReducedMotion: true,
  });
}

/**
 * Dramatic Celebration for Payment Received / Debt Cleared
 * Golden coins & warm amber particle shower
 */
export function triggerPaymentCelebration() {
  triggerTactilePop([30, 20, 30]);

  confetti({
    particleCount: 75,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#fbbf24', '#d97706', '#fef08a', '#10b981'],
    scalar: 1.2,
    shapes: ['circle', 'square'],
    disableForReducedMotion: true,
  });
}

/**
 * Spectacular Fireworks Burst for Weekly Goal or Major Milestone
 */
export function triggerMilestoneCelebration() {
  triggerTactilePop([40, 30, 50, 30, 60]);

  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

  const interval: ReturnType<typeof setInterval> = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.4 + 0.2 },
      colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'],
      disableForReducedMotion: true,
    });
  }, 350);
}
