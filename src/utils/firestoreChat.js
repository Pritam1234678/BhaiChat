import { collection, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Clear any cached conversations (for security purposes)
export function clearCachedConversations() {
  try {
    // Clear any local storage that might contain conversation data
    localStorage.removeItem('conversations');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('userConversations');
  } catch (error) {
    console.error('Error clearing cached conversations:', error);
  }
}

// Test function to verify Firestore access
export async function testFirestoreAccess(userId) {
  if (!userId) {
    console.log('No userId provided for test');
    return false;
  }
  try {
    console.log(`Testing Firestore access for user: ${userId}`);
    const userDoc = doc(db, 'users', userId);
    
    // Try to write test data
    await setDoc(userDoc, { test: 'access_test', timestamp: new Date().toISOString() }, { merge: true });
    console.log('✅ Write test successful');
    
    // Try to read test data
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      console.log('✅ Read test successful');
      console.log('Document data:', docSnap.data());
      return true;
    } else {
      console.log('❌ Document does not exist after write');
      return false;
    }
  } catch (error) {
    console.error('❌ Firestore access test failed:', error);
    return false;
  }
}

// Save all conversations for a user
export async function saveUserConversations(userId, conversations) {
  if (!userId) {
    console.log('No userId provided for saving conversations');
    return;
  }
  try {
    console.log(`Saving ${conversations.length} conversations for user ${userId}`);
    const userDoc = doc(db, 'users', userId);
    await setDoc(userDoc, { conversations });
    console.log('Conversations saved successfully');
  } catch (error) {
    console.error('Error saving conversations:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied - user can only access their own data');
    }
  }
}

// Load all conversations for a user
export async function loadUserConversations(userId) {
  if (!userId) {
    console.log('No userId provided for loading conversations');
    return [];
  }
  try {
    console.log(`Loading conversations for user ${userId}`);
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      const data = docSnap.data().conversations || [];
      console.log(`Loaded ${data.length} conversations for user ${userId}`);
      return data;
    } else {
      console.log(`No conversations found for user ${userId}`);
      return [];
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied - user can only access their own data');
    }
    return [];
  }
}
