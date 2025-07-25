
import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';

const SignInPage = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin', 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signInWithGoogle = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setIsSigningIn(false);
    }
  };

  const signInWithEmail = async () => {
    if (isSigningIn || !email || !password) return;
    setIsSigningIn(true);
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Error with email authentication:', error);
      alert(error.message);
      setIsSigningIn(false);
    }
  };

  return (
    <div className='bg-gray-900 min-h-screen flex flex-col items-center justify-center text-center px-4'>
      <div className='text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4'>
        Welcome to <span className='text-indigo-400'>Mera Bhai</span>
      </div>
      <p className='mt-4 max-w-2xl text-lg text-gray-400 mb-8'>
        Your trusted companion app. Please sign in to continue.
      </p>

      {/* Authentication Method Selector */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAuthMode('google')}
          className={`px-4 py-2 rounded-lg transition-all ${authMode === 'google' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Google
        </button>
        <button
          onClick={() => setAuthMode('email')}
          className={`px-4 py-2 rounded-lg transition-all ${authMode === 'email' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Email
        </button>
        <button
          onClick={() => setAuthMode('phone')}
          className={`px-4 py-2 rounded-lg transition-all ${authMode === 'phone' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Phone*
        </button>
      </div>

      {/* Google Sign In */}
      {authMode === 'google' && (
        <button
          onClick={signInWithGoogle}
          disabled={isSigningIn}
          className={`inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out text-lg ${
            isSigningIn ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
          }`}
        >
          {isSigningIn ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign In with Google
            </>
          )}
        </button>
      )}

      {/* Email/Password Sign In */}
      {authMode === 'email' && (
        <div className="w-full max-w-md space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              id="newUser"
              checked={isNewUser}
              onChange={(e) => setIsNewUser(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="newUser">Create new account</label>
          </div>
          <button
            onClick={signInWithEmail}
            disabled={isSigningIn || !email || !password}
            className={`w-full px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out text-lg ${
              isSigningIn || !email || !password ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
            }`}
          >
            {isSigningIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                {isNewUser ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isNewUser ? 'Create Account' : 'Sign In with Email'
            )}
          </button>
        </div>
      )}

      {/* Phone Sign In */}
      {authMode === 'phone' && (
        <div className="w-full max-w-md space-y-4">
          <p className="text-yellow-400 text-sm mb-4">
            * Phone authentication requires a paid Firebase plan
          </p>
          {!confirmationResult ? (
            <>
              <input
                type="tel"
                placeholder="Phone Number (+1234567890)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={signInWithPhone}
                disabled={isSigningIn || !phone}
                className={`w-full px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out text-lg ${
                  isSigningIn || !phone ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
                }`}
              >
                {isSigningIn ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-sm">
                Verification code sent to {phone}
              </p>
              <input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={verifyPhoneCode}
                disabled={isSigningIn || !verificationCode}
                className={`w-full px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 ease-in-out text-lg ${
                  isSigningIn || !verificationCode ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
                }`}
              >
                {isSigningIn ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* reCAPTCHA container for phone auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default SignInPage;
