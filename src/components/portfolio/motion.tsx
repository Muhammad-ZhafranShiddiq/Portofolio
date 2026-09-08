"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";

interface MotionProviderProps {
  children: ReactNode;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}

export function PortfolioMotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionConfig>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 20,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, transform: `translateY(${distance}px)` }
      }
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -48px" }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
