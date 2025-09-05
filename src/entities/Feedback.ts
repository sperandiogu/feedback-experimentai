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
      const { data, error } = await supabase
        .from('feedback_sessions')
        .select('id')
        .eq('edition_id', editionId)
        .eq('user_email', userEmail)
        .eq('session_status', 'completed')
        .limit(1);

      if (error) {
        console.error('Error checking existing feedback:', error);
        return false; // Allow feedback if we can't check
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking existing feedback:', error);
      return false; // Allow feedback if we can't check
    }
  }

  static async create(feedbackData: CompleteFeedbackData): Promise<{ success: boolean; sessionId?: string }> {
    try {
      console.log('Sending feedback to webhook:', feedbackData);
      
      // Get user info
      let userEmail = feedbackData.user_email || 'anonymous@example.com';
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
      
      // Prepare webhook payload
      const webhookPayload = {
        session_id: crypto.randomUUID(),
        customer_id: customerId,
        user_email: userEmail,
        edition_id: feedbackData.edition_id,
        session_status: 'completed',
        completion_badge: feedbackData.completion_badge || '🎉 Testador Expert',
        final_message: feedbackData.final_message || '',
        completed_at: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        product_feedbacks: feedbackData.product_feedbacks?.map((pf: any) => ({
          product_name: pf.product_name,
          answers: pf.answers || []
        })) || [],
        experimentai_feedback: {
          answers: feedbackData.experimentai_feedback?.answers || []
        },
        delivery_feedback: {
          answers: feedbackData.delivery_feedback?.answers || []
        }
      };
      
      // Send to webhook
      const response = await fetch('https://primary-production-0c5d.up.railway.app/webhook-test/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook response error:', errorText);
        throw new Error(`Webhook failed with status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Feedback successfully sent to webhook:', result);
      
      return { success: true, sessionId: webhookPayload.session_id };
    } catch (error) {
      console.error('Error sending feedback to webhook:', error);
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