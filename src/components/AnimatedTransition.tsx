import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  once?: boolean;
}

export function AnimatedTransition({
  children,
  className,
  delay = 0,
  duration = 0.3,
  type = 'fade',
  once = false
}: AnimatedTransitionProps) {
  const [isVisible, setIsVisible] = useState(!once);
  
  useEffect(() => {
    if (once) {
      setIsVisible(true);
    }
  }, [once]);

  // Set up animation variants based on type
  const getVariants = () => {
    switch (type) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
      case 'slide-up':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        };
      case 'slide-down':
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 }
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0 }
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 }
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 }
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={getVariants()}
          transition={{ 
            duration: duration,
            delay: delay,
            ease: "easeOut"
          }}
          className={cn(className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AnimatedList({ 
  children, 
  staggerDelay = 0.05 
}: { 
  children: React.ReactNode[]; 
  staggerDelay?: number;
}) {
  return (
    <>
      {React.Children.map(children, (child, i) => (
        <AnimatedTransition type="slide-up" delay={i * staggerDelay}>
          {child}
        </AnimatedTransition>
      ))}
    </>
  );
}

// For buttons and interactive elements
export function AnimatedButton({ 
  children, 
  onClick,
  className,
  disabled = false,
  variant = 'default'
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'subtle' | 'glow';
}) {
  const getHoverEffect = () => {
    switch (variant) {
      case 'glow':
        return {
          rest: { scale: 1, boxShadow: "0px 0px 0px rgba(249, 115, 22, 0)" },
          hover: { 
            scale: 1.02, 
            boxShadow: "0px 0px 15px rgba(249, 115, 22, 0.5)" 
          },
          tap: { scale: 0.98 }
        };
      case 'subtle':
        return {
          rest: { y: 0 },
          hover: { y: -2 },
          tap: { y: 0 }
        };
      default:
        return {
          rest: { scale: 1 },
          hover: { scale: 1.02 },
          tap: { scale: 0.98 }
        };
    }
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden",
        variant === 'glow' && "btn-glow",
        className
      )}
      initial="rest"
      whileHover="hover"
      whileTap={disabled ? undefined : "tap"}
      variants={getHoverEffect()}
      transition={{ duration: 0.2 }}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}