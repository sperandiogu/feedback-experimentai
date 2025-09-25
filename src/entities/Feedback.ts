import { supabase, supabasePublic, withRetry } from '@/lib/supabase';
import { User } from './User';
import type { 
  CompleteFeedbackData, 
  FeedbackSession, 
  ProductFeedback, 
  ExperimentaiFeedback, 
  DeliveryFeedback 
} from '@/types/database';

export class Feedback {
  static async hasUserSubmittedFeedback(editionId: string, userEmail: string): Promise<boolean> {
    try {
      console.log(`Checking if user ${userEmail} already submitted feedback for edition ${editionId}`);
      
      const { data, error } = await supabase
        .from('feedback_sessions')
        .select('id')
        .eq('edition_id', editionId)
        .eq('user_email', userEmail)
        .eq('session_status', 'completed')
        .limit(1);

      if (error) {
        console.error('Error checking existing feedback:', error);
        throw error; // Don't allow if we can't verify - safer approach
      }

      const hasSubmitted = data && data.length > 0;
      console.log(`User ${userEmail} ${hasSubmitted ? 'has already' : 'has not'} submitted feedback for edition ${editionId}`);
      return hasSubmitted;
    } catch (error) {
      console.error('Error checking existing feedback:', error);
      throw error; // Propagate error to handle it properly in the calling code
    }
  }

  static async create(feedbackData: CompleteFeedbackData): Promise<{ success: boolean; sessionId?: string }> {
    try {
      // Double-check: prevent duplicate submissions at backend level
      const userEmail = feedbackData.user_email || 'anonymous@example.com';
      
      try {
        const hasAlreadySubmitted = await this.hasUserSubmittedFeedback(feedbackData.edition_id, userEmail);
        if (hasAlreadySubmitted) {
          console.error(`Duplicate feedback attempt blocked for user ${userEmail} and edition ${feedbackData.edition_id}`);
          throw new Error('Você já enviou seu feedback para esta edição. Cada pessoa pode participar apenas uma vez por mês.');
        }
      } catch (error) {
        // If verification fails, don't proceed - safety first
        if (error.message.includes('já enviou seu feedback')) {
          throw error; // Re-throw duplicate feedback error
        }
        throw new Error(`Erro ao verificar duplicação de feedback: ${error.message}`);
      }
      
      console.log('Saving feedback directly to database:', feedbackData);
      
      // Get user info
      let customerId = null;
      
      try {
        const customer = await User.me();
        if (customer) {
          customerId = customer.customer_id;
          userEmail = customer.email;
        }
      } catch (error) {
        console.warn('Could not load user, proceeding with anonymous session');
      }
      
      // 1. Insert into feedback_sessions
      const newSessionId = crypto.randomUUID();
      const { data: sessionData, error: sessionError } = await supabase
        .from('feedback_sessions')
        .insert({
          id: newSessionId,
          customer_id: customerId,
          edition_id: feedbackData.edition_id,
          user_email: userEmail,
          session_status: 'completed',
          completion_badge: feedbackData.completion_badge || '🎉 Testador Expert',
          final_message: feedbackData.final_message || '',
          completed_at: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          started_at: new Date().toISOString(), // Add started_at
        })
        .select('id')
        .single();

      if (sessionError) {
        throw new Error(`Error creating feedback session: ${sessionError.message}`);
      }

      const createdSessionId = sessionData.id;

      // 2. Insert product_feedback
      if (feedbackData.product_feedbacks && feedbackData.product_feedbacks.length > 0) {
        const productFeedbackInserts = feedbackData.product_feedbacks.map(pf => ({
          feedback_session_id: createdSessionId,
          product_name: pf.product_name,
          answers: pf.answers,
        }));
        
        const { error: productError } = await supabase
          .from('product_feedback')
          .insert(productFeedbackInserts);
          
        if (productError) {
          throw new Error(`Error inserting product feedback: ${productError.message}`);
        }
      }

      // 3. Insert experimentai_feedback
      if (feedbackData.experimentai_feedback) {
        const { error: experimentaiError } = await supabase
          .from('experimentai_feedback')
          .insert({
            feedback_session_id: createdSessionId,
            answers: feedbackData.experimentai_feedback.answers,
          });
          
        if (experimentaiError) {
          throw new Error(`Error inserting experimentai feedback: ${experimentaiError.message}`);
        }
      }

      // 4. Insert delivery_feedback
      if (feedbackData.delivery_feedback) {
        const { error: deliveryError } = await supabase
          .from('delivery_feedback')
          .insert({
            feedback_session_id: createdSessionId,
            answers: feedbackData.delivery_feedback.answers,
          });
          
        if (deliveryError) {
          throw new Error(`Error inserting delivery feedback: ${deliveryError.message}`);
        }
      }

      console.log('Feedback successfully saved to database:', createdSessionId);
      return { success: true, sessionId: createdSessionId };

    } catch (error: any) {
      console.error('Error saving feedback to database:', error);
      throw error;
    }
  }

  static async getSessionById(sessionId: string): Promise<{
    session: FeedbackSession;
    productFeedback: ProductFeedback[];
    experimentaiFeedback: ExperimentaiFeedback | null;
    deliveryFeedback: DeliveryFeedback | null;
  } | null> {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('feedback_sessions')
        .select(`
          *,
          product_feedback(*),
          experimentai_feedback(*),
          delivery_feedback(*)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      return {
        session,
        productFeedback: session.product_feedback || [],
        experimentaiFeedback: session.experimentai_feedback?.[0] || null,
        deliveryFeedback: session.delivery_feedback?.[0] || null
      };
    } catch (error) {
      console.error('Error fetching feedback session:', error);
      return null;
    }
  }

  static async getFeedbackStats(): Promise<{
    total_sessions: number;
    completed_sessions: number;
    average_satisfaction: number;
    top_rated_products: Array<{
      product_name: string;
      average_rating: number;
      total_responses: number;
    }>;
  }> {
    try {
      // Get session counts
      const { data: sessions, error: sessionsError } = await supabase
        .from('feedback_sessions')
        .select('id, session_status');

      if (sessionsError) throw sessionsError;

      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.session_status === 'completed').length;

      // Get average satisfaction
      // NOTE: This part will need to be updated to parse the 'answers' JSONB column
      // to extract overall_satisfaction, as the direct column no longer exists.
      // For now, it will likely return 0 or throw an error if overall_satisfaction is selected directly.
      const { data: satisfactionData, error: satisfactionError } = await supabase
        .from('experimentai_feedback')
        .select('answers'); // Select the answers JSONB column

      if (satisfactionError) throw satisfactionError;

      const satisfactionScores = satisfactionData.map(item => {
        const overallSatisfactionAnswer = item.answers?.find((ans: any) => ans.question_text === 'Qual sua satisfação geral com a Experimentaí?'); // Assuming this question text
        return overallSatisfactionAnswer ? overallSatisfactionAnswer.answer : null;
      }).filter(score => score !== null);

      const averageSatisfaction = satisfactionScores.length > 0
        ? satisfactionScores.reduce((sum: number, score: number) => sum + score, 0) / satisfactionScores.length
        : 0;

      // Get top rated products
      // NOTE: This part will also need to be updated to parse the 'answers' JSONB column
      // to extract experience_rating, as the direct column no longer exists.
      const { data: productData, error: productError } = await supabase
        .from('product_feedback')
        .select('product_name, answers'); // Select the answers JSONB column

      if (productError) throw productError;

      const productRatings = new Map();
      productData.forEach(item => {
        const experienceRatingAnswer = item.answers?.find((ans: any) => ans.question_text === 'Como você avalia sua experiência com este produto?'); // Assuming this question text
        if (experienceRatingAnswer) {
          if (!productRatings.has(item.product_name)) {
            productRatings.set(item.product_name, []);
          }
          productRatings.get(item.product_name).push(experienceRatingAnswer.answer);
        }
      });

      const topRatedProducts = Array.from(productRatings.entries())
        .map(([name, ratings]) => ({
          product_name: name,
          average_rating: ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length,
          total_responses: ratings.length
        }))
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 10);

      return {
        total_sessions: totalSessions,
        completed_sessions: completedSessions,
        average_satisfaction: Math.round(averageSatisfaction * 100) / 100,
        top_rated_products: topRatedProducts
      };
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      return {
        total_sessions: 0,
        completed_sessions: 0,
        average_satisfaction: 0,
        top_rated_products: []
      };
    }
  }

  static async getUserFeedbackHistory(userEmail: string): Promise<FeedbackSession[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_sessions')
        .select(`
          *,
          boxes(theme)
        `)
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user feedback history:', error);
      return [];
    }
  }
}