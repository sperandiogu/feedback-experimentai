import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/entities/User';
import { EditionService } from '@/entities/Box';
import { Feedback } from '@/entities/Feedback';
import FeedbackFlow from '../components/FeedbackFlow';
import CompletionBadge from '../components/CompletionBadge';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package, AlertCircle } from 'lucide-react';
import { checkDatabaseConnection } from '@/lib/supabase';
import type { Customer, EditionWithProducts } from '@/types/database';

export default function FeedbackPage() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);
  const [currentEdition, setCurrentEdition] = useState<EditionWithProducts | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionBadge, setCompletionBadge] = useState('');
  const [error, setError] = useState('');
  const [dbConnected, setDbConnected] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    loadUserAndEdition();
  }, []);

  const loadUserAndEdition = async () => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.warn('Could not load user, proceeding with anonymous session');
        setCurrentUser(null);
      }

      try {
        const editions = await EditionService.list('-created_at', 1);
        if (editions.length > 0) {
          setCurrentEdition(editions[0]);
          setDbConnected(true);
          
          // Check if user already submitted feedback for this edition
          if (currentUser) {
            try {
              const hasSubmitted = await Feedback.hasUserSubmittedFeedback(
                editions[0].edition_id, 
                currentUser.email
              );
              setAlreadySubmitted(hasSubmitted);
            } catch (error) {
              console.error('Error checking if user already submitted feedback:', error);
              // In case of error checking, we'll show an error message instead of allowing proceed
              setError('Erro ao verificar se você já enviou feedback para esta edição. Tente novamente.');
              return;
            }
          }
        } else {
          setError('Nenhuma edição encontrada para avaliação no momento.');
          setDbConnected(false);
        }
      } catch (error) {
        console.error('Error loading editions:', error);
        setError('Erro ao carregar edições. Verifique sua conexão com o banco de dados.');
        setDbConnected(false);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar seus dados. Por favor, tente novamente.');
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackComplete = async (feedbackData: any) => {
    try {
      setLoading(true);
      
      // Create feedback session with proper data structure
      
      try {
        const result = await Feedback.create({
          ...feedbackData,
          user_email: currentUser?.email || 'anonymous@example.com',
          edition_id: currentEdition?.edition_id
        });

        if (result.success) {
          console.log('Feedback saved successfully:', result.sessionId);
          
          // No need to update user data when using webhook
        }
      } catch (saveError) {
        console.error('Error sending feedback:', saveError);
        setError('Erro ao enviar feedback. Tente novamente.');
        console.error('Error creating feedback session:', saveError);
        throw new Error(`Failed to create feedback session: ${saveError.message}`);
      }

      setCompletionBadge(feedbackData.completion_badge);
      setShowCompletion(true);
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
      setError('Ocorreu um erro ao enviar seu feedback. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletionClose = () => {
    setShowCompletion(false);
    window.location.reload();
  };

  const handleFeedbackExit = () => {
    signOut();
  };

  const handleLogout = () => {
    signOut();
  };

  const renderStateCard = (icon: React.ReactNode, title: string, message: string, buttonText: string | null = null, buttonAction: (() => void) | null = null) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="bg-white border-none shadow-xl max-w-sm w-full rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-6">
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          {buttonText && (
            <Button 
              onClick={buttonAction}
              className="w-full bg-purple-600 hover:bg-purple-700 text-base py-3 rounded-full"
            >
              {buttonText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return renderStateCard(
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />,
      "Carregando sua edição...",
      "Preparando tudo para você avaliar os produtos!"
    );
  }

  if (error) {
    return renderStateCard(
      <AlertCircle className="w-8 h-8 text-red-500" />,
      "Ops! Algo deu errado",
      error,
      "Tentar novamente",
      () => window.location.reload()
    );
  }

  if (!currentEdition) {
    return renderStateCard(
      <Package className="w-8 h-8 text-purple-600" />,
      "Nenhuma edição para avaliar",
      "Fique de olho! Sua próxima edição para avaliação aparecerá aqui em breve."
    );
  }

  if (alreadySubmitted) {
    return renderStateCard(
      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-white text-lg font-bold">✓</span>
      </div>,
      "Você já participou!",
      `Obrigado! Você já enviou seu feedback para a edição "${currentEdition?.edition}". Cada pessoa pode avaliar apenas uma vez por mês para garantir a qualidade dos dados.`,
      "Voltar ao início",
      () => {
        // Clear any cached data and go back to login
        window.location.href = '/';
      }
    );
  }

  return (
    <>
      <FeedbackFlow 
        edition={currentEdition}
        onComplete={handleFeedbackComplete}
        onExit={handleFeedbackExit}
        onLogout={handleLogout}
      />
      
      {showCompletion && (
        <CompletionBadge 
          badge={completionBadge}
          onClose={handleCompletionClose}
        />
      )}
    </>
  );
}