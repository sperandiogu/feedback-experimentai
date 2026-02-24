import React from 'react';
import { Button } from '@/components/ui/button';
import { SectionSkeleton } from '@/components/ui/skeleton';
import DynamicQuestionRenderer from '@/components/DynamicQuestionRenderer';
import type { Question } from '@/entities/Questions';

interface GeneralSectionProps {
  questions: Question[];
  answers: Record<string, any>;
  loading: boolean;
  editionName?: string;
  onAnswerChange: (questionId: string, value: any) => void;
  onFieldBlur: (questionId: string) => void;
  getFieldError: (questionId: string) => string | undefined;
  isFieldTouched: (questionId: string) => boolean;
  onComplete: () => void;
  isComplete: boolean;
  isFinalSection?: boolean;
}

export function GeneralSection({
  questions,
  answers,
  loading,
  editionName,
  onAnswerChange,
  onFieldBlur,
  getFieldError,
  isFieldTouched,
  onComplete,
  isComplete,
  isFinalSection = false,
}: GeneralSectionProps) {
  if (loading) {
    return <SectionSkeleton />;
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Não há perguntas para esta seção.</p>
        <Button
          onClick={onComplete}
          className="mt-4 rounded-full"
        >
          Continuar
        </Button>
      </div>
    );
  }

  // Check if all required questions are answered
  const allRequiredAnswered = questions.every(q => {
    if (!q.is_required) return true;
    const answer = answers[q.id];
    if (answer === undefined || answer === null || answer === '') return false;
    if (typeof answer === 'string' && answer.trim() === '') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <DynamicQuestionRenderer
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) => onAnswerChange(question.id, value)}
            onBlur={() => onFieldBlur(question.id)}
            error={getFieldError(question.id)}
            touched={isFieldTouched(question.id)}
            editionName={editionName}
          />
        ))}
      </div>

      {/* Complete button */}
      <Button
        onClick={onComplete}
        disabled={!allRequiredAnswered}
        className="w-full rounded-full py-3"
      >
        {isComplete ? 'Atualizado' : 'Confirmar Respostas'}
      </Button>
    </div>
  );
}
