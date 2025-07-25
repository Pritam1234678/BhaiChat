import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble'; // Assuming this path is correct
import TypingIndicator from './TypingIndicator'; // Assuming this path is correct
import { Sparkles, Menu, Square } from 'lucide-react'; // Assuming lucide-react is installed

const ChatArea = ({
  conversation,
  isLoading,
  onToggleSidebar,
  showWelcome,
  animatingMessageId,
  stopGeneration,
  onStopGeneration
}) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Simple auto-scroll only for new messages
  useEffect(() => {
    if (!isLoading && conversation?.messages?.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages?.length]);

  // Welcome Screen Component
  const WelcomeScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-black"
    >
      <div className="text-center max-w-4xl w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-6 bg-black dark:bg-white rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles size={24} className="text-white dark:text-black" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How can I help you today?
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            I'm your AI assistant, ready to help with questions, creative tasks, analysis, and more.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
        >
          {[
            {
              title: "Visual Analysis",
              description: "Upload images and ask questions about them",
              icon: "🖼️"
            },
            {
              title: "Code Assistant",
              description: "Debug, review, or write code in any language",
              icon: "💻"
            },
            {
              title: "Creative Writing",
              description: "Help with stories, poems, or creative content",
              icon: "✨"
            },
            {
              title: "Knowledge Q&A",
              description: "Ask questions about any topic you're curious about",
              icon: "❓"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

  // Render Welcome Screen if showWelcome is true
  if (showWelcome) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Fixed Welcome Header */}
        <div className="fixed top-0 left-0 lg:left-80 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black backdrop-blur-sm">
          <motion.button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={20} className="text-gray-500 dark:text-gray-400" />
          </motion.button>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            BhaiChat
          </h2>
          <div className="w-10 lg:hidden"></div> {/* Placeholder for alignment */}
        </div>

        <div className="pt-16">
          <WelcomeScreen />
        </div>
      </div>
    );
  }

  // Render Chat Area if showWelcome is false
  return (
    <div className="flex-1 flex flex-col">
      {/* Fixed Header for Chat */}
      <div className="fixed top-0 left-0 lg:left-80 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black backdrop-blur-sm">
        <motion.button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu size={20} className="text-gray-500 dark:text-gray-400" />
        </motion.button>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          BhaiChat
        </h2>
        <div className="w-10 lg:hidden"></div> {/* Placeholder for alignment */}
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-white dark:bg-black pb-32 pt-16"
      >
        <div className="w-full">
          <AnimatePresence mode="popLayout">
            {conversation?.messages?.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLast={index === conversation.messages.length - 1}
                shouldAnimate={message.id === animatingMessageId && message.role === 'assistant'}
                shouldStop={stopGeneration && message.id === animatingMessageId}
                onStopAnimation={onStopGeneration}
              />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isLoading && (
              <div className="max-w-6xl mx-auto px-6 py-6">
                <TypingIndicator />
              </div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} /> {/* This div is used for scrolling to the bottom */}
        </div>
      </div>
    </div>
  );
};

export default ChatArea;