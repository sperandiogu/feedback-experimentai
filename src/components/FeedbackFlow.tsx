import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionsService, type Question } from '@/entities/Questions';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Loader2, Package, Truck, ChevronLeft } from 'lucide-react';

// Import new step components
import WelcomeStep from './steps/WelcomeStep';
import ProductFeedbackStep from './steps/ProductFeedbackStep';
import GeneralFeedbackStep from './steps/GeneralFeedbackStep';

const ExitConfirmationModal = ({ onConfirm, onCancel }: any) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Sair do feedback?
          </h3>
          <p className="text-foreground/80 mb-6">
            Seu progresso será perdido. Tem certeza que deseja sair?
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 rounded-full"
            >
              Continuar
            </Button>
            <Button
              onClick={onConfirm}
              variant="destructive"
              className="flex-1 rounded-full"
            >
              Sair
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface FeedbackFlowProps {
  edition: any;
  onComplete: (feedbackData: any) => void;
  onExit: () => void;
  onLogout: () => void;
}

type Step = 'welcome' | 'products' | 'experimentai' | 'delivery';

export default function FeedbackFlow({ edition, onComplete, onExit, onLogout }: FeedbackFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [generalQuestions, setGeneralQuestions] = useState<Record<string, Question[]>>({});
  const [productQuestionsCache, setProductQuestionsCache] = useState<Record<string, Question[]>>({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>({
    product_feedbacks: [],
    experimentai_feedback: {},
    delivery_feedback: {}
  });
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const [expQuestions, delQuestions] = await Promise.all([
          QuestionsService.getQuestionsByCategory('experimentai'),
          QuestionsService.getQuestionsByCategory('delivery')
        ]);
        setGeneralQuestions({
          experimentai: expQuestions,
          delivery: delQuestions
        });
      } catch (error) {
        console.error('Error loading general questions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    const prefetchNextProductQuestions = async () => {
      if (step === 'products' && currentProductIndex < edition.products.length - 1) {
        const nextProduct = edition.products[currentProductIndex + 1];
        if (nextProduct && !productQuestionsCache[nextProduct.id]) {
          try {
            const questions = await QuestionsService.getQuestionsByCategoryAndProduct('product', nextProduct.id);
            setProductQuestionsCache(prev => ({
              ...prev,
              [nextProduct.id]: questions
            }));
          } catch (error) {
            console.error(`Error pre-fetching questions for product ${nextProduct.name}:`, error);
          }
        }
      }
    };
    prefetchNextProductQuestions();
  }, [step, currentProductIndex, edition.products, productQuestionsCache]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowExitModal(true);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleStart = () => setStep('products');

  const handleBack = () => {
    if (isSubmitting) return;

    if (step === 'delivery') {
      setStep('experimentai');
    } else if (step === 'experimentai') {
      setCurrentProductIndex(edition.products.length - 1);
      setStep('products');
    } else if (step === 'products' && currentProductIndex > 0) {
      setCurrentProductIndex(prev => prev - 1);
    }
  };

  const handleProductFeedback = (productFeedback: any) => {
    const updatedFeedbacks = [...feedback.product_feedbacks];
    updatedFeedbacks[currentProductIndex] = productFeedback;
    setFeedback(prev => ({ ...prev, product_feedbacks: updatedFeedbacks }));

    if (currentProductIndex < edition.products.length - 1) {
      setCurrentProductIndex(prev => prev + 1);
    } else {
      setStep('experimentai');
    }
  };

  const handleExperimentaiFeedback = (expFeedback: any) => {
    setFeedback(prev => ({ ...prev, experimentai_feedback: expFeedback }));
    setStep('delivery');
  };

  const handleDeliveryFeedback = (delFeedback: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const finalFeedback = {
      ...feedback,
      delivery_feedback: delFeedback,
      edition_id: edition.edition_id,
      completion_badge: "🎉 Testador Expert da Experimentaí"
    };
    onComplete(finalFeedback);
  };

  const handleExitConfirm = () => {
    onLogout();
  };

  const totalSteps = edition.products.length + 2; // products + experimentai + delivery
  const progressIndex = 
    step === 'welcome' ? -1 :
    step === 'products' ? currentProductIndex :
    step === 'experimentai' ? edition.products.length :
    edition.products.length + 1;
  const progress = ((progressIndex + 1) / totalSteps) * 100;
  const canGoBack = step === 'delivery' || step === 'experimentai' || (step === 'products' && currentProductIndex > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-secondary mx-auto mb-4" />
          <p className="text-foreground/80">Carregando tudo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 font-sans">
      <div className="max-w-md mx-auto pt-4 sm:pt-8">
        {step !== 'welcome' && (
          <header className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4 px-2">
              <img
                src="https://app.experimentai.com.br/LogoTipo.png"
                alt="ExperimentAI"
                className="w-32"
              />
              <Badge variant="secondary" className="bg-primary/20 text-secondary text-sm font-semibold border-none">
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200 [&>div]:bg-primary" />
          </header>
        )}

        <main>
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <WelcomeStep
                key="welcome"
                editionName={edition.edition}
                productCount={edition.products.length}
                onStart={handleStart}
              />
            )}

            {step === 'products' && (
              <ProductFeedbackStep
                key={currentProductIndex}
                product={edition.products[currentProductIndex]}
                onComplete={handleProductFeedback}
                currentIndex={currentProductIndex}
                totalProducts={edition.products.length}
                onExitRequest={() => setShowExitModal(true)}
                onBack={handleBack}
                canGoBack={canGoBack}
                initialAnswers={feedback.product_feedbacks[currentProductIndex]?.answers}
                cachedQuestions={productQuestionsCache[edition.products[currentProductIndex].id]}
              />
            )}

            {step === 'experimentai' && (
              <GeneralFeedbackStep
                key="experimentai"
                title="Sobre a Experimentaí"
                subtitle="Sua experiência com a nossa box!"
                icon={<Package className="w-10 h-10 text-secondary" />}
                questions={generalQuestions.experimentai || []}
                onComplete={handleExperimentaiFeedback}
                onExitRequest={() => setShowExitModal(true)}
                editionName={edition.edition}
                onBack={handleBack}
                initialAnswers={feedback.experimentai_feedback?.answers}
              />
            )}

            {step === 'delivery' && (
              <GeneralFeedbackStep
                key="delivery"
                title="Sobre a entrega"
                subtitle="Quase lá! Como foi receber sua box?"
                icon={<Truck className="w-10 h-10 text-secondary" />}
                questions={generalQuestions.delivery || []}
                onComplete={handleDeliveryFeedback}
                onExitRequest={() => setShowExitModal(true)}
                isFinalStep
                onBack={handleBack}
                initialAnswers={feedback.delivery_feedback?.answers}
              />
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {showExitModal && (
            <ExitConfirmationModal
              onConfirm={handleExitConfirm}
              onCancel={() => setShowExitModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}