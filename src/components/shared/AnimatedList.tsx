import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, listItem } from '../../utils/motion';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          custom={index}
          variants={listItem}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AnimatedList; 