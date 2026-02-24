import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAccordionFeedback } from '@/hooks/useAccordionFeedback';
import { ProductSection, GeneralSection } from './accordion';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  image_url?: string;
}

interface Edition {
  edition_id: string;
  edition: string;
  products: Product[];
}

interface FeedbackAccordionProps {
  edition: Edition;
  onComplete: (feedbackData: any) => void;
  onExit: () => void;
  onLogout: () => void;
}

const getMotivationalMessage = (percentage: number): { emoji: string; message: string } => {
  if (percentage === 0) return { emoji: '👋', message: 'Vamos começar!' };
  if (percentage < 25) return { emoji: '🚀', message: 'Ótimo começo!' };
  if (percentage < 50) return { emoji: '💪', message: 'Mandando bem!' };
  if (percentage < 75) return { emoji: '🔥', message: 'Está voando!' };
  if (percentage < 100) return { emoji: '⭐', message: 'Quase lá!' };
  return { emoji: '🎉', message: 'Completo!' };
};

const ExitConfirmationModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
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
        <h3 className="text-lg font-semibold text-foreground mb-2">Sair do feedback?</h3>
        <p className="text-foreground/80 mb-6">Seu progresso será perdido. Tem certeza?</p>
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1 rounded-full">
            Continuar
          </Button>
          <Button onClick={onConfirm} variant="destructive" className="flex-1 rounded-full">
            Sair
          </Button>
        </div>
      </div>
    </motion.div>
  </div>
);

export default function FeedbackAccordion({
  edition,
  onComplete,
  onExit,
  onLogout,
}: FeedbackAccordionProps) {
  const [showExitModal, setShowExitModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const {
    sectionStatus,
    answers,
    questions,
    loadingQuestions,
    isSubmitting,
    sections,
    progress,
    canSubmit,
    updateAnswer,
    touchField,
    completeSection,
    getFieldError,
    isFieldTouched,
    buildFeedbackData,
    setSubmitting,
  } = useAccordionFeedback(edition);

  // Build flat list of all steps
  const allSteps = [
    ...edition.products.map((product, index) => ({
      type: 'product' as const,
      id: `product-${index}`,
      product,
      title: product.name,
      subtitle: product.brand,
    })),
    {
      type: 'experimentai' as const,
      id: 'experimentai',
      title: 'Sobre a Experimentaí',
      subtitle: 'Sua experiência com a box',
    },
    {
      type: 'delivery' as const,
      id: 'delivery',
      title: 'Sobre a Entrega',
      subtitle: 'Como foi receber sua box',
    },
  ];

  const currentStepData = allSteps[currentStep];
  const isLastStep = currentStep === allSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowExitModal(true);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleNext = () => {
    if (currentStep < allSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSectionComplete = (sectionId: string) => {
    completeSection(sectionId);
    if (!isLastStep) {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setSubmitting(true);
    const feedbackData = buildFeedbackData();
    onComplete(feedbackData);
  };

  const motivation = getMotivationalMessage(progress.percentage);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-secondary mx-auto mb-4" />
          <p className="text-foreground/80">Preparando seu feedback...</p>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    const sectionId = currentStepData.id;

    if (currentStepData.type === 'product') {
      return (
        <ProductSection
          product={currentStepData.product!}
          questions={questions[sectionId] || []}
          answers={answers[sectionId] || {}}
          loading={loadingQuestions[sectionId] || false}
          editionName={edition.edition}
          onAnswerChange={(qId, value) => updateAnswer(sectionId, qId, value)}
          onFieldBlur={(qId) => touchField(sectionId, qId)}
          getFieldError={(qId) => getFieldError(sectionId, qId)}
          isFieldTouched={(qId) => isFieldTouched(sectionId, qId)}
          onComplete={() => handleSectionComplete(sectionId)}
          isComplete={sectionStatus[sectionId] === 'completed'}
        />
      );
    }

    return (
      <GeneralSection
        questions={questions[sectionId] || []}
        answers={answers[sectionId] || {}}
        loading={loadingQuestions[sectionId] || false}
        editionName={edition.edition}
        onAnswerChange={(qId, value) => updateAnswer(sectionId, qId, value)}
        onFieldBlur={(qId) => touchField(sectionId, qId)}
        getFieldError={(qId) => getFieldError(sectionId, qId)}
        isFieldTouched={(qId) => isFieldTouched(sectionId, qId)}
        onComplete={() => handleSectionComplete(sectionId)}
        isComplete={sectionStatus[sectionId] === 'completed'}
        isFinalSection={isLastStep}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{motivation.emoji}</span>
              <span className="text-sm font-medium text-foreground/80">{motivation.message}</span>
            </div>
            <button
              onClick={() => setShowExitModal(true)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <Progress value={progress.percentage} className="h-1.5" />
        </div>
      </header>

      {/* Step indicator */}
      <div className="max-w-md mx-auto w-full px-4 py-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {currentStepData.type === 'product' && <Package className="w-4 h-4" />}
            {currentStepData.type === 'experimentai' && <Package className="w-4 h-4" />}
            {currentStepData.type === 'delivery' && <Truck className="w-4 h-4" />}
            <span>{currentStep + 1} de {allSteps.length}</span>
          </div>
        </div>
      </div>

      {/* Current step title */}
      <div className="max-w-md mx-auto w-full px-4 pb-4">
        <h1 className="text-xl font-semibold text-foreground">{currentStepData.title}</h1>
        {currentStepData.subtitle && (
          <p className="text-sm text-muted-foreground">{currentStepData.subtitle}</p>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepData.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation footer */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button
            onClick={handlePrev}
            variant="ghost"
            disabled={isFirstStep}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar
          </Button>

          {isLastStep && canSubmit ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-full px-6"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Enviar Feedback'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isLastStep}
              variant="ghost"
              className="rounded-full"
            >
              Pular
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </footer>

      {/* Exit modal */}
      <AnimatePresence>
        {showExitModal && (
          <ExitConfirmationModal
            onConfirm={onLogout}
            onCancel={() => setShowExitModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
