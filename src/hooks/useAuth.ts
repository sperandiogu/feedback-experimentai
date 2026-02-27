import { useState, useEffect } from 'react';
import { supabasePublic } from '../lib/supabase';

const safeGetItem = (key: string): string | null => {
  try { return localStorage.getItem(key); } catch { return null; }
};

const safeSetItem = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* iframe context */ }
};

const safeRemoveItem = (key: string) => {
  try { localStorage.removeItem(key); } catch { /* iframe context */ }
};

export const useAuth = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get('email');
    const storedEmail = safeGetItem('user_email');

    if (emailFromUrl) {
      validateEmail(emailFromUrl);
    } else if (storedEmail) {
      validateEmail(storedEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const validateEmail = async (email: string) => {
    try {
      setLoading(true);
      setError('');

      const { data, error: supabaseError } = await supabasePublic
        .from('customer')
        .select('email, customer_id, name')
        .eq('email', email)
        .maybeSingle();

      if (supabaseError) {
        console.error('Error checking customer:', JSON.stringify(supabaseError, null, 2));
        setError('Erro ao validar email. Tente novamente.');
        setIsAuthorized(false);
        setUserEmail(null);
        safeRemoveItem('user_email');
        return;
      }

      if (!data) {
        setError('Email não encontrado. Você precisa ter uma assinatura ativa para acessar.');
        setIsAuthorized(false);
        setUserEmail(null);
        safeRemoveItem('user_email');
        return;
      }

      setUserEmail(email);
      setIsAuthorized(true);
      setError('');
      safeSetItem('user_email', email);
    } catch (err) {
      console.error('Validation error:', err);
      setError('Erro ao verificar assinatura');
      setIsAuthorized(false);
      setUserEmail(null);
      safeRemoveItem('user_email');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string) => {
    await validateEmail(email);
  };

  const signOut = async () => {
    try {
      setLoading(true);
      safeRemoveItem('user_email');
      setUserEmail(null);
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
    user: userEmail ? { email: userEmail } : null,
    isAuthorized,
    loading,
    error,
    signIn,
    signOut
  };
};
