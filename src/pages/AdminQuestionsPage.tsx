import React, { useState } from 'react';
import { Question } from '@/entities/Questions';
import QuestionsList from '@/components/admin/QuestionsList';
import QuestionForm from '@/components/admin/QuestionForm';
import QuestionPreview from '@/components/admin/QuestionPreview';

type ViewMode = 'list' | 'create' | 'edit' | 'preview';

export default function AdminQuestionsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setSelectedQuestion(null);
    setViewMode('create');
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setSelectedCategoryId(question.category_id);
    setViewMode('edit');
  };

  const handlePreview = (question: Question) => {
    setSelectedQuestion(question);
    setViewMode('preview');
  };

  const handleSave = () => {
    setViewMode('list');
    setSelectedQuestion(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedQuestion(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Gerenciamento de Perguntas
          </h1>
          <p className="text-foreground/60">
            Crie e gerencie perguntas globais ou específicas para produtos individuais
          </p>
        </div>

        {viewMode === 'list' && (
          <QuestionsList
            onEdit={handleEdit}
            onPreview={handlePreview}
            onCreate={handleCreate}
            refreshTrigger={refreshTrigger}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <QuestionForm
            question={selectedQuestion || undefined}
            categoryId={selectedCategoryId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {viewMode === 'preview' && selectedQuestion && (
          <QuestionPreview
            question={selectedQuestion}
            onClose={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
