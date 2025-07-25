// Environment variable validation
export const validateEnvVars = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_GEMINI_API_KEY'
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    console.error('Please check your .env file and ensure all required variables are set.');
    return false;
  }
  
  console.log('✅ All required environment variables are loaded');
  return true;
};

// Get environment variables with fallbacks and validation
export const getEnvVar = (varName, fallback = null) => {
  const value = import.meta.env[varName];
  if (!value && !fallback) {
    console.warn(`Environment variable ${varName} is not set`);
  }
  return value || fallback;
};
