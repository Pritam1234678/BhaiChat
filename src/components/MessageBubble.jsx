import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import ImageViewer from './ImageViewer';
import TypeWriterText from './TypeWriterText';
import MessageContent from './MessageContent';

const MessageBubble = ({ message, isLast, shouldAnimate = false, shouldStop = false, onStopAnimation = () => {} }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(!shouldAnimate);
  const [isDark, setIsDark] = useState(false);
  const messageRef = useRef(null);
  
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageViewer(true);
  };

  // Auto-scroll during typing animation
  const handleTextUpdate = (currentText) => {
    if (messageRef.current && shouldAnimate) {
      setTimeout(() => {
        messageRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      }, 50);
    }
  };

  return (
    <>
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex gap-4 px-6 py-6 max-w-6xl mx-auto ${
          isUser 
            ? 'bg-transparent' 
            : 'bg-gray-50/50 dark:bg-gray-900/30'
        } ${isLast ? 'mb-6' : ''}`}
      >
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
          }`}>
            {isUser ? (
              <User size={18} />
            ) : (
              <Bot size={18} />
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {isUser ? 'You' : 'BhaiChat'}
          </div>
          
          {/* Images */}
          {message.images && message.images.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {message.images.map((image, index) => (
                  <motion.div
                    key={image.id || `image-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <img
                      src={image.preview || image.data}
                      alt={image.name || `Image ${index + 1}`}
                      className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(image)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {isAssistant && shouldAnimate ? (
              <TypeWriterText
                text={message.content}
                speed={15}
                onComplete={() => setAnimationComplete(true)}
                onUpdate={handleTextUpdate}
                shouldStop={shouldStop}
                onStop={() => {
                  setAnimationComplete(true);
                  onStopAnimation();
                }}
                className="text-gray-800 dark:text-gray-200"
              />
            ) : (
              <MessageContent 
                content={message.content} 
                isDark={isDark}
              />
            )}
          </motion.div>
          
          {isAssistant && animationComplete && (
            <div className="flex items-center gap-1 mt-4 pt-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer"
                title="Copy message"
              >
                <Copy size={14} />
                Copy
              </button>
              
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer">
                <ThumbsUp size={14} />
              </button>
              
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer">
                <ThumbsDown size={14} />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <ImageViewer
        image={selectedImage}
        isOpen={showImageViewer}
        onClose={() => {
          setShowImageViewer(false);
          setSelectedImage(null);
        }}
      />
    </>
  );
};

export default MessageBubble;
