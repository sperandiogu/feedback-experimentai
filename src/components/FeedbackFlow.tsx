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

const ProductCard = ({ product, onFeedback, currentIndex, totalProducts, onExit }: any) => {
  const [feedback, setFeedback] = useState({
    answers: {} as Record<string, any>
  });
  const [productQuestions, setProductQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Load product-specific questions (global + specific to this product)
  React.useEffect(() => {
    loadProductQuestions();
  }, [product.id]);

  const loadProductQuestions = async () => {
    console.log(`Loading questions for product: ${product.name} (ID: ${product.id})`);
    try {
      setLoadingQuestions(true);
      
      // This method will return both:
      // 1. Global questions (product_id = NULL)
      // 2. Product-specific questions (product_id = product.id)
      const questionsForThisProduct = await QuestionsService.getQuestionsByCategoryAndProduct('product', product.id);
      
      console.log(`Loaded ${questionsForThisProduct.length} questions for product ${product.name}:`, questionsForThisProduct);
      setProductQuestions(questionsForThisProduct);
    } catch (error) {
      console.error('Error loading product-specific questions:', error);
      // Fallback: try to load only global questions if specific loading fails
      const globalQuestions = await QuestionsService.getQuestionsByCategory('product');
      console.log(`Fallback: loaded ${globalQuestions.length} global questions only`);
      setProductQuestions(globalQuestions);
    } finally {
      setLoadingQuestions(false);
    }
  };

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
    // Send raw answers with question details
    const answersWithQuestions = productQuestions.map(question => ({
      question_id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      answer: feedback.answers[question.id]
    }));
    
    onFeedback(product.name, { answers: answersWithQuestions });
  };

  // Check if required questions are answered
  const isComplete = productQuestions
    .filter((q: Question) => q.is_required)
    .every((q: Question) => feedback.answers[q.id] !== undefined && feedback.answers[q.id] !== null && feedback.answers[q.id] !== '');

  if (loadingQuestions) {
    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
        <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perguntas para {product.name}...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
            {productQuestions.map((question: Question) => (
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
    // Send raw answers with question details
    const answersWithQuestions = questions.map((question: Question) => ({
      question_id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      answer: feedback.answers[question.id]
    }));
    
    onComplete({ answers: answersWithQuestions });
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
    // Send raw answers with question details
    const answersWithQuestions = questions.map((question: Question) => ({
      question_id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      answer: feedback.answers[question.id]
    }));
    
    onComplete({ answers: answersWithQuestions });
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

interface FeedbackFlowProps {
  edition: any;
  onComplete: (feedbackData: any) => void;
  onExit: () => void;
  onLogout: () => void;
}

export default function FeedbackFlow({ edition, onComplete, onExit, onLogout }: FeedbackFlowProps) {
  const [currentStep, setCurrentStep] = useState('products');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [globalQuestions, setGlobalQuestions] = useState<Record<string, Question[]>>({});
  const [loadingGlobalQuestions, setLoadingGlobalQuestions] = useState(true);
  const [productFeedbacks, setProductFeedbacks] = useState([]);
  const [experimentaiFeedback, setExperimentaiFeedback] = useState({});
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Load global questions on component mount (for experimentai and delivery)
  React.useEffect(() => {
    loadGlobalQuestions();
  }, []);

  const loadGlobalQuestions = async () => {
    try {
      setLoadingGlobalQuestions(true);
      const [experimentaiQuestions, deliveryQuestions] = await Promise.all([
        QuestionsService.getQuestionsByCategory('experimentai'),
        QuestionsService.getQuestionsByCategory('delivery')
      ]);

      setGlobalQuestions({
        experimentai: experimentaiQuestions,
        delivery: deliveryQuestions
      });
    } catch (error) {
      console.error('Error loading global questions:', error);
      // Fallback to empty arrays if global questions fail to load
      setGlobalQuestions({
        experimentai: [],
        delivery: []
      });
    } finally {
      setLoadingGlobalQuestions(false);
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
    // Prevent double submission
    if (isSubmittingFeedback) {
      console.warn('Feedback submission already in progress, ignoring duplicate attempt');
      return;
    }
    
    setIsSubmittingFeedback(true);
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

  if (loadingGlobalQuestions) {
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
              />
            )}

            {currentStep === 'experimentai' && (
              <ExperimentaiFeedback
                onComplete={handleExperimentaiFeedback}
                edition={edition}
                onExit={handleExitRequest}
                questions={globalQuestions.experimentai || []}
              />
            )}

            {currentStep === 'delivery' && (
              <DeliveryFeedback
                onComplete={handleDeliveryFeedback}
                onExit={handleExitRequest}
                questions={globalQuestions.delivery || []}
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