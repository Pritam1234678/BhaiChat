import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  MoreHorizontal,
  LogOut,
  User
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useTheme } from '../contexts/ThemeContext'
import SettingsModal from './SettingsModal'
import ProfileModal from './ProfileModal'

const Sidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onToggle
}) => {
  const { isDark, toggleTheme } = useTheme()
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [user] = useAuthState(auth)

  // Helper function to get user's avatar letter
  const getUserAvatarLetter = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase()
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName
    } else if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = formatDate(conv.createdAt)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(conv)
    return groups
  }, {})

  const ConversationItem = ({ conversation }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
        currentConversationId === conversation.id
          ? 'bg-gray-100 dark:bg-gray-700'
          : 'hover:bg-gray-200 dark:hover:bg-gray-800'
      }`}
      onClick={() => onSelectConversation(conversation.id)}
    >
      <div className='w-5 h-5 flex items-center justify-center'>
        <MessageSquare size={12} className='text-gray-600 dark:text-gray-400' />
      </div>
      <span className='flex-1 text-sm truncate text-gray-900 dark:text-white'>
        {conversation.title}
      </span>
      <motion.button
        onClick={e => {
          e.stopPropagation()
          onDeleteConversation(conversation.id)
        }}
        className='opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-all'
      >
        <Trash2 size={12} className='text-gray-600 dark:text-gray-400' />
      </motion.button>
    </motion.div>
  )

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-50 transform transition-all duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className='flex flex-col h-full '>
          {/* Clean header */}
          <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 bg-gray-900 dark:bg-white rounded-sm flex items-center justify-center'>
                <MessageSquare
                  size={14}
                  className='text-white dark:text-black'
                />
              </div>
              <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
                History
              </h1>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={onToggle}
                className='lg:hidden p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors'
              >
                <X size={18} className='text-gray-600 dark:text-gray-400' />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className='p-3'>
            <motion.button
              onClick={onNewConversation}
              className='w-full flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 transition-colors shadow-sm'
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Plus size={16} />
              <span className='font-medium'>New chat</span>
            </motion.button>
          </div>

          {/* Conversations List */}
          <div className='flex-1 overflow-y-auto px-3 pb-3 space-y-2'>
            {Object.entries(groupedConversations).map(([date, convs]) => (
              <div key={date} className='space-y-1'>
                <h3 className='text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1'>
                  {date}
                </h3>
                <div className='space-y-0.5'>
                  {convs.map(conversation => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                    />
                  ))}
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className='text-center text-gray-500 dark:text-gray-400 py-8'>
                <MessageSquare size={24} className='mx-auto mb-2 opacity-50' />
                <p className='text-sm'>No conversations yet</p>
                <p className='text-xs opacity-75'>Start a new chat to begin!</p>
              </div>
            )}
          </div>

          {/* Light Mode Toggle */}
          <div className='border-t border-gray-200 dark:border-gray-800 p-3'>
            <button
              onClick={toggleTheme}
              className='w-full flex items-center justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-400 rounded-lg transition-colors'
            >
              <div className='flex items-center gap-2'>
                {isDark ? (
                  <Sun size={16} className='text-gray-600 dark:text-gray-400' />
                ) : (
                  <Moon
                    size={16}
                    className='text-gray-600 dark:text-gray-400'
                  />
                )}
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  {isDark ? 'Light mode' : 'Dark mode'}
                </span>
              </div>
            </button>
          </div>

          {/* Profile Section */}
          <div className='border-t border-gray-200 dark:border-gray-800 p-3'>
            <div className='flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'>
              <button
                onClick={() => setShowProfile(true)}
                className='w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold hover:bg-indigo-700 transition-colors cursor-pointer'
                title='Edit profile'
              >
                {getUserAvatarLetter()}
              </button>
              <div className='flex-1 min-w-0'>
                <button
                  onClick={() => setShowProfile(true)}
                  className='block text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate w-full text-left'
                  title='Edit profile'
                >
                  {getUserDisplayName()}
                </button>
                <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className='p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors'
                title='Sign out'
              >
                <LogOut
                  size={16}
                  className='text-gray-600 dark:text-gray-400'
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  )
}

export default Sidebar
