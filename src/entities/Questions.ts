import { supabase, withRetry } from '@/lib/supabase';

export interface QuestionCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  order_index: number;
  is_active: boolean;
}

export interface QuestionOption {
  id: string;
  option_value: string;
  option_label: string;
  option_icon?: string;
  order_index: number;
}

export interface Question {
  id: string;
  category_id: string;
  question_text: string;
  question_type: 'rating' | 'multiple_choice' | 'text' | 'boolean' | 'emoji_rating';
  is_required: boolean;
  order_index: number;
  config: any;
  is_active: boolean;
  options?: QuestionOption[];
}

export interface QuestionCategoryWithQuestions extends QuestionCategory {
  questions: Question[];
}

export class QuestionsService {
  static async getQuestionCategories(): Promise<QuestionCategoryWithQuestions[]> {
    try {
      return await withRetry(async () => {
        const { data: categories, error: categoriesError } = await supabase
          .from('question_categories')
          .select(`
            *,
            questions!inner(
              *,
              question_options(*)
            )
          `)
          .eq('is_active', true)
          .order('order_index');

        if (categoriesError) {
          throw new Error(`Database error: ${categoriesError.message}`);
        }

        if (!categories || categories.length === 0) {
          throw new Error('No question categories found in database');
        }

        // Transform and sort the data
        const transformedCategories: QuestionCategoryWithQuestions[] = categories.map(category => ({
          id: category.id,
          name: category.name,
          display_name: category.display_name,
          description: category.description,
          order_index: category.order_index,
          is_active: category.is_active,
          questions: category.questions
            .filter((q: any) => q.is_active)
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((question: any) => ({
              id: question.id,
              category_id: question.category_id,
              question_text: question.question_text,
              question_type: question.question_type,
              is_required: question.is_required,
              order_index: question.order_index,
              config: question.config || {},
              is_active: question.is_active,
              options: question.question_options
                ?.filter((opt: any) => opt.is_active)
                ?.sort((a: any, b: any) => a.order_index - b.order_index)
                ?.map((option: any) => ({
                  id: option.id,
                  option_value: option.option_value,
                  option_label: option.option_label,
                  option_icon: option.option_icon,
                  order_index: option.order_index
                })) || []
            }))
        }));

        return transformedCategories;
      });
    } catch (error) {
      console.error('Failed to fetch question categories from database:', error);
      throw error;
    }
  }

  static async getQuestionsByCategory(categoryName: string): Promise<Question[]> {
    try {
      return await withRetry(async () => {
        const { data: questions, error } = await supabase
          .from('questions')
          .select(`
            *,
            question_options(*),
            question_categories!inner(name)
          `)
          .eq('question_categories.name', categoryName)
          .eq('is_active', true)
          .order('order_index');

        if (error) {
          throw error;
        }

        return questions.map((question: any) => ({
          id: question.id,
          category_id: question.category_id,
          question_text: question.question_text,
          question_type: question.question_type,
          is_required: question.is_required,
          order_index: question.order_index,
          config: question.config || {},
          is_active: question.is_active,
          options: question.question_options
            ?.filter((opt: any) => opt.is_active)
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            ?.map((option: any) => ({
              id: option.id,
              option_value: option.option_value,
              option_label: option.option_label,
              option_icon: option.option_icon,
              order_index: option.order_index
            })) || []
        }));
      });
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      return [];
    }
  }

  static async getQuestionById(questionId: string): Promise<Question | null> {
    try {
      return await withRetry(async () => {
        const { data: question, error } = await supabase
          .from('questions')
          .select(`
            *,
            question_options(*)
          `)
          .eq('id', questionId)
          .eq('is_active', true)
          .single();

        if (error) {
          throw error;
        }

        return {
          id: question.id,
          category_id: question.category_id,
          question_text: question.question_text,
          question_type: question.question_type,
          is_required: question.is_required,
          order_index: question.order_index,
          config: question.config || {},
          is_active: question.is_active,
          options: question.question_options
            ?.filter((opt: any) => opt.is_active)
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            ?.map((option: any) => ({
              id: option.id,
              option_value: option.option_value,
              option_label: option.option_label,
              option_icon: option.option_icon,
              order_index: option.order_index
            })) || []
        };
      });
    } catch (error) {
      console.error('Error fetching question by ID:', error);
      return null;
    }
  }
}