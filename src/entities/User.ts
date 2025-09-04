import { supabase, withRetry } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import type { Customer } from '@/types/database';

export class User {
  static async me(): Promise<Customer | null> {
    try {
      return await withRetry(async () => {
        // Get Firebase user instead of Supabase user
        const firebaseUser = auth.currentUser;
        
        if (!firebaseUser || !firebaseUser.email) {
          console.warn('No Firebase user found or no email');
          return null;
        }

        const { data, error } = await supabase
          .from('customer')
          .select('*')
          .eq('email', firebaseUser.email)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // User not found in customer table, create new record
            return await this.createCustomerFromAuth(firebaseUser);
          }
          throw error;
        }

        return data;
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async createCustomerFromAuth(firebaseUser: any): Promise<Customer> {
    const customerData = {
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('customer')
      .insert(customerData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async updateMyUserData(updates: Partial<Customer>): Promise<{ success: boolean; data?: Customer }> {
    try {
      return await withRetry(async () => {
        const currentUser = await this.me();
        if (!currentUser) {
          throw new Error('User not found');
        }

        const { data, error } = await supabase
          .from('customer')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('customer_id', currentUser.customer_id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return { success: true, data };
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      return { success: false };
    }
  }

  static async getUserStats(userId: string): Promise<{
    total_feedback_sessions: number;
    completed_sessions: number;
    average_satisfaction: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('feedback_sessions')
        .select(`
          id,
          session_status,
          experimentai_feedback!inner(overall_satisfaction)
        `)
        .eq('customer_id', userId);

      if (error) throw error;

      const totalSessions = data.length;
      const completedSessions = data.filter(s => s.session_status === 'completed').length;
      const satisfactionScores = data
        .map(s => s.experimentai_feedback?.[0]?.overall_satisfaction)
        .filter(score => score !== undefined);
      
      const averageSatisfaction = satisfactionScores.length > 0
        ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
        : 0;

      return {
        total_feedback_sessions: totalSessions,
        completed_sessions: completedSessions,
        average_satisfaction: Math.round(averageSatisfaction * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        total_feedback_sessions: 0,
        completed_sessions: 0,
        average_satisfaction: 0
      };
    }
  }
}