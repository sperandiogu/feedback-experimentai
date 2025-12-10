import React, { useState, useEffect } from 'react';
import { Question, QuestionsService } from '@/entities/Questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Power, Eye, Plus, Filter } from 'lucide-react';

interface QuestionsListProps {
  onEdit: (question: Question) => void;
  onPreview: (question: Question) => void;
  onCreate: () => void;
  refreshTrigger?: number;
}

interface Category {
  id: string;
  name: string;
  display_name: string;
}

export default function QuestionsList({ onEdit, onPreview, onCreate, refreshTrigger }: QuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; brand: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [filterProductId, setFilterProductId] = useState<string | null | 'global'>('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  useEffect(() => {
    loadQuestions();
  }, [filterCategoryId, filterProductId, showInactive]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, productsData] = await Promise.all([
        loadCategories(),
        QuestionsService.getProductsForDropdown()
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
      await loadQuestions();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (): Promise<Category[]> => {
    const { data, error } = await (await import('@/lib/supabase')).supabase
      .from('question_categories')
      .select('id, name, display_name')
      .eq('is_active', true)
      .order('order_index');

    if (error) throw error;
    return data || [];
  };

  const loadQuestions = async () => {
    try {
      const filters: any = {
        includeInactive: showInactive
      };

      if (filterCategoryId) {
        filters.categoryId = filterCategoryId;
      }

      if (filterProductId === 'global') {
        filters.productId = null;
      } else if (filterProductId) {
        filters.productId = filterProductId;
      }

      const questionsData = await QuestionsService.getAllQuestions(filters);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleToggleStatus = async (questionId: string, currentStatus: boolean) => {
    try {
      await QuestionsService.toggleQuestionStatus(questionId, !currentStatus);
      await loadQuestions();
    } catch (error) {
      console.error('Error toggling question status:', error);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await QuestionsService.deleteQuestion(questionId);
      await loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Erro ao excluir pergunta. Pode haver respostas associadas a ela.');
    }
  };

  const getQuestionTypeLabel = (type: Question['question_type']): string => {
    const labels: Record<Question['question_type'], string> = {
      emoji_rating: 'Emojis',
      rating: 'Avaliação',
      multiple_choice: 'Múltipla Escolha',
      text: 'Texto',
      boolean: 'Sim/Não'
    };
    return labels[type];
  };

  const getProductName = (productId?: string): string => {
    if (!productId) return 'Global';
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} - ${product.brand}` : 'Produto não encontrado';
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.display_name || 'Categoria não encontrada';
  };

  if (loading) {
    return (
      <Card className="bg-background border shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-foreground/60">Carregando perguntas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-background border shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Perguntas</h2>
            <Button
              onClick={onCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Pergunta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                <Filter className="w-4 h-4 inline mr-1" />
                Filtrar por Categoria
              </label>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                <Filter className="w-4 h-4 inline mr-1" />
                Filtrar por Produto
              </label>
              <select
                value={filterProductId || ''}
                onChange={(e) => setFilterProductId(e.target.value || null)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="global">Apenas Globais</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">
                  Mostrar inativas
                </span>
              </label>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 text-foreground/60">
              <p>Nenhuma pergunta encontrada.</p>
              <Button
                onClick={onCreate}
                variant="ghost"
                className="mt-4 text-primary hover:text-primary/80"
              >
                Criar primeira pergunta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question) => (
                <Card
                  key={question.id}
                  className={`border ${question.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryName(question.category_id)}
                          </Badge>
                          <Badge
                            variant={question.product_id ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {getProductName(question.product_id)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getQuestionTypeLabel(question.question_type)}
                          </Badge>
                          {question.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              Obrigatória
                            </Badge>
                          )}
                          {!question.is_active && (
                            <Badge variant="outline" className="text-xs text-foreground/50">
                              Inativa
                            </Badge>
                          )}
                        </div>
                        <p className="text-foreground font-medium">{question.question_text}</p>
                        <p className="text-sm text-foreground/60 mt-1">
                          Ordem: {question.order_index}
                          {question.options && question.options.length > 0 && (
                            <span className="ml-3">
                              {question.options.length} opções
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => onPreview(question)}
                          variant="ghost"
                          size="sm"
                          className="text-foreground/60 hover:text-foreground"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => onEdit(question)}
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleToggleStatus(question.id, question.is_active)}
                          variant="ghost"
                          size="sm"
                          className={question.is_active ? 'text-foreground/60 hover:text-foreground' : 'text-green-600 hover:text-green-700'}
                          title={question.is_active ? 'Desativar' : 'Ativar'}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(question.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/80"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
