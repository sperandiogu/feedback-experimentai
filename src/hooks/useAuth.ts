import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Check if user email exists in customer table
          const { data, error: supabaseError } = await supabase
            .from('customer')
            .select('email')
            .eq('email', firebaseUser.email)
            .single();

          if (supabaseError || !data) {
            setIsAuthorized(false);
            setError('Email não autorizado para acessar o sistema');
          } else {
            setIsAuthorized(true);
            setError('');
          }
        } else {
          setUser(null);
          setIsAuthorized(false);
          setError('');
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Erro ao verificar autenticação');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError('Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setIsAuthorized(false);
      setError('');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  return { 
    user, 
    isAuthorized, 
    loading, 
    error, 
    signInWithGoogle, 
    signOut 
  };
};