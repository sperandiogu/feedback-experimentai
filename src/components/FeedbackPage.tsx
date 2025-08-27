import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Box } from '@/entities/Box';
import { Feedback } from '@/entities/Feedback';
import FeedbackFlow from './FeedbackFlow';
import CompletionBadge from './CompletionBadge';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package, AlertCircle } from 'lucide-react';

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentBox, setCurrentBox] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionBadge, setCompletionBadge] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserAndBox();
  }, []);

  const loadUserAndBox = async () => {
    try {
      setLoading(true);
      setError('');
      
      const user = await User.me();
      setCurrentUser(user);

      const boxes = await Box.list('-created_date', 1);
      if (boxes.length > 0) {
        setCurrentBox(boxes[0]);
      } else {
        setError('Nenhuma box encontrada para avaliação no momento.');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar seus dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackComplete = async (feedbackData: any) => {
    try {
      setLoading(true);
      
      await Feedback.create({
        ...feedbackData,
        user_email: currentUser?.email
      });

      await User.updateMyUserData({
        boxes_received: (currentUser?.boxes_received || 0) + 1
      });

      setCompletionBadge(feedbackData.completion_badge);
      setShowCompletion(true);
    } catch (err) {
      console.error('Erro ao salvar feedback:', err);
      setError('Ocorreu um erro ao salvar seu feedback. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletionClose = () => {
    setShowCompletion(false);
    window.location.reload();
  };

  const renderStateCard = (icon: any, title: string, message: string, buttonText: string | null = null, buttonAction: any = null) => (
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
      "Carregando sua box...",
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

  if (!currentBox) {
    return renderStateCard(
      <Package className="w-8 h-8 text-purple-600" />,
      "Nenhuma box para avaliar",
      "Fique de olho! Sua próxima box para avaliação aparecerá aqui em breve."
    );
  }

  return (
    <>
      <FeedbackFlow 
        box={currentBox}
        onComplete={handleFeedbackComplete}
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