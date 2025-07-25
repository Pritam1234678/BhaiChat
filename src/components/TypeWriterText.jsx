import React, { useEffect, useState } from 'react';
import MessageContent from './MessageContent';

const TypeWriterText = ({ 
  text, 
  onComplete = () => {}, 
  className = "",
  onUpdate = () => {},
  shouldStop = false,
  onStop = () => {}
}) => {
  const [isDark, setIsDark] = useState(false);
  
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
  
  useEffect(() => {
    // Immediately call onUpdate and onComplete when text is provided
    if (text) {
      onUpdate(text);
      onComplete();
    }
  }, [text, onUpdate, onComplete]);

  return (
    <MessageContent 
      content={text} 
      className={className}
      isDark={isDark}
    />
  );
};

export default TypeWriterText;
