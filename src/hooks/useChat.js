import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFirestoreChatSync } from './useFirestoreChatSync';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const createNewConversation = useCallback(() => {
    const newConversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation.id;
  }, []);

  const addMessage = useCallback((conversationId, message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, message],
              title: conv.messages.length === 0 ? message.content.slice(0, 30) + '...' : conv.title
            }
          : conv
      )
    );
  }, []);

  const updateMessage = useCallback((conversationId, messageId, updates) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === messageId ? { ...msg, ...updates } : msg
              )
            }
          : conv
      )
    );
  }, []);

  const deleteConversation = useCallback((conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  const getCurrentConversation = useCallback(() => {
    return conversations.find(conv => conv.id === currentConversationId);
  }, [conversations, currentConversationId]);

  // Sync with Firestore for the current Clerk user
  useFirestoreChatSync(conversations, setConversations);

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    getCurrentConversation,
  };
};
