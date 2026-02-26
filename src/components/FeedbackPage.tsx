import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/entities/User';
import { EditionService } from '@/entities/Box';
import { Feedback } from '@/entities/Feedback';
import FeedbackAccordion from './FeedbackAccordion';
import CompletionBadge from './CompletionBadge';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package, AlertCircle } from 'lucide-react';
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

      let userEmail: string | null = null;
      try {
        const user = await User.me();
        setCurrentUser(user);
        userEmail = user?.email || null;
      } catch (error) {
        console.warn('Could not load user, proceeding with anonymous session');
        setCurrentUser(null);
      }

      if (!userEmail) {
        console.warn('Anonymous user detected - cannot determine unanswered editions');
        try {
          const editions = await EditionService.list('-created_at', 1);
          if (editions.length > 0) {
            setCurrentEdition(editions[0]);
            setDbConnected(true);
          } else {
            setError('Nenhuma edição encontrada para avaliação no momento.');
          }
        } catch (error) {
          console.error('Error loading editions:', error);
          setError('Erro ao carregar edições. Verifique sua conexão com o banco de dados.');
          setDbConnected(false);
        }
        return;
      }

      try {
        const pendingEdition = await EditionService.getOldestUnansweredEdition(userEmail);
        setDbConnected(true);

        if (!pendingEdition) {
          setAlreadySubmitted(true);
          try {
            const editions = await EditionService.list('-created_at', 1);
            if (editions.length > 0) {
              setCurrentEdition(editions[0]);
            }
          } catch {
            // not critical
          }
          return;
        }

        setCurrentEdition(pendingEdition);
      } catch (error) {
        console.error('Error loading edition:', error);
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
          // Mark as already submitted to prevent double submission
          setAlreadySubmitted(true);
        }
      } catch (saveError) {
        console.error('Error sending feedback:', saveError);
        setError('Erro ao enviar feedback. Tente novamente.');
        console.error('Error creating feedback session:', saveError);
        return; // Don't continue to completion if saving failed
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
    // Redirect to main website after completion
    window.location.href = 'https://experimentai.com.br';
  };

  const handleFeedbackExit = () => {
    signOut();
  };

  const handleLogout = () => {
    signOut();
  };

  const renderStateCard = (icon: React.ReactNode, title: string, message: string, buttonText: string | null = null, buttonAction: (() => void) | null = null) => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="bg-background border-none shadow-xl max-w-sm w-full rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center mb-6">
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-foreground/80 mb-6">{message}</p>
          {buttonText && (
            <Button 
              onClick={buttonAction}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-full"
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
      <Loader2 className="w-8 h-8 animate-spin text-secondary" />,
      "Carregando sua edição...",
      "Preparando tudo para você avaliar os produtos!"
    );
  }

  if (error) {
    return renderStateCard(
      <AlertCircle className="w-8 h-8 text-destructive" />,
      "Ops! Algo deu errado",
      error,
      "Tentar novamente",
      () => window.location.reload()
    );
  }

  if (!currentEdition) {
    return renderStateCard(
      <Package className="w-8 h-8 text-secondary" />,
      "Nenhuma edição para avaliar",
      "Fique de olho! Sua próxima edição para avaliação aparecerá aqui em breve."
    );
  }

  if (alreadySubmitted) {
    return renderStateCard(
      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
        <span className="text-secondary-foreground text-lg font-bold">✓</span>
      </div>,
      "Tudo respondido!",
      "Obrigado! Voce ja avaliou todas as edicoes disponiveis. Quando uma nova edicao for entregue, ela aparecera aqui para voce avaliar.",
      "Ir para o site principal",
      () => {
        window.location.href = 'https://experimentai.com.br';
      }
    );
  }

  return (
    <>
      <FeedbackAccordion
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