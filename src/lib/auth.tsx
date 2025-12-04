
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User as FirebaseUser, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useUser as useFirebaseUser, useAuth as useFirebaseAuth, useFirestore } from '@/firebase';

// Simplified User type, you can expand this from the firebase user object if needed
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<any | void>;
  signup: (name: string, email: string, pass: string, role: 'user' | 'admin', adminKey?: string) => Promise<any | void>;
  logout: () => void;
  updateUserProfile: (name: string) => Promise<any | void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple, insecure key stored on the client. In a real production app,
// this should be a server-side check against a secure value.
const ADMIN_KEY = 'Admin1234@';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: firebaseUser, isUserLoading } = useFirebaseUser();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthChange = async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: userData.role || 'user',
          });
        } else {
           setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: 'user', // Default role if doc doesn't exist
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    handleAuthChange(firebaseUser);
  }, [firebaseUser, firestore]);
  
  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({
          title: "Connexion réussie",
          description: "Bon retour sur Ev - Télé!",
      });
    } catch (error) {
        console.error("Login failed", error);
        return error;
    }
  };
  
  const signup = async (name: string, email: string, pass: string, role: 'user' | 'admin', adminKey?: string) => {
    if (role === 'admin' && adminKey !== ADMIN_KEY) {
        throw new Error("La clé d'administration n'est pas correcte");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      const finalRole = role === 'admin' ? 'admin' : 'user';

      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        id: userCredential.user.uid,
        username: name,
        email: email,
        joinDate: new Date().toISOString(),
        role: finalRole
      });

      toast({
          title: "Inscription réussie",
          description: "Bienvenue sur Ev - Télé!",
      });
    } catch(error) {
       console.error("Signup failed", error);
       throw error;
    }
  };
  
  const updateUserProfile = async (name: string) => {
    if (!auth.currentUser) {
        throw new Error("Aucun utilisateur n'est connecté.");
    }

    try {
        await updateProfile(auth.currentUser, { displayName: name });

        const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, { username: name });
        
        setUser(prevUser => prevUser ? { ...prevUser, displayName: name } : null);

        toast({
            title: "Profil mis à jour",
            description: "Votre nom d'utilisateur a été modifié avec succès.",
        });

    } catch (error) {
        console.error("Update profile failed", error);
        throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Déconnecté",
        description: "Vous avez été déconnecté avec succès.",
      });
      router.push('/');
    } catch (error) {
      console.error("Logout failed", error);
       toast({
            variant: "destructive",
            title: "Échec de la déconnexion",
            description: "Une erreur est survenue.",
        });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUserProfile, loading: loading || isUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
