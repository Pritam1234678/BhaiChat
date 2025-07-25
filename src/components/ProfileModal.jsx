import React, { useState } from 'react';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { X, User, Lock, Save, Mail } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const [user] = useAuthState(auth);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert('Please enter a display name');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile(user, {
        displayName: displayName.trim()
      });
      alert('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (useOTP) {
      // Send password reset email instead of updating directly
      setIsUpdating(true);
      try {
        await sendPasswordResetEmail(auth, user.email);
        alert('Password reset email sent! Check your email to reset your password.');
        setOtpSent(true);
        onClose();
      } catch (error) {
        console.error('Error sending password reset email:', error);
        alert('Error sending password reset email: ' + error.message);
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    setIsUpdating(true);
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        alert('Current password is incorrect');
      } else {
        alert('Error updating password: ' + error.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getUserAvatarLetter = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Avatar and Email */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
            {getUserAvatarLetter()}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {displayName || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <User size={16} />
            Profile
          </button>
          {user?.providerData?.[0]?.providerId === 'password' && (
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Lock size={16} />
              Password
            </button>
          )}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your display name"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isUpdating || !displayName.trim()}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isUpdating || !displayName.trim() ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={16} />
              )}
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && user?.providerData?.[0]?.providerId === 'password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* OTP Option Toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                id="useOTP"
                checked={useOTP}
                onChange={(e) => setUseOTP(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="useOTP" className="text-sm text-gray-700 dark:text-gray-300">
                Use email verification (recommended for better security)
              </label>
            </div>

            {useOTP ? (
              // OTP Method - Email Reset
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Mail size={24} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    We'll send a password reset link to your email address:
                  </p>
                  <p className="font-medium text-blue-800 dark:text-blue-200">{user?.email}</p>
                </div>
                
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isUpdating ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Mail size={16} />
                  )}
                  {isUpdating ? 'Sending Email...' : 'Send Password Reset Email'}
                </button>
              </div>
            ) : (
              // Direct Password Update Method
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isUpdating || !currentPassword || !newPassword || !confirmPassword ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  {isUpdating ? 'Updating...' : 'Update Password'}
                </button>
              </>
            )}
          </form>
        )}

        {/* Google Account Notice */}
        {user?.providerData?.[0]?.providerId === 'google.com' && activeTab === 'password' && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            <Lock size={24} className="mx-auto mb-2 opacity-50" />
            <p>Password change is not available for Google accounts.</p>
            <p className="text-sm">Manage your password through your Google account settings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
