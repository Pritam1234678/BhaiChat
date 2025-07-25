import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, AlertTriangle, Bot, Info, Image, Square } from 'lucide-react';
import { getCurrentModelCapabilities, getModelsWithImageSupport, getFreeModelsWithImageSupport } from '../utils/modelCapabilities';

const MessageInput = ({ onSendMessage, isLoading, disabled, stopGeneration, onStopGeneration }) => {
  const [message, setMessage] = useState('');
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const modelCapabilities = getCurrentModelCapabilities();
  const imageModels = getModelsWithImageSupport();
  const freeImageModels = getFreeModelsWithImageSupport();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || uploadedImages.length > 0) && !isLoading && !disabled) {
      const messageData = {
        text: message.trim(),
        images: uploadedImages.map(img => ({
          id: img.id,
          data: img.preview,
          preview: img.preview,
          name: img.name
        }))
      };
      onSendMessage(messageData);
      setMessage('');
      setUploadedImages([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleModelInfo = () => {
    setShowModelInfo(!showModelInfo);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      return;
    }
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = {
            id: Date.now() + Math.random(),
            file,
            preview: event.target.result,
            name: file.name
          };
          setUploadedImages(prev => [...prev, imageData]);
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', file.name, error);
        };
        reader.readAsDataURL(file);
      }
    });
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <div className="fixed bottom-0 right-0 left-0 lg:left-80 z-40">
      {/* Clean backdrop */}
      <div className="absolute inset-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700"></div>
      
      <div className="relative px-4 py-3">
      {/* Model Capabilities Info */}
      <AnimatePresence>
        {showModelInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <Bot size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Current Model: {modelCapabilities.name}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  {modelCapabilities.description}
                </p>
                
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${modelCapabilities.supportsImages ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-blue-700 dark:text-blue-300">
                      Image Support: {modelCapabilities.supportsImages ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${modelCapabilities.pricing === 'Free' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                    <span className="text-blue-700 dark:text-blue-300">
                      Pricing: {modelCapabilities.pricing}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-blue-700 dark:text-blue-300">
                      Max Tokens: {modelCapabilities.maxTokens?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>

                {!modelCapabilities.supportsImages && imageModels.length > 0 && (
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      {freeImageModels.length > 0 ? 'Free models with image support:' : 'Paid models with image support:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(freeImageModels.length > 0 ? freeImageModels : imageModels).slice(0, 3).map((model) => (
                        <span
                          key={model.id}
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            model.pricing === 'Free' || model.pricing === 'Free (Experimental)'
                              ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                              : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                          }`}
                        >
                          {model.name}
                        </span>
                      ))}
                    </div>
                    {freeImageModels.length === 0 && (
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                        💰 These require paid API access
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowModelInfo(false)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Clean Image Previews */}
        {uploadedImages.length > 0 && (
          <div className="mb-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Image size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} attached
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group"
                >
                  <img
                    src={image.preview}
                    alt={image.name || 'Uploaded image'}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex items-end gap-2 max-w-3xl mx-auto p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
          {/* AI Info Button */}
          <button
            type="button"
            onClick={toggleModelInfo}
            className={`flex-shrink-0 p-2 transition-colors rounded-lg cursor-pointer ${
              showModelInfo
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Model Information"
          >
            <Bot size={18} />
          </button>

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            title="Upload Image"
          >
            <Image size={18} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
              className="w-full resize-none border-0 rounded-lg px-3 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
              rows={1}
              style={{ maxHeight: '120px' }}
              disabled={disabled}
            />
          </div>
          
          {/* Send Button or Stop Button */}
          {isLoading ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="flex-shrink-0 p-2 rounded-lg transition-colors bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!message.trim() && uploadedImages.length === 0 || disabled}
              className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                (message.trim() || uploadedImages.length > 0) && !disabled
                  ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center max-w-3xl mx-auto">
          ChatGPT can make mistakes. Check important info.
        </div>
      </form>
      </div>
    </div>
  );
};

export default MessageInput;
