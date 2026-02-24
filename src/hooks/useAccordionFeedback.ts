import { useState, useCallback, useEffect, useMemo } from 'react';
import { QuestionsService, type Question } from '@/entities/Questions';

export interface Answer {
  question_id: string;
  question_text: string;
  question_type: string;
  answer: any;
}

export interface ProductFeedback {
  product_id: string;
  product_name: string;
  answers: Answer[];
}

export interface GeneralFeedback {
  answers: Answer[];
}

export interface FeedbackData {
  product_feedbacks: ProductFeedback[];
  experimentai_feedback: GeneralFeedback;
  delivery_feedback: GeneralFeedback;
  edition_id: string;
  completion_badge?: string;
}

export type SectionStatus = 'pending' | 'in_progress' | 'completed';

export interface SectionInfo {
  id: string;
  label: string;
  status: SectionStatus;
  type: 'product' | 'experimentai' | 'delivery';
  productId?: string;
  productName?: string;
}

interface AccordionFeedbackState {
  expandedSection: string | null;
  sectionStatus: Record<string, SectionStatus>;
  answers: Record<string, Record<string, any>>; // sectionId -> questionId -> answer
  touchedFields: Record<string, Set<string>>; // sectionId -> Set<questionId>
  questions: Record<string, Question[]>; // sectionId -> questions
  loadingQuestions: Record<string, boolean>;
  isSubmitting: boolean;
}

interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  image_url?: string;
}

interface Edition {
  edition_id: string;
  edition: string;
  products: Product[];
}

export function useAccordionFeedback(edition: Edition) {
  const [state, setState] = useState<AccordionFeedbackState>({
    expandedSection: null,
    sectionStatus: {},
    answers: {},
    touchedFields: {},
    questions: {},
    loadingQuestions: {},
    isSubmitting: false,
  });

  // Generate section IDs
  const sections = useMemo<SectionInfo[]>(() => {
    const productSections: SectionInfo[] = edition.products.map((product, index) => ({
      id: `product-${index}`,
      label: product.name,
      status: state.sectionStatus[`product-${index}`] || 'pending',
      type: 'product',
      productId: product.id,
      productName: product.name,
    }));

    return [
      ...productSections,
      {
        id: 'experimentai',
        label: 'Sobre a Experimentaí',
        status: state.sectionStatus['experimentai'] || 'pending',
        type: 'experimentai',
      },
      {
        id: 'delivery',
        label: 'Sobre a Entrega',
        status: state.sectionStatus['delivery'] || 'pending',
        type: 'delivery',
      },
    ];
  }, [edition.products, state.sectionStatus]);

  // Load questions for a section
  const loadQuestionsForSection = useCallback(async (sectionId: string, productId?: string) => {
    if (state.questions[sectionId]) return;

    setState(prev => ({
      ...prev,
      loadingQuestions: { ...prev.loadingQuestions, [sectionId]: true }
    }));

    try {
      let questions: Question[];
      if (sectionId.startsWith('product-')) {
        questions = await QuestionsService.getQuestionsByCategoryAndProduct('product', productId);
      } else if (sectionId === 'experimentai') {
        questions = await QuestionsService.getQuestionsByCategory('experimentai');
      } else {
        questions = await QuestionsService.getQuestionsByCategory('delivery');
      }

      setState(prev => ({
        ...prev,
        questions: { ...prev.questions, [sectionId]: questions },
        loadingQuestions: { ...prev.loadingQuestions, [sectionId]: false }
      }));
    } catch (error) {
      console.error(`Error loading questions for section ${sectionId}:`, error);
      setState(prev => ({
        ...prev,
        loadingQuestions: { ...prev.loadingQuestions, [sectionId]: false }
      }));
    }
  }, [state.questions]);

  // Expand a section
  const expandSection = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      loadQuestionsForSection(sectionId, section.productId);
    }

    setState(prev => ({
      ...prev,
      expandedSection: sectionId,
      sectionStatus: {
        ...prev.sectionStatus,
        [sectionId]: prev.sectionStatus[sectionId] === 'completed'
          ? 'completed'
          : 'in_progress'
      }
    }));

    // Scroll to section
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [sections, loadQuestionsForSection]);

  // Collapse a section
  const collapseSection = useCallback((sectionId: string) => {
    setState(prev => ({
      ...prev,
      expandedSection: prev.expandedSection === sectionId ? null : prev.expandedSection
    }));
  }, []);

  // Toggle section
  const toggleSection = useCallback((sectionId: string) => {
    if (state.expandedSection === sectionId) {
      collapseSection(sectionId);
    } else {
      expandSection(sectionId);
    }
  }, [state.expandedSection, collapseSection, expandSection]);

  // Update an answer
  const updateAnswer = useCallback((sectionId: string, questionId: string, value: any) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [sectionId]: {
          ...prev.answers[sectionId],
          [questionId]: value
        }
      }
    }));
  }, []);

  // Mark field as touched
  const touchField = useCallback((sectionId: string, questionId: string) => {
    setState(prev => {
      const currentTouched = prev.touchedFields[sectionId] || new Set();
      const newTouched = new Set(currentTouched);
      newTouched.add(questionId);
      return {
        ...prev,
        touchedFields: {
          ...prev.touchedFields,
          [sectionId]: newTouched
        }
      };
    });
  }, []);

  // Validate a section
  const validateSection = useCallback((sectionId: string): Record<string, string> => {
    const questions = state.questions[sectionId] || [];
    const sectionAnswers = state.answers[sectionId] || {};
    const errors: Record<string, string> = {};

    questions.forEach(question => {
      if (question.is_required) {
        const answer = sectionAnswers[question.id];
        if (answer === undefined || answer === null || answer === '') {
          errors[question.id] = 'Este campo é obrigatório';
        } else if (typeof answer === 'string' && answer.trim() === '') {
          errors[question.id] = 'Este campo é obrigatório';
        }
      }
    });

    return errors;
  }, [state.questions, state.answers]);

  // Check if a section is complete
  const isSectionComplete = useCallback((sectionId: string): boolean => {
    const errors = validateSection(sectionId);
    return Object.keys(errors).length === 0 &&
           state.questions[sectionId]?.length > 0;
  }, [validateSection, state.questions]);

  // Complete a section and move to next
  const completeSection = useCallback((sectionId: string) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    const nextSection = sections[currentIndex + 1];

    setState(prev => ({
      ...prev,
      sectionStatus: {
        ...prev.sectionStatus,
        [sectionId]: 'completed'
      },
      expandedSection: nextSection?.id || null
    }));

    if (nextSection) {
      loadQuestionsForSection(nextSection.id, nextSection.productId);
      setTimeout(() => {
        const element = document.getElementById(nextSection.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [sections, loadQuestionsForSection]);

  // Get validation errors for display
  const getFieldError = useCallback((sectionId: string, questionId: string): string | undefined => {
    const touched = state.touchedFields[sectionId]?.has(questionId);
    if (!touched) return undefined;

    const errors = validateSection(sectionId);
    return errors[questionId];
  }, [state.touchedFields, validateSection]);

  // Check if field is touched
  const isFieldTouched = useCallback((sectionId: string, questionId: string): boolean => {
    return state.touchedFields[sectionId]?.has(questionId) || false;
  }, [state.touchedFields]);

  // Calculate overall progress
  const progress = useMemo(() => {
    const completedCount = sections.filter(s =>
      state.sectionStatus[s.id] === 'completed'
    ).length;
    return {
      completed: completedCount,
      total: sections.length,
      percentage: sections.length > 0 ? (completedCount / sections.length) * 100 : 0
    };
  }, [sections, state.sectionStatus]);

  // Check if all sections are complete
  const canSubmit = useMemo(() => {
    return sections.every(section =>
      state.sectionStatus[section.id] === 'completed'
    );
  }, [sections, state.sectionStatus]);

  // Get incomplete sections
  const incompleteSections = useMemo(() => {
    return sections.filter(section =>
      state.sectionStatus[section.id] !== 'completed'
    );
  }, [sections, state.sectionStatus]);

  // Build final feedback data
  const buildFeedbackData = useCallback((): FeedbackData => {
    const productFeedbacks: ProductFeedback[] = edition.products.map((product, index) => {
      const sectionId = `product-${index}`;
      const sectionQuestions = state.questions[sectionId] || [];
      const sectionAnswers = state.answers[sectionId] || {};

      return {
        product_id: product.id,
        product_name: product.name,
        answers: sectionQuestions.map(q => ({
          question_id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          answer: sectionAnswers[q.id]
        }))
      };
    });

    const buildGeneralFeedback = (sectionId: string): GeneralFeedback => {
      const sectionQuestions = state.questions[sectionId] || [];
      const sectionAnswers = state.answers[sectionId] || {};

      return {
        answers: sectionQuestions.map(q => ({
          question_id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          answer: sectionAnswers[q.id]
        }))
      };
    };

    return {
      product_feedbacks: productFeedbacks,
      experimentai_feedback: buildGeneralFeedback('experimentai'),
      delivery_feedback: buildGeneralFeedback('delivery'),
      edition_id: edition.edition_id,
      completion_badge: "Testador Expert da Experimentaí"
    };
  }, [edition, state.questions, state.answers]);

  // Set submitting state
  const setSubmitting = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, isSubmitting: value }));
  }, []);

  // Initialize by expanding first section
  useEffect(() => {
    if (sections.length > 0 && !state.expandedSection) {
      expandSection(sections[0].id);
    }
  }, []);

  return {
    // State
    expandedSection: state.expandedSection,
    sectionStatus: state.sectionStatus,
    answers: state.answers,
    questions: state.questions,
    loadingQuestions: state.loadingQuestions,
    isSubmitting: state.isSubmitting,

    // Computed
    sections,
    progress,
    canSubmit,
    incompleteSections,

    // Actions
    expandSection,
    collapseSection,
    toggleSection,
    updateAnswer,
    touchField,
    completeSection,
    validateSection,
    isSectionComplete,
    getFieldError,
    isFieldTouched,
    buildFeedbackData,
    setSubmitting,
  };
}
