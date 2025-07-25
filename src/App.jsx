import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './components/Toast';
import { useChat } from './hooks/useChat';
import { sendMessage } from './api/gemini';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import SignInPage from './components/SignInPage';

function ChatApp() {
  const [user, loading] = useAuthState(auth);
  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    getCurrentConversation,
  } = useChat();

  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [animatingMessageId, setAnimatingMessageId] = useState(null);
  const [stopGeneration, setStopGeneration] = useState(false);
  const [abortController, setAbortController] = useState(null);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentConversation = getCurrentConversation();

  // Don't create initial conversation - let user create when they send first message
  // useEffect(() => {
  //   if (conversations.length === 0) {
  //     createNewConversation();
  //   }
  // }, [conversations.length]);

  const handleSendMessage = async (messageData) => {
    let conversationId = currentConversationId;
    
    if (!conversationId) {
      conversationId = createNewConversation();
      setCurrentConversationId(conversationId);
    }

    // Handle both string (legacy) and object (new with images) formats
    const content = typeof messageData === 'string' ? messageData : messageData.text;
    const images = typeof messageData === 'object' ? messageData.images : [];

    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      images: images || [],
      timestamp: new Date().toISOString(),
    };

    addMessage(conversationId, userMessage);
    setIsLoading(true);

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Get the conversation we're working with
      const workingConversation = conversations.find(conv => conv.id === conversationId);
      
      // Prepare messages for API - include images in the format Gemini expects
      const messages = [
        ...(workingConversation?.messages || []).map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'object' ? msg.content.text || msg.content : msg.content,
          images: msg.images || []
        })),
        { 
          role: 'user', 
          content: content,
          images: images || []
        },
      ];

      const response = await sendMessage(messages, controller.signal);

      // Only proceed if not aborted
      if (!controller.signal.aborted) {
        const assistantMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        };

        // Set this message for animation
        setAnimatingMessageId(assistantMessage.id);
        addMessage(conversationId, assistantMessage);
        
        // Clear animation flag immediately since there's no typewriter effect
        setTimeout(() => {
          setAnimatingMessageId(null);
        }, 100); // Very short delay to allow the message to render
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error sending message:', error);
        addToast('Failed to send message. Please try again.', 'error');
        
        const errorMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
          timestamp: new Date().toISOString(),
        };
        addMessage(conversationId, errorMessage);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleNewConversation = () => {
    const newConvId = createNewConversation();
    setCurrentConversationId(newConvId);
    setSidebarOpen(false);
    addToast('New conversation started', 'success');
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (conversationId) => {
    deleteConversation(conversationId);
    addToast('Conversation deleted', 'success');
    
    // No need to create a new conversation automatically
    // User can create one when they send a message
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const showWelcome = !currentConversation || currentConversation.messages.length === 0;

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
    setStopGeneration(true);
    setIsLoading(false);
    setAnimatingMessageId(null);
    
    // Reset stop flag after a short delay
    setTimeout(() => {
      setStopGeneration(false);
    }, 100);
  };

  // Show loading screen while Firebase Auth is initializing
  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Show sign-in page if user is not authenticated
  if (!user) {
    return <SignInPage />;
  }

  return (
    <div className="h-screen bg-white dark:bg-black chat-container">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <div className="flex flex-col h-full transition-all duration-500 ease-in-out ml-0 lg:ml-80 relative z-10">
        <ChatArea
          conversation={currentConversation}
          isLoading={isLoading}
          onToggleSidebar={toggleSidebar}
          showWelcome={showWelcome}
          animatingMessageId={animatingMessageId}
          stopGeneration={stopGeneration}
          onStopGeneration={handleStopGeneration}
        />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        stopGeneration={stopGeneration}
        onStopGeneration={handleStopGeneration}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <ChatApp />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
