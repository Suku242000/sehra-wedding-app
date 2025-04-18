import { Variants } from 'framer-motion';

// Stagger container for child elements animation
export const staggerContainer = (
  staggerChildren: number = 0.05, 
  delayChildren: number = 0
): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Fade-in animation variants with direction support
export const fadeIn = (
  direction: 'up' | 'down' | 'left' | 'right',
  type: 'tween' | 'spring',
  delay: number,
  duration: number
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

// Item animation variants for list items
export const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95 
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 24 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { 
      duration: 0.2 
    } 
  }
};

// Staggered container animation for list containers
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Pulse animation for notifications
export const pulseAnimation: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { 
      duration: 0.6, 
      repeat: Infinity, 
      repeatType: 'reverse' 
    }
  }
};

// Slide-in animation for modals and drawers
export const slideIn = (
  direction: 'up' | 'down' | 'left' | 'right',
  type: 'tween' | 'spring',
  delay: number,
  duration: number
): Variants => {
  return {
    hidden: {
      x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
      y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type,
        delay,
        duration,
        ease: 'easeOut',
      },
    },
  };
};

// Rotate animation for loading spinners
export const rotateAnimation: Variants = {
  hidden: { opacity: 0, rotate: 0 },
  show: { 
    opacity: 1, 
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity
    }
  }
};

// Zoom animation
export const zoomIn = (delay: number, duration: number): Variants => {
  return {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'tween',
        delay,
        duration,
        ease: 'easeOut',
      },
    },
  };
};

// Text character animation for hero text
export const textVariant = (delay: number): Variants => {
  return {
    hidden: {
      y: 50,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        duration: 1.25,
        delay,
      },
    },
  };
};

// Page transition
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: 'beforeChildren',
      staggerChildren: 0.25,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      when: 'afterChildren',
      staggerChildren: 0.1,
    },
  },
};

// Progress bar animation
export const progressBar = (progress: number): Variants => {
  return {
    hidden: { width: 0 },
    show: { 
      width: `${progress}%`,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };
};