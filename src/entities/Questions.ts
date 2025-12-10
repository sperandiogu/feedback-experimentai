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
  product_id?: string;
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
          .is('product_id', null) // Only get global questions for this method
          .order('order_index');

        if (error) {
          throw error;
        }

        return questions.map((question: any) => ({
          id: question.id,
          category_id: question.category_id,
          product_id: question.product_id,
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

  static async getQuestionsByCategoryAndProduct(categoryName: string, productId?: string): Promise<Question[]> {
    try {
      return await withRetry(async () => {
        console.log(`Fetching questions for category: ${categoryName}, productId: ${productId || 'NULL (global only)'}`);
        
        // Build the condition for product filtering
        const productCondition = productId 
          ? `product_id.is.null,product_id.eq.${productId}` // Global OR specific to this product
          : 'product_id.is.null'; // Only global questions
          
        const { data: questions, error } = await supabase
          .from('questions')
          .select(`
            *,
            question_options(*),
            question_categories!inner(name)
          `)
          .eq('question_categories.name', categoryName)
          .eq('is_active', true)
          .or(productCondition)
          .order('order_index');

        if (error) {
          console.error('Database error fetching questions:', error);
          throw error;
        }

        console.log(`Found ${questions.length} questions in database`);
        
        const mappedQuestions = questions.map((question: any) => ({
          id: question.id,
          category_id: question.category_id,
          product_id: question.product_id,
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
        
        // Log details about what was found
        const globalQuestions = mappedQuestions.filter(q => !q.product_id);
        const specificQuestions = mappedQuestions.filter(q => q.product_id);
        console.log(`Questions breakdown: ${globalQuestions.length} global, ${specificQuestions.length} product-specific`);
        
        return mappedQuestions;
      });
    } catch (error) {
      console.error('Error fetching questions by category and product:', error);
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
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!question) {
          return null;
        }

        return {
          id: question.id,
          category_id: question.category_id,
          product_id: question.product_id,
          question_text: question.question_text,
          question_type: question.question_type,
          is_required: question.is_required,
          order_index: question.order_index,
          config: question.config || {},
          is_active: question.is_active,
          options: question.question_options
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

  static async getAllQuestions(filters?: {
    categoryId?: string;
    productId?: string | null;
    includeInactive?: boolean;
  }): Promise<Question[]> {
    try {
      return await withRetry(async () => {
        let query = supabase
          .from('questions')
          .select(`
            *,
            question_options(*),
            question_categories(id, name, display_name)
          `)
          .order('order_index');

        if (filters?.categoryId) {
          query = query.eq('category_id', filters.categoryId);
        }

        if (filters?.productId !== undefined) {
          if (filters.productId === null) {
            query = query.is('product_id', null);
          } else {
            query = query.eq('product_id', filters.productId);
          }
        }

        if (!filters?.includeInactive) {
          query = query.eq('is_active', true);
        }

        const { data: questions, error } = await query;

        if (error) {
          throw error;
        }

        return questions.map((question: any) => ({
          id: question.id,
          category_id: question.category_id,
          product_id: question.product_id,
          question_text: question.question_text,
          question_type: question.question_type,
          is_required: question.is_required,
          order_index: question.order_index,
          config: question.config || {},
          is_active: question.is_active,
          options: question.question_options
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
      console.error('Error fetching all questions:', error);
      return [];
    }
  }

  static async createQuestion(questionData: {
    category_id: string;
    product_id?: string | null;
    question_text: string;
    question_type: Question['question_type'];
    is_required: boolean;
    order_index: number;
    config?: any;
    options?: Array<{
      option_value: string;
      option_label: string;
      option_icon?: string;
      order_index: number;
    }>;
  }): Promise<Question> {
    try {
      return await withRetry(async () => {
        const { data: question, error: questionError } = await supabase
          .from('questions')
          .insert({
            category_id: questionData.category_id,
            product_id: questionData.product_id || null,
            question_text: questionData.question_text,
            question_type: questionData.question_type,
            is_required: questionData.is_required,
            order_index: questionData.order_index,
            config: questionData.config || {},
            is_active: true
          })
          .select()
          .single();

        if (questionError) {
          throw questionError;
        }

        if (questionData.options && questionData.options.length > 0) {
          const optionsToInsert = questionData.options.map(opt => ({
            question_id: question.id,
            option_value: opt.option_value,
            option_label: opt.option_label,
            option_icon: opt.option_icon,
            order_index: opt.order_index,
            is_active: true
          }));

          const { error: optionsError } = await supabase
            .from('question_options')
            .insert(optionsToInsert);

          if (optionsError) {
            throw optionsError;
          }
        }

        const createdQuestion = await this.getQuestionById(question.id);
        if (!createdQuestion) {
          throw new Error('Failed to retrieve created question');
        }

        return createdQuestion;
      });
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  static async updateQuestion(
    questionId: string,
    questionData: {
      question_text?: string;
      question_type?: Question['question_type'];
      is_required?: boolean;
      order_index?: number;
      config?: any;
      product_id?: string | null;
      options?: Array<{
        id?: string;
        option_value: string;
        option_label: string;
        option_icon?: string;
        order_index: number;
      }>;
    }
  ): Promise<Question> {
    try {
      return await withRetry(async () => {
        const updateData: any = {};
        if (questionData.question_text !== undefined) updateData.question_text = questionData.question_text;
        if (questionData.question_type !== undefined) updateData.question_type = questionData.question_type;
        if (questionData.is_required !== undefined) updateData.is_required = questionData.is_required;
        if (questionData.order_index !== undefined) updateData.order_index = questionData.order_index;
        if (questionData.config !== undefined) updateData.config = questionData.config;
        if (questionData.product_id !== undefined) updateData.product_id = questionData.product_id;

        const { error: questionError } = await supabase
          .from('questions')
          .update(updateData)
          .eq('id', questionId);

        if (questionError) {
          throw questionError;
        }

        if (questionData.options !== undefined) {
          const { error: deleteError } = await supabase
            .from('question_options')
            .delete()
            .eq('question_id', questionId);

          if (deleteError) {
            throw deleteError;
          }

          if (questionData.options.length > 0) {
            const optionsToInsert = questionData.options.map(opt => ({
              question_id: questionId,
              option_value: opt.option_value,
              option_label: opt.option_label,
              option_icon: opt.option_icon,
              order_index: opt.order_index,
              is_active: true
            }));

            const { error: optionsError } = await supabase
              .from('question_options')
              .insert(optionsToInsert);

            if (optionsError) {
              throw optionsError;
            }
          }
        }

        const updatedQuestion = await this.getQuestionById(questionId);
        if (!updatedQuestion) {
          throw new Error('Failed to retrieve updated question');
        }

        return updatedQuestion;
      });
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  static async deleteQuestion(questionId: string): Promise<void> {
    try {
      await withRetry(async () => {
        const { error } = await supabase
          .from('questions')
          .delete()
          .eq('id', questionId);

        if (error) {
          throw error;
        }
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  static async toggleQuestionStatus(questionId: string, isActive: boolean): Promise<void> {
    try {
      await withRetry(async () => {
        const { error } = await supabase
          .from('questions')
          .update({ is_active: isActive })
          .eq('id', questionId);

        if (error) {
          throw error;
        }
      });
    } catch (error) {
      console.error('Error toggling question status:', error);
      throw error;
    }
  }

  static async reorderQuestions(categoryId: string, productId: string | null, newOrder: string[]): Promise<void> {
    try {
      await withRetry(async () => {
        const updates = newOrder.map((questionId, index) => ({
          id: questionId,
          order_index: index
        }));

        for (const update of updates) {
          const { error } = await supabase
            .from('questions')
            .update({ order_index: update.order_index })
            .eq('id', update.id)
            .eq('category_id', categoryId);

          if (error) {
            throw error;
          }
        }
      });
    } catch (error) {
      console.error('Error reordering questions:', error);
      throw error;
    }
  }

  static async getProductsForDropdown(): Promise<Array<{ id: string; name: string; brand: string; category: string }>> {
    try {
      return await withRetry(async () => {
        const { data: products, error } = await supabase
          .from('products_catalog')
          .select('id, name, brand, category')
          .eq('is_active', true)
          .order('name');

        if (error) {
          throw error;
        }

        return products || [];
      });
    } catch (error) {
      console.error('Error fetching products for dropdown:', error);
      return [];
    }
  }
}