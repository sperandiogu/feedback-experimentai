import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionsService, type Question } from '@/entities/Questions';
import DynamicQuestionRenderer from './DynamicQuestionRenderer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Star, Heart, Sparkles, Package, Truck, X, ArrowLeft } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
};

const ProductCard = ({ product, onFeedback, currentIndex, totalProducts, onExit, questions }: any) => {
  const [feedback, setFeedback] = useState({
    answers: {} as Record<string, any>
  });

  const handleAnswerChange = (questionId: string, value: any) => {
    setFeedback(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }));
  };

  const handleNext = () => {
    // Transform answers to match expected format
    const transformedFeedback = {
      experience_rating: feedback.answers[questions[0]?.id] || 0,
      would_buy: feedback.answers[questions[1]?.id] || null,
      main_attraction: feedback.answers[questions[2]?.id] || null,
      what_caught_attention: feedback.answers[questions[3]?.id] || '',
      product_vibe: feedback.answers[questions[2]?.id] || null
    };
    
    onFeedback(product.name, transformedFeedback);
  };

  // Check if required questions are answered
  const isComplete = questions
    .filter((q: Question) => q.is_required)
    .every((q: Question) => feedback.answers[q.id] !== undefined && feedback.answers[q.id] !== null && feedback.answers[q.id] !== '');

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
      <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
        <div className="flex justify-between items-center p-4 pb-0">
          <Button
            onClick={onExit}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-400">ESC para sair</span>
        </div>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center text-3xl text-purple-600">
              📦
            </div>
            <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-sm text-gray-500">{product.brand}</p>
            <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700 border-none">{product.category}</Badge>
          </div>

          <div className="space-y-8">
            {questions.map((question: Question) => (
              <div key={question.id}>
                <DynamicQuestionRenderer
                  question={question}
                  value={feedback.answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Produto {currentIndex + 1} de {totalProducts}
            </span>
            <Button
              onClick={handleNext}
              disabled={!isComplete}
              className="bg-purple-600 hover:bg-purple-700 text-base py-3 px-6 rounded-full shadow-md hover:shadow-lg disabled:shadow-none disabled:bg-gray-300"
            >
              Próximo <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ExperimentaiFeedback = ({ onComplete, edition, onExit, questions }: any) => {
  const [feedback, setFeedback] = useState({
    answers: {} as Record<string, any>
  });

  const handleAnswerChange = (questionId: string, value: any) => {
    setFeedback(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }));
  };

  const handleSubmit = () => {
    // Transform answers to match expected format
    const transformedFeedback = {
      box_variety_rating: feedback.answers[questions[0]?.id] || 0,
      box_theme_rating: feedback.answers[questions[1]?.id] || 0,
      overall_satisfaction: feedback.answers[questions[2]?.id] || 0,
      would_recommend: feedback.answers[questions[3]?.id] || null,
      favorite_product: ''
    };
    
    onComplete(transformedFeedback);
  };

  // Check if required questions are answered
  const isComplete = questions
    .filter((q: Question) => q.is_required)
    .every((q: Question) => feedback.answers[q.id] !== undefined && feedback.answers[q.id] !== null && feedback.answers[q.id] !== '');

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
      <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
        <div className="flex justify-between items-center p-4 pb-0">
          <Button
            onClick={onExit}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-400">ESC para sair</span>
        </div>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Sobre a Experimentaí</h2>
            <p className="text-sm text-gray-500">Sua experiência com a nossa box!</p>
          </div>

          <div className="space-y-8">
            {questions.map((question: Question) => (
              <div key={question.id}>
                <DynamicQuestionRenderer
                  question={question}
                  value={feedback.answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  editionName={edition.edition}
                />
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={!isComplete} className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-base py-3 rounded-full shadow-md hover:shadow-lg disabled:shadow-none disabled:bg-gray-300">
            Continuar <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DeliveryFeedback = ({ onComplete, onExit, questions }: any) => {
  const [feedback, setFeedback] = useState({
    answers: {} as Record<string, any>
  });

  const handleAnswerChange = (questionId: string, value: any) => {
    setFeedback(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }));
  };

  const handleSubmit = () => {
    // Transform answers to match expected format
    const transformedFeedback = {
      delivery_time_rating: feedback.answers[questions[0]?.id] || 0,
      packaging_condition: feedback.answers[questions[1]?.id] || 0,
      delivery_experience: feedback.answers[questions[2]?.id] || '',
      final_message: feedback.answers[questions[3]?.id] || ''
    };
    
    onComplete(transformedFeedback);
  };

  // Check if required questions are answered
  const isComplete = questions
    .filter((q: Question) => q.is_required)
    .every((q: Question) => feedback.answers[q.id] !== undefined && feedback.answers[q.id] !== null && feedback.answers[q.id] !== '');

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
      <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
        <div className="flex justify-between items-center p-4 pb-0">
          <Button
            onClick={onExit}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-400">ESC para sair</span>
        </div>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <Truck className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Sobre a entrega</h2>
            <p className="text-sm text-gray-500">Quase lá! Como foi receber sua box?</p>
          </div>

          <div className="space-y-8">
            {questions.map((question: Question) => (
              <div key={question.id}>
                <DynamicQuestionRenderer
                  question={question}
                  value={feedback.answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={!isComplete} className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-base py-3 rounded-full shadow-md hover:shadow-lg disabled:shadow-none disabled:bg-gray-300">
            Finalizar Feedback <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ExitConfirmationModal = ({ onConfirm, onCancel }: any) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Sair do feedback?
          </h3>
          <p className="text-gray-600 mb-6">
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

export default function FeedbackFlow({ edition, onComplete, onExit, onLogout }: any) {
  const [currentStep, setCurrentStep] = useState('products');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [productFeedbacks, setProductFeedbacks] = useState([]);
  const [experimentaiFeedback, setExperimentaiFeedback] = useState({});
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Load questions on component mount
  React.useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const [productQuestions, experimentaiQuestions, deliveryQuestions] = await Promise.all([
        QuestionsService.getQuestionsByCategory('product'),
        QuestionsService.getQuestionsByCategory('experimentai'),
        QuestionsService.getQuestionsByCategory('delivery')
      ]);

      setQuestions({
        product: productQuestions,
        experimentai: experimentaiQuestions,
        delivery: deliveryQuestions
      });
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback to empty arrays if questions fail to load
      setQuestions({
        product: [],
        experimentai: [],
        delivery: []
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const totalSteps = edition.products.length + 2;
  const currentProgressIndex = currentStep === 'products'
    ? currentProductIndex
    : currentStep === 'experimentai'
    ? edition.products.length
    : edition.products.length + 1;
  const progress = ((currentProgressIndex + 1) / totalSteps) * 100;

  // Handle ESC key press
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowExitConfirmation(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleExitRequest = () => {
    setShowExitConfirmation(true);
  };

  const handleExitConfirm = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const handleExitCancel = () => {
    setShowExitConfirmation(false);
  };

  const handleProductFeedback = (productName: string, feedback: any) => {
    const newFeedback = [...productFeedbacks, { product_name: productName, ...feedback }];
    setProductFeedbacks(newFeedback);

    if (currentProductIndex + 1 < edition.products.length) {
      setCurrentProductIndex(currentProductIndex + 1);
    } else {
      setCurrentStep('experimentai');
    }
  };

  const handleExperimentaiFeedback = (feedback: any) => {
    setExperimentaiFeedback(feedback);
    setCurrentStep('delivery');
  };

  const handleDeliveryFeedback = (feedback: any) => {
    const completeFeedback = {
      edition_id: edition.edition_id,
      product_feedbacks: productFeedbacks,
      experimentai_feedback: experimentaiFeedback,
      delivery_feedback: feedback,
      final_message: feedback.final_message || '',
      completion_badge: "🎉 Testador Expert da Experimentaí"
    };

    onComplete(completeFeedback);
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perguntas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-md mx-auto pt-4 sm:pt-8">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <span className="font-bold text-purple-600">Experimentaí</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-sm font-semibold border-none">
              {Math.round(progress)}%
            </Badge>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200 [&>div]:bg-purple-600" />
        </header>

        <main>
          <AnimatePresence mode="wait">
            {currentStep === 'products' && (
              <ProductCard
                key={currentProductIndex}
                product={edition.products[currentProductIndex]}
                onFeedback={handleProductFeedback}
                currentIndex={currentProductIndex}
                totalProducts={edition.products.length}
                onExit={handleExitRequest}
                questions={questions.product || []}
              />
            )}

            {currentStep === 'experimentai' && (
              <ExperimentaiFeedback
                onComplete={handleExperimentaiFeedback}
                edition={edition}
                onExit={handleExitRequest}
                questions={questions.experimentai || []}
              />
            )}

            {currentStep === 'delivery' && (
              <DeliveryFeedback
                onComplete={handleDeliveryFeedback}
                onExit={handleExitRequest}
                questions={questions.delivery || []}
              />
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {showExitConfirmation && (
            <ExitConfirmationModal
              onConfirm={handleExitConfirm}
              onCancel={handleExitCancel}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}