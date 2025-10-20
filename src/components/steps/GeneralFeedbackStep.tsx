import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/entities/Questions';
import DynamicQuestionRenderer from '../DynamicQuestionRenderer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, X, Sparkles } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
};

interface GeneralFeedbackStepProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  questions: Question[];
  onComplete: (feedback: any) => void;
  onExitRequest: () => void;
  isFinalStep?: boolean;
  editionName?: string;
}

export default function GeneralFeedbackStep({
  title,
  subtitle,
  icon,
  questions,
  onComplete,
  onExitRequest,
  isFinalStep = false,
  editionName
}: GeneralFeedbackStepProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    const answersWithDetails = questions.map(q => ({
      question_id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      answer: answers[q.id]
    }));
    
    onComplete({ answers: answersWithDetails });
  };

  const isComplete = questions
    .filter(q => q.is_required)
    .every(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '');

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
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              {icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>

          <div className="space-y-8">
            {questions.map(question => (
              <div key={question.id}>
                <DynamicQuestionRenderer
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  editionName={editionName}
                />
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={!isComplete} className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-base py-3 rounded-full shadow-md hover:shadow-lg disabled:shadow-none disabled:bg-gray-300">
            {isFinalStep ? 'Finalizar Feedback' : 'Continuar'}
            {isFinalStep ? <Sparkles className="w-5 h-5 ml-2" /> : <ChevronRight className="w-5 h-5 ml-1" />}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}