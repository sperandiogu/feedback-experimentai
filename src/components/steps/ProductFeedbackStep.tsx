import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QuestionsService, type Question } from '@/entities/Questions';
import DynamicQuestionRenderer from '../DynamicQuestionRenderer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, X, Loader2 } from 'lucide-react';

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
}

export default function ProductFeedbackStep({ product, onComplete, currentIndex, totalProducts, onExitRequest }: ProductFeedbackStepProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const productQuestions = await QuestionsService.getQuestionsByCategoryAndProduct('product', product.id);
        setQuestions(productQuestions);
      } catch (error) {
        console.error(`Error loading questions for product ${product.name}:`, error);
        // Optionally, set an error state to show in the UI
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [product.id]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
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
        <Card className="bg-white border-none shadow-xl rounded-3xl">
          <CardContent className="p-6 text-center h-96 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
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
            onClick={onExitRequest}
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
            {questions.map(question => (
              <div key={question.id}>
                <DynamicQuestionRenderer
                  question={question}
                  value={answers[question.id]}
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
}