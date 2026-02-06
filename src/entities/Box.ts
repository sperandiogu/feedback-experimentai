import { supabase, withRetry } from '@/lib/supabase';
import type { EditionWithProducts, Edition, Products } from '@/types/database';

export class EditionService {
  static async list(sortBy: string = '-created_at', limit: number = 10): Promise<EditionWithProducts[]> {
    try {
      return await withRetry(async () => {
        const isDescending = sortBy.startsWith('-');
        const sortField = isDescending ? sortBy.substring(1) : sortBy;

        const { data: editions, error: editionsError } = await supabase
          .from('edition')
          .select(`
            *,
            product_edition!inner(
              products!inner(*)
            )
          `)
          .order(sortField, { ascending: !isDescending })
          .limit(limit);

        if (editionsError) {
          throw new Error(`Database error: ${editionsError.message}`);
        }

        if (!editions || editions.length === 0) {
          throw new Error('No editions found in database');
        }

        // Transform the data to match expected structure
        const transformedEditions: EditionWithProducts[] = editions.map(edition => ({
          edition_id: edition.edition_id,
          edition: edition.edition,
          created_at: edition.created_at,
          updated_at: edition.updated_at,
          products: edition.product_edition.map((pe: any) => ({
            id: pe.products.id,
            name: pe.products.name,
            brand: pe.products.brand,
            category: pe.products.category,
            description: pe.products.description,
            image_url: pe.products.image_url,
            created_at: pe.products.created_at
          }))
        }));

        return transformedEditions;
      });
    } catch (error) {
      console.error('Failed to fetch editions from database:', error);
      throw error;
    }
  }

  static async getOldestUnansweredEdition(userEmail: string): Promise<EditionWithProducts | null> {
    try {
      return await withRetry(async () => {
        const { data: editions, error: editionsError } = await supabase
          .from('edition')
          .select(`
            *,
            product_edition!inner(
              products!inner(*)
            )
          `)
          .eq('is_delivered', true)
          .order('created_at', { ascending: true });

        if (editionsError) {
          throw new Error(`Database error: ${editionsError.message}`);
        }

        if (!editions || editions.length === 0) {
          return null;
        }

        const { data: submittedSessions, error: sessionsError } = await supabase
          .from('feedback_sessions')
          .select('edition_id')
          .eq('user_email', userEmail)
          .eq('session_status', 'completed');

        if (sessionsError) {
          throw new Error(`Database error: ${sessionsError.message}`);
        }

        const answeredEditionIds = new Set(
          (submittedSessions || []).map(s => s.edition_id)
        );

        const unanswered = editions.find(e => !answeredEditionIds.has(e.edition_id));

        if (!unanswered) {
          return null;
        }

        return {
          edition_id: unanswered.edition_id,
          edition: unanswered.edition,
          is_delivered: unanswered.is_delivered,
          created_at: unanswered.created_at,
          updated_at: unanswered.updated_at,
          products: unanswered.product_edition.map((pe: any) => ({
            id: pe.products.id,
            name: pe.products.name,
            brand: pe.products.brand,
            category: pe.products.category,
            description: pe.products.description,
            image_url: pe.products.image_url,
            created_at: pe.products.created_at
          }))
        };
      });
    } catch (error) {
      console.error('Failed to fetch oldest unanswered edition:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<EditionWithProducts | null> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('edition')
          .select(`
            *,
            product_edition!inner(
              products!inner(*)
            )
          `)
          .eq('edition_id', id)
          .single();

        if (error) {
          throw error;
        }

        return {
          edition_id: data.edition_id,
          edition: data.edition,
          created_at: data.created_at,
          updated_at: data.updated_at,
          products: data.product_edition.map((pe: any) => pe.products)
        };
      });
    } catch (error) {
      console.error('Error fetching edition by ID:', error);
      return null;
    }
  }

  static async getEditionStats(editionId: string): Promise<{
    total_feedback_sessions: number;
    average_ratings: {
      variety: number;
      theme: number;
      satisfaction: number;
    };
    product_ratings: Array<{
      product_name: string;
      average_rating: number;
      total_responses: number;
    }>;
  }> {
    try {
      // Get feedback sessions for this box
      const { data: sessions, error: sessionsError } = await supabase
        .from('feedback_sessions')
        .select(`
          id,
          experimentai_feedback(box_variety_rating, box_theme_rating, overall_satisfaction),
          product_feedback(product_name, experience_rating)
        `)
        .eq('edition_id', editionId)
        .eq('session_status', 'completed');

      if (sessionsError) throw sessionsError;

      const totalSessions = sessions.length;
      
      // Calculate average ratings
      const experimentaiRatings = sessions
        .map(s => s.experimentai_feedback?.[0])
        .filter(Boolean);

      const averageRatings = {
        variety: this.calculateAverage(experimentaiRatings.map(r => r.box_variety_rating)),
        theme: this.calculateAverage(experimentaiRatings.map(r => r.box_theme_rating)),
        satisfaction: this.calculateAverage(experimentaiRatings.map(r => r.overall_satisfaction))
      };

      // Calculate product ratings
      const productRatingsMap = new Map();
      sessions.forEach(session => {
        session.product_feedback?.forEach((pf: any) => {
          if (!productRatingsMap.has(pf.product_name)) {
            productRatingsMap.set(pf.product_name, []);
          }
          productRatingsMap.get(pf.product_name).push(pf.experience_rating);
        });
      });

      const productRatings = Array.from(productRatingsMap.entries()).map(([name, ratings]) => ({
        product_name: name,
        average_rating: this.calculateAverage(ratings),
        total_responses: ratings.length
      }));

      return {
        total_feedback_sessions: totalSessions,
        average_ratings,
        product_ratings: productRatings
      };
    } catch (error) {
      console.error('Error fetching edition stats:', error);
      return {
        total_feedback_sessions: 0,
        average_ratings: { variety: 0, theme: 0, satisfaction: 0 },
        product_ratings: []
      };
    }
  }

  private static calculateAverage(numbers: number[]): number {
    const validNumbers = numbers.filter(n => n != null && !isNaN(n));
    if (validNumbers.length === 0) return 0;
    return Math.round((validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length) * 100) / 100;
  }
}