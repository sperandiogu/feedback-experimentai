import React, { useState } from 'react';
import { Question } from '@/entities/Questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import DynamicQuestionRenderer from '../DynamicQuestionRenderer';

interface QuestionPreviewProps {
  question: Question;
  onClose: () => void;
}

export default function QuestionPreview({ question, onClose }: QuestionPreviewProps) {
  const [previewValue, setPreviewValue] = useState<any>(null);

  const getQuestionTypeLabel = (type: Question['question_type']): string => {
    const labels: Record<Question['question_type'], string> = {
      emoji_rating: 'Avaliação com Emojis',
      rating: 'Avaliação Numérica',
      multiple_choice: 'Múltipla Escolha',
      text: 'Texto Livre',
      boolean: 'Sim/Não'
    };
    return labels[type];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-background border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Pré-visualização</h2>
              <p className="text-sm text-foreground/60 mt-1">
                Veja como a pergunta aparecerá no formulário de feedback
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-foreground/40 hover:text-foreground/60"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {getQuestionTypeLabel(question.question_type)}
                </Badge>
                {question.is_required && (
                  <Badge variant="destructive" className="text-xs">
                    Obrigatória
                  </Badge>
                )}
                {question.product_id ? (
                  <Badge variant="default" className="text-xs">
                    Pergunta Específica
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Pergunta Global
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground/70">
                <strong>Texto:</strong> {question.question_text}
              </p>
              <p className="text-sm text-foreground/70">
                <strong>Ordem:</strong> {question.order_index}
              </p>
              {question.config && Object.keys(question.config).length > 0 && (
                <p className="text-sm text-foreground/70">
                  <strong>Configuração:</strong> {JSON.stringify(question.config)}
                </p>
              )}
              {question.options && question.options.length > 0 && (
                <div className="text-sm text-foreground/70">
                  <strong>Opções ({question.options.length}):</strong>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    {question.options.map((option, index) => (
                      <li key={index}>
                        {option.option_label} ({option.option_value})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Renderização Real
              </h3>
              <div className="p-6 bg-gradient-to-br from-background to-muted/20 rounded-xl border">
                <DynamicQuestionRenderer
                  question={question}
                  value={previewValue}
                  onChange={setPreviewValue}
                />
              </div>

              {previewValue !== null && previewValue !== undefined && previewValue !== '' && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Valor selecionado:
                  </p>
                  <pre className="text-xs bg-background/50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(previewValue, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
