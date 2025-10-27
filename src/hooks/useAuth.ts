import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('user_email');
    if (storedEmail) {
      validateEmail(storedEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const validateEmail = async (email: string) => {
    try {
      setLoading(true);
      setError('');

      const { data, error: supabaseError } = await supabase
        .from('customer')
        .select('email, customer_id, name')
        .eq('email', email)
        .maybeSingle();

      if (supabaseError) {
        console.error('Error checking customer:', supabaseError);
        setError('Erro ao validar email. Tente novamente.');
        setIsAuthorized(false);
        setUserEmail(null);
        localStorage.removeItem('user_email');
        return;
      }

      if (!data) {
        setError('Email não encontrado. Você precisa ter uma assinatura ativa para acessar.');
        setIsAuthorized(false);
        setUserEmail(null);
        localStorage.removeItem('user_email');
        return;
      }

      setUserEmail(email);
      setIsAuthorized(true);
      setError('');
      localStorage.setItem('user_email', email);
    } catch (err) {
      console.error('Validation error:', err);
      setError('Erro ao verificar assinatura');
      setIsAuthorized(false);
      setUserEmail(null);
      localStorage.removeItem('user_email');
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
      localStorage.removeItem('user_email');
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
