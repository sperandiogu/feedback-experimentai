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
  static async create(feedbackData: CompleteFeedbackData): Promise<{ success: boolean; sessionId?: string }> {
    try {
      const sessionId = crypto.randomUUID();
      
      let userEmail = feedbackData.user_email || 'anonymous@example.com';
      let customerId = null;
      
      // Try to get customer info but don't fail if not available
      try {
        const customer = await User.me();
        if (customer) {
          customerId = customer.customer_id;
          userEmail = customer.email;
        }
      } catch (error) {
        console.warn('Could not load user, proceeding with anonymous session');
      }
      
      console.log('Creating feedback session with data:', {
        sessionId,
        customerId,
        userEmail,
        edition_id: feedbackData.edition_id
      });
      
      // Create feedback session - try with regular client first, then public
      let insertedSessionData;
      let sessionError;
      
      try {
        const result = await supabase
          .from('feedback_sessions')
          .insert({
            id: sessionId,
            customer_id: customerId,
            edition_id: feedbackData.edition_id,
            user_email: userEmail,
            session_status: 'completed',
            completion_badge: feedbackData.completion_badge || '🎉 Testador Expert',
            final_message: feedbackData.final_message || '',
            completed_at: new Date().toISOString(),
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
          })
          .select()
          .single();
          
        insertedSessionData = result.data;
        sessionError = result.error;
      } catch (error) {
        console.warn('Failed with regular client, trying public client');
        const result = await supabasePublic
          .from('feedback_sessions')
          .insert({
            id: sessionId,
            customer_id: customerId,
            edition_id: feedbackData.edition_id,
            user_email: userEmail,
            session_status: 'completed',
            completion_badge: feedbackData.completion_badge || '🎉 Testador Expert',
            final_message: feedbackData.final_message || '',
            completed_at: new Date().toISOString(),
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
          })
          .select()
          .single();
          
        insertedSessionData = result.data;
        sessionError = result.error;
      }

      if (sessionError) {
        console.error('Error creating feedback session:', sessionError);
        throw new Error(`Failed to create feedback session: ${sessionError.message}`);
      }

      console.log('Feedback session created:', insertedSessionData);

      // Insert product feedback
      if (feedbackData.product_feedbacks && feedbackData.product_feedbacks.length > 0) {
        const productFeedbackData = feedbackData.product_feedbacks.map(pf => ({
          feedback_session_id: sessionId,
          product_name: pf.product_name,
          experience_rating: pf.experience_rating || 1,
          would_buy: pf.would_buy || 'nao',
          product_vibe: pf.product_vibe || '',
          main_attraction: pf.main_attraction || '',
          what_caught_attention: pf.what_caught_attention || ''
        }));

        const { error: productError } = await supabase
          .from('product_feedback')
          .insert(productFeedbackData);

        if (productError) {
          console.error('Error creating product feedback:', productError);
          // Don't throw, just log the error and continue
          console.warn('Product feedback failed, continuing...');
        }
      }

      // Create Experimentaí feedback
      if (feedbackData.experimentai_feedback) {
        const { error: experimentaiError } = await supabase
          .from('experimentai_feedback')
          .insert({
            feedback_session_id: sessionId,
            box_variety_rating: feedbackData.experimentai_feedback.box_variety_rating || 1,
            box_theme_rating: feedbackData.experimentai_feedback.box_theme_rating || 1,
            overall_satisfaction: feedbackData.experimentai_feedback.overall_satisfaction || 1,
            would_recommend: feedbackData.experimentai_feedback.would_recommend || false,
            favorite_product: feedbackData.experimentai_feedback.favorite_product || ''
          });

        if (experimentaiError) {
          console.error('Error creating experimentai feedback:', experimentaiError);
          console.warn('Experimentai feedback failed, continuing...');
        }
      }

      // Create delivery feedback
      if (feedbackData.delivery_feedback) {
        const { error: deliveryError } = await supabase
          .from('delivery_feedback')
          .insert({
            feedback_session_id: sessionId,
            delivery_time_rating: feedbackData.delivery_feedback.delivery_time_rating || 1,
            packaging_condition: feedbackData.delivery_feedback.packaging_condition || 1,
            delivery_experience: feedbackData.delivery_feedback.delivery_experience || 'ok',
            delivery_notes: feedbackData.delivery_feedback.final_message || ''
          });

        if (deliveryError) {
          console.error('Error creating delivery feedback:', deliveryError);
          console.warn('Delivery feedback failed, continuing...');
        }
      }

      console.log('Feedback successfully saved to database');

      return { success: true, sessionId };
    } catch (error) {
      console.error('Error saving feedback:', error);
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
      const { data: satisfactionData, error: satisfactionError } = await supabase
        .from('experimentai_feedback')
        .select('overall_satisfaction');

      if (satisfactionError) throw satisfactionError;

      const averageSatisfaction = satisfactionData.length > 0
        ? satisfactionData.reduce((sum, item) => sum + item.overall_satisfaction, 0) / satisfactionData.length
        : 0;

      // Get top rated products
      const { data: productData, error: productError } = await supabase
        .from('product_feedback')
        .select('product_name, experience_rating');

      if (productError) throw productError;

      const productRatings = new Map();
      productData.forEach(item => {
        if (!productRatings.has(item.product_name)) {
          productRatings.set(item.product_name, []);
        }
        productRatings.get(item.product_name).push(item.experience_rating);
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