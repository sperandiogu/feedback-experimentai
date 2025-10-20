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
      
      // Get current user first (for email verification)
      let userEmail: string | null = null;
      try {
        const user = await User.me();
        setCurrentUser(user);
        userEmail = user?.email || null;
      } catch (error) {
        console.warn('Could not load user, proceeding with anonymous session');
        setCurrentUser(null);
      }

      // Load current edition
      let currentEditionData: EditionWithProducts | null = null;
      try {
        const editions = await EditionService.list('-created_at', 1);
        if (editions.length > 0) {
          currentEditionData = editions[0];
          setCurrentEdition(currentEditionData);
          setDbConnected(true);
        } else {
          setError('Nenhuma edição encontrada para avaliação no momento.');
          setDbConnected(false);
          return;
        }
      } catch (error) {
        console.error('Error loading editions:', error);
        setError('Erro ao carregar edições. Verifique sua conexão com o banco de dados.');
        setDbConnected(false);
        return;
      }

      // CRITICAL: Check if feedback already exists BEFORE showing any questions
      if (currentEditionData && userEmail) {
        console.log(`Checking for existing feedback: edition=${currentEditionData.edition_id}, user=${userEmail}`);
        try {
          const hasSubmitted = await Feedback.hasUserSubmittedFeedback(
            currentEditionData.edition_id, 
            userEmail
          );
          
          console.log(`User ${userEmail} ${hasSubmitted ? 'HAS ALREADY' : 'has NOT'} submitted feedback for edition ${currentEditionData.edition}`);
          setAlreadySubmitted(hasSubmitted);
          
          if (hasSubmitted) {
            console.log('Blocking access: User already submitted feedback for this edition');
            return; // Stop here - don't load anything else
          }
        } catch (error) {
          console.error('Error checking existing feedback:', error);
          setError('Erro ao verificar se você já enviou feedback para esta edição. Por segurança, não é possível continuar.');
          return; // Fail safe - don't allow if we can't verify
        }
      } else if (currentEditionData && !userEmail) {
        // For anonymous users, we could implement IP-based checking or other methods
        console.warn('Anonymous user detected - cannot check for existing feedback by email');
        // For now, allow anonymous users to proceed, but this could be adjusted based on requirements
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
      "Feedback já enviado!",
      `Obrigado! Você já enviou seu feedback para a edição "${currentEdition?.edition}". Cada pessoa pode avaliar apenas uma vez por mês para garantir a qualidade dos dados.`,
      "Ir para o site principal",
      () => {
        // Redirect to main website
        window.location.href = 'https://experimentai.com.br';
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