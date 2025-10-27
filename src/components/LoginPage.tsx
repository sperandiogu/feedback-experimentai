import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, Star, Shield, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface LoginPageProps {
  onSignIn: (email: string) => Promise<void>;
  error: string | null;
}

export default function LoginPage({ onSignIn, error }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setShowFeatures(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Por favor, insira seu email');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);
    try {
      await onSignIn(email.toLowerCase().trim());
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-background/80 backdrop-blur-sm border-none shadow-xl rounded-3xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <img
                  src="https://app.experimentai.com.br/LogoTipo.png"
                  alt="ExperimentAI"
                  className="w-48 mx-auto mb-6"
                />
                <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo!</h2>
                <p className="text-foreground/80">
                  Faça login para avaliar produtos e compartilhar sua experiência
                </p>
              </div>

              {(error || emailError) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">Erro no login</p>
                    <p className="text-destructive/80">{error || emailError}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email da assinatura
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      placeholder="seu@email.com"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-base font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-foreground/60">
                  Use o email da sua assinatura para acessar
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}