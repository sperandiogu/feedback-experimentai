import React from 'react';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionSkeleton } from '@/components/ui/skeleton';
import DynamicQuestionRenderer from '@/components/DynamicQuestionRenderer';
import type { Question } from '@/entities/Questions';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  image_url?: string;
}

interface ProductSectionProps {
  product: Product;
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
}

export function ProductSection({
  product,
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
}: ProductSectionProps) {
  if (loading) {
    return <SectionSkeleton />;
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Não há perguntas para este produto.</p>
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
      {/* Product info */}
      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-16 h-16 object-contain rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{product.name}</h4>
          <div className="flex gap-2 mt-1 flex-wrap">
            {product.brand && (
              <Badge variant="secondary" className="text-xs">
                {product.brand}
              </Badge>
            )}
            {product.category && (
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            )}
          </div>
        </div>
      </div>

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
