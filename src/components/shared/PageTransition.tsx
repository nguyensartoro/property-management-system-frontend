import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/utils/motion';

interface MotionWrapperProps {
  children: React.ReactNode;
  /**
   * Optional className to override default styles
   */
  className?: string;
  /**
   * Optional delay for stagger animations
   */
  delay?: number;
}

const MotionWrapper = React.memo<MotionWrapperProps>(({
  children,
  className = 'w-full h-full',
  delay = 0
}: MotionWrapperProps) => {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      transition={{
        type: "tween",
        duration: 0.15,
        ease: "easeOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
});

MotionWrapper.displayName = 'MotionWrapper';

export default MotionWrapper;