import { Variants } from 'framer-motion';

// Fade in animation
export const fadeIn = (
  direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'none',
  type: 'tween' | 'spring' = 'tween',
  delay: number = 0,
  duration: number = 0.5
): Variants => {
  return {
    hidden: {
      x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
      y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        delay,
        duration,
        ease: 'easeOut',
      },
    },
  };
};

// Stagger container
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Card hover
export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

// Shimmer animation (for loading states)
export const shimmer: Variants = {
  hidden: {
    backgroundPosition: '-1000px 0',
  },
  animate: {
    backgroundPosition: ['1000px 0', '-1000px 0'],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'linear',
    },
  },
};

// Progress bar animation
export const progressBar = (width: number): Variants => {
  return {
    hidden: {
      width: '0%',
    },
    show: {
      width: `${width}%`,
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  };
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

// Item variants for lists with stagger effect
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 24 
    } 
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    transition: { 
      duration: 0.2, 
      ease: 'easeInOut' 
    } 
  }
};

// Scale up animation
export const scaleUp: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

// Pulse animation
export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    repeatType: 'reverse',
  },
};

// Slide transitions for tabs and modals
export const slideIn = (direction: 'left' | 'right' | 'up' | 'down'): Variants => {
  return {
    hidden: {
      x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
      y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type: 'tween',
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
    exit: {
      x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
      y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
      transition: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };
};
