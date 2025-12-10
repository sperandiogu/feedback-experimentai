import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '@/entities/Questions';
import DynamicQuestionRenderer from '../DynamicQuestionRenderer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, X, Sparkles, ChevronLeft } from 'lucide-react';

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
  onBack: () => void;
  isFinalStep?: boolean;
  editionName?: string;
  initialAnswers?: any[];
}

export default function GeneralFeedbackStep({
  title,
  subtitle,
  icon,
  questions,
  onComplete,
  onExitRequest,
  onBack,
  isFinalStep = false,
  editionName,
  initialAnswers
}: GeneralFeedbackStepProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
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

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
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

    onComplete({ answers: answersWithDetails });
  };

  const isComplete = questions
    .filter(q => q.is_required)
    .every(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '');

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
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              {icon}
            </div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="text-sm text-foreground/60">{subtitle}</p>
          </div>

          <div className="space-y-8">
            {questions.map(question => (
              <div key={question.id}>
                <DynamicQuestionRenderer
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  editionName={editionName}
                  showValidation={showValidation}
                />
              </div>
            ))}
          </div>

          <div className="w-full mt-8 flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-foreground/80 hover:text-foreground rounded-full"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Voltar
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 rounded-full shadow-md hover:shadow-lg">
              {isFinalStep ? 'Finalizar Feedback' : 'Continuar'}
              {isFinalStep ? <Sparkles className="w-5 h-5 ml-2" /> : <ChevronRight className="w-5 h-5 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}