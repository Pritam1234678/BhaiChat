import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { saveUserConversations, loadUserConversations, clearCachedConversations, testFirestoreAccess } from '../utils/firestoreChat';

// Hook to sync chat with Firestore for the current Firebase user
export function useFirestoreChatSync(conversations, setConversations) {
  const [user] = useAuthState(auth);

  // Load conversations on login - preserve existing data for same user
  useEffect(() => {
    if (user && user.uid) {
      console.log(`Loading conversations for user: ${user.uid}`);
      
      // First test Firestore access
      testFirestoreAccess(user.uid).then((accessOk) => {
        if (!accessOk) {
          console.error('Firestore access test failed');
          return;
        }
        
        // If access is OK, load conversations
        return loadUserConversations(user.uid);
      }).then((loaded) => {
        if (loaded && loaded.length > 0) {
          console.log(`Found ${loaded.length} conversations in Firestore`);
          setConversations(loaded);
        } else {
          console.log('No conversations found in Firestore for this user');
        }
      }).catch(error => {
        console.error('Error in conversation loading process:', error);
      });
    } else {
      // Clear conversations when user logs out
      console.log('User logged out, clearing conversations');
      setConversations([]);
    }
    // eslint-disable-next-line
  }, [user?.uid]);

  // Save conversations on change
  useEffect(() => {
    if (user && user.uid && conversations.length > 0) {
      console.log(`Saving ${conversations.length} conversations for user: ${user.uid}`);
      saveUserConversations(user.uid, conversations);
    }
    // eslint-disable-next-line
  }, [conversations, user?.uid]);
}
