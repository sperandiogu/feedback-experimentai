import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QuestionsService, type Question } from '@/entities/Questions';
import DynamicQuestionRenderer from '../DynamicQuestionRenderer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, X, Loader2, ChevronLeft, Package, AlertCircle, RefreshCw } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
};

interface ProductFeedbackStepProps {
  product: any;
  onComplete: (feedback: any) => void;
  currentIndex: number;
  totalProducts: number;
  onExitRequest: () => void;
  onBack: () => void;
  canGoBack: boolean;
  initialAnswers?: any[];
  cachedQuestions?: Question[];
}

export default function ProductFeedbackStep({
  product,
  onComplete,
  currentIndex,
  totalProducts,
  onExitRequest,
  onBack,
  canGoBack,
  initialAnswers,
  cachedQuestions
}: ProductFeedbackStepProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Question[]>(cachedQuestions || []);
  const [loading, setLoading] = useState(!cachedQuestions);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (initialAnswers) {
      const initialData = initialAnswers.reduce((acc, ans) => {
        acc[ans.question_id] = ans.answer;
        return acc;
      }, {});
      setAnswers(initialData);
    }
  }, [initialAnswers]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (cachedQuestions) {
        setQuestions(cachedQuestions);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const productQuestions = await QuestionsService.getQuestionsByCategoryAndProduct('product', product.id);
        setQuestions(productQuestions);
        setError(null);
      } catch (err) {
        console.error(`Error loading questions for product ${product.name}:`, err);
        setError('Não foi possível carregar as perguntas. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [product.id, cachedQuestions, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!isComplete) {
      setShowValidation(true);
      return;
    }

    const answersWithDetails = questions.map(q => ({
      question_id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      answer: answers[q.id]
    }));

    onComplete({ product_name: product.name, answers: answersWithDetails });
  };

  const isComplete = questions
    .filter(q => q.is_required)
    .every(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '');

  if (loading) {
    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
        <Card className="bg-background border-none shadow-xl rounded-3xl">
          <CardContent className="p-6 text-center h-96 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-secondary mb-4" />
            <p className="text-foreground/80">Carregando perguntas para {product.name}...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
        <Card className="bg-background border-none shadow-xl rounded-3xl overflow-hidden">
          <div className="flex justify-between items-center p-4 pb-0">
            <Button
              onClick={onExitRequest}
              variant="ghost"
              size="sm"
              className="text-foreground/40 hover:text-foreground/60 hover:bg-muted/50 rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </Button>
            <span className="text-xs text-foreground/40">ESC para sair</span>
          </div>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className={`w-full aspect-square max-w-[160px] mx-auto mb-4 rounded-xl flex items-center justify-center overflow-hidden`}>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="w-12 h-12 text-foreground/30" />
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
              <p className="text-sm text-foreground/60">{product.brand}</p>
              <Badge variant="secondary" className="mt-2 bg-primary/20 text-secondary border-none">{product.category}</Badge>
            </div>

            <div className="bg-destructive/10 rounded-2xl p-6 text-center my-8">
              <AlertCircle className="w-12 h-12 text-destructive/80 mx-auto mb-3" />
              <p className="text-foreground/80 font-medium mb-2">
                Erro ao carregar perguntas
              </p>
              <p className="text-sm text-foreground/60 mb-4">
                {error}
              </p>
              <Button
                onClick={handleRetry}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                {canGoBack && (
                  <Button
                    onClick={onBack}
                    variant="ghost"
                    className="text-foreground/80 hover:text-foreground rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Voltar
                  </Button>
                )}
              </div>
              <span className="text-sm font-medium text-foreground/60">
                {currentIndex + 1} / {totalProducts}
              </span>
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 px-6 rounded-full shadow-md hover:shadow-lg"
              >
                Pular <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
        <Card className="bg-background border-none shadow-xl rounded-3xl overflow-hidden">
          <div className="flex justify-between items-center p-4 pb-0">
            <Button
              onClick={onExitRequest}
              variant="ghost"
              size="sm"
              className="text-foreground/40 hover:text-foreground/60 hover:bg-muted/50 rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </Button>
            <span className="text-xs text-foreground/40">ESC para sair</span>
          </div>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className={`w-full aspect-square max-w-[160px] mx-auto mb-4 rounded-xl flex items-center justify-center overflow-hidden`}>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="w-12 h-12 text-foreground/30" />
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
              <p className="text-sm text-foreground/60">{product.brand}</p>
              <Badge variant="secondary" className="mt-2 bg-primary/20 text-secondary border-none">{product.category}</Badge>
            </div>

            <div className="bg-muted/30 rounded-2xl p-6 text-center my-8">
              <Package className="w-12 h-12 text-foreground/40 mx-auto mb-3" />
              <p className="text-foreground/80 font-medium mb-2">
                Sem perguntas específicas
              </p>
              <p className="text-sm text-foreground/60">
                Este produto ainda não possui perguntas personalizadas. Você pode continuar para o próximo produto.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                {canGoBack && (
                  <Button
                    onClick={onBack}
                    variant="ghost"
                    className="text-foreground/80 hover:text-foreground rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Voltar
                  </Button>
                )}
              </div>
              <span className="text-sm font-medium text-foreground/60">
                {currentIndex + 1} / {totalProducts}
              </span>
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 px-6 rounded-full shadow-md hover:shadow-lg"
              >
                Próximo <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
      <Card className="bg-background border-none shadow-xl rounded-3xl overflow-hidden">
        <div className="flex justify-between items-center p-4 pb-0">
          <Button
            onClick={onExitRequest}
            variant="ghost"
            size="sm"
            className="text-foreground/40 hover:text-foreground/60 hover:bg-muted/50 rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <span className="text-xs text-foreground/40">ESC para sair</span>
        </div>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className={`w-full aspect-square max-w-[160px] mx-auto mb-4 rounded-xl flex items-center justify-center overflow-hidden`}>
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <Package className="w-12 h-12 text-foreground/30" />
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
            <p className="text-sm text-foreground/60">{product.brand}</p>
            <Badge variant="secondary" className="mt-2 bg-primary/20 text-secondary border-none">{product.category}</Badge>
          </div>

          <div className="space-y-8">
            {questions.map(question => (
              <div key={question.id}>
                <DynamicQuestionRenderer
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  showValidation={showValidation}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div>
              {canGoBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="text-foreground/80 hover:text-foreground rounded-full"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Voltar
                </Button>
              )}
            </div>
            <span className="text-sm font-medium text-foreground/60">
              {currentIndex + 1} / {totalProducts}
            </span>
            <Button
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 px-6 rounded-full shadow-md hover:shadow-lg"
            >
              Próximo <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}