import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-2, -6, -2],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/50"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
          <Bot size={16} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Assistant
        </div>
        
        <div className="flex items-center gap-1">
          <motion.div
            variants={dotVariants}
            initial="initial"
            animate="animate"
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
          />
          <motion.div
            variants={dotVariants}
            initial="initial"
            animate="animate"
            style={{ animationDelay: '0.2s' }}
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
          />
          <motion.div
            variants={dotVariants}
            initial="initial"
            animate="animate"
            style={{ animationDelay: '0.4s' }}
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
