import { supabase, withRetry } from '@/lib/supabase';
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
      const { data: { session } } = await supabase.auth.getSession();
      
      return await withRetry(async () => {
        const sessionId = crypto.randomUUID();
        
        let userEmail = feedbackData.user_email;
        let customerId = null;
        
        if (session?.user?.email) {
          userEmail = session.user.email;
        }
        
        try {
          const customer = await User.me();
          if (customer) {
            customerId = customer.customer_id;
            userEmail = customer.email;
          }
        } catch (error) {
          console.log('No customer found, proceeding with anonymous feedback');
        }
        
        const { data: insertedSessionData, error: sessionError } = await supabase
          .from('feedback_sessions')
          .insert({
            id: sessionId,
            customer_id: customerId,
            edition_id: feedbackData.edition_id,
            user_email: userEmail,
            session_status: 'completed',
            completion_badge: feedbackData.completion_badge,
            final_message: feedbackData.final_message,
            completed_at: new Date().toISOString(),
            user_agent: navigator.userAgent
          })
          .select()
          .single();

        if (sessionError) {
          console.error('Error creating feedback session:', sessionError);
          throw sessionError;
        }

        console.log('Feedback session created:', insertedSessionData);

        if (feedbackData.product_feedbacks && feedbackData.product_feedbacks.length > 0) {
          const productFeedbackData = feedbackData.product_feedbacks.map(pf => ({
            feedback_session_id: sessionId,
            product_name: pf.product_name,
            experience_rating: pf.experience_rating,
            would_buy: pf.would_buy,
            product_vibe: pf.product_vibe,
            main_attraction: pf.main_attraction,
            what_caught_attention: pf.what_caught_attention
          }));

          const { error: productError } = await supabase
            .from('product_feedback')
            .insert(productFeedbackData);

          if (productError) {
            console.error('Error creating product feedback:', productError);
            throw productError;
          }
        }

        // Create Experimentaí feedback
        if (feedbackData.experimentai_feedback) {
          const { error: experimentaiError } = await supabase
            .from('experimentai_feedback')
            .insert({
              feedback_session_id: sessionId,
              box_variety_rating: feedbackData.experimentai_feedback.box_variety_rating,
              box_theme_rating: feedbackData.experimentai_feedback.box_theme_rating,
              overall_satisfaction: feedbackData.experimentai_feedback.overall_satisfaction,
              would_recommend: feedbackData.experimentai_feedback.would_recommend,
              favorite_product: feedbackData.experimentai_feedback.favorite_product
            });

          if (experimentaiError) {
            console.error('Error creating experimentai feedback:', experimentaiError);
            throw experimentaiError;
          }
        }

        // Create delivery feedback
        if (feedbackData.delivery_feedback) {
          const { error: deliveryError } = await supabase
            .from('delivery_feedback')
            .insert({
              feedback_session_id: sessionId,
              delivery_time_rating: feedbackData.delivery_feedback.delivery_time_rating,
              packaging_condition: feedbackData.delivery_feedback.packaging_condition,
              delivery_experience: feedbackData.delivery_feedback.delivery_experience,
              delivery_notes: feedbackData.delivery_feedback.final_message
            });

          if (deliveryError) {
            console.error('Error creating delivery feedback:', deliveryError);
            throw deliveryError;
          }
        }

        console.log('Feedback successfully saved to database');

        return { success: true, sessionId };
      });
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