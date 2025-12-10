import React, { useState, useEffect } from 'react';
import { Question, QuestionsService } from '@/entities/Questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';

interface QuestionFormProps {
  question?: Question;
  categoryId: string;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

interface QuestionOption {
  option_value: string;
  option_label: string;
  option_icon?: string;
  order_index: number;
}

export default function QuestionForm({ question, categoryId, onSave, onCancel }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState(question?.question_text || '');
  const [questionType, setQuestionType] = useState<Question['question_type']>(question?.question_type || 'text');
  const [isRequired, setIsRequired] = useState(question?.is_required ?? true);
  const [orderIndex, setOrderIndex] = useState(question?.order_index ?? 0);
  const [productId, setProductId] = useState<string | null>(question?.product_id || null);
  const [config, setConfig] = useState<any>(question?.config || {});
  const [options, setOptions] = useState<QuestionOption[]>(question?.options || []);
  const [products, setProducts] = useState<Array<{ id: string; name: string; brand: string; category: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await QuestionsService.getProductsForDropdown();
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        option_value: '',
        option_label: '',
        option_icon: '',
        order_index: options.length
      }
    ]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const validateForm = (): boolean => {
    if (!questionText.trim()) {
      setError('O texto da pergunta é obrigatório');
      return false;
    }

    if (questionType === 'multiple_choice' && options.length < 2) {
      setError('Perguntas de múltipla escolha devem ter pelo menos 2 opções');
      return false;
    }

    if (questionType === 'multiple_choice') {
      const hasEmptyOptions = options.some(opt => !opt.option_label.trim() || !opt.option_value.trim());
      if (hasEmptyOptions) {
        setError('Todas as opções devem ter valor e rótulo preenchidos');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const questionData = {
        category_id: categoryId,
        product_id: productId,
        question_text: questionText,
        question_type: questionType,
        is_required: isRequired,
        order_index: orderIndex,
        config,
        options: questionType === 'multiple_choice' ? options : undefined
      };

      let savedQuestion: Question;
      if (question?.id) {
        savedQuestion = await QuestionsService.updateQuestion(question.id, questionData);
      } else {
        savedQuestion = await QuestionsService.createQuestion(questionData);
      }

      onSave(savedQuestion);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar pergunta');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (questionType) {
      case 'emoji_rating':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Número de emojis
            </label>
            <input
              type="number"
              min="3"
              max="5"
              value={config.emoji_count || 5}
              onChange={(e) => setConfig({ ...config, emoji_count: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Escala máxima
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={config.max_rating || 5}
              onChange={(e) => setConfig({ ...config, max_rating: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-foreground">
                Opções
              </label>
              <Button
                type="button"
                onClick={handleAddOption}
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Opção
              </Button>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <GripVertical className="w-4 h-4 text-foreground/40" />
                  <input
                    type="text"
                    placeholder="Valor"
                    value={option.option_value}
                    onChange={(e) => handleOptionChange(index, 'option_value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Rótulo"
                    value={option.option_label}
                    onChange={(e) => handleOptionChange(index, 'option_label', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-background border shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {question ? 'Editar Pergunta' : 'Nova Pergunta'}
          </h2>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-foreground/40 hover:text-foreground/60"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Texto da Pergunta *
            </label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Ex: Qual foi a sua experiência com este produto?"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Tipo de Pergunta *
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as Question['question_type'])}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="emoji_rating">Avaliação com Emojis</option>
              <option value="rating">Avaliação Numérica</option>
              <option value="multiple_choice">Múltipla Escolha</option>
              <option value="text">Texto Livre</option>
              <option value="boolean">Sim/Não</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Produto Específico (opcional)
            </label>
            <select
              value={productId || ''}
              onChange={(e) => setProductId(e.target.value || null)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Global (todos os produtos)</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.brand}
                </option>
              ))}
            </select>
            <p className="text-xs text-foreground/60">
              Deixe como "Global" para aplicar a todos os produtos, ou selecione um produto específico
            </p>
          </div>

          {renderTypeSpecificFields()}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="isRequired" className="text-sm font-medium text-foreground">
              Pergunta obrigatória
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Ordem de Exibição
            </label>
            <input
              type="number"
              min="0"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-foreground/60">
              Perguntas com números menores aparecem primeiro
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="ghost"
              className="text-foreground/80 hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Salvando...' : question ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
