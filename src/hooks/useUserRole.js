// src/hooks/useUserRole.js
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const useUserRole = () => {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, 'usersDB', user.email));
          
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            console.log('User document not found');
            setRole(null);
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { role, isLoading };
};

export default useUserRole;