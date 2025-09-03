import { supabase, withRetry } from '@/lib/supabase';
import type { BoxWithProducts, Box, ProductsCatalog } from '@/types/database';

export class Box {
  static async list(sortBy: string = '-created_at', limit: number = 10): Promise<BoxWithProducts[]> {
    try {
      return await withRetry(async () => {
        // Parse sort parameter
        const isDescending = sortBy.startsWith('-');
        const sortField = isDescending ? sortBy.substring(1) : sortBy;
        const sortOrder = isDescending ? 'desc' : 'asc';
      // Check if we're using placeholder URL (development mode)
      if (import.meta.env.VITE_SUPABASE_URL?.includes('placeholder')) {
        console.warn('Using placeholder Supabase URL - falling back to mock data');
        return this.getMockBoxes();
      }

      const result = await withRetry(async () => {
        const { data: boxes, error: boxesError } = await supabase
          .from('boxes')
          .select(`
            *,
            box_products!inner(
              quantity,
              products_catalog!inner(*)
            )
          `)
          .order(sortField, { ascending: !isDescending })
          .limit(limit);

        if (boxesError) {
          console.warn('Database error, using mock data:', boxesError);
          throw new Error(`Database error: ${boxesError.message}`);
        }

        if (!boxes || boxes.length === 0) {
          console.warn('No boxes found, using mock data');
          throw new Error('No boxes found');
        }

        // Transform the data to match expected structure
        const transformedBoxes: BoxWithProducts[] = boxes.map(box => ({
          id: box.id,
          theme: box.theme,
          description: box.description,
          created_at: box.created_at,
          updated_at: box.updated_at,
          products: box.box_products.map((bp: any) => ({
            id: bp.products_catalog.id,
            name: bp.products_catalog.name,
            brand: bp.products_catalog.brand,
            category: bp.products_catalog.category,
            description: bp.products_catalog.description,
            image_url: bp.products_catalog.image_url,
            sku: bp.products_catalog.sku,
            price: bp.products_catalog.price,
            is_active: bp.products_catalog.is_active,
            created_at: bp.products_catalog.created_at,
      });

      return result;
          }))
        }));

        return transformedBoxes;
      });
    } catch (error) {
      console.warn('Failed to fetch boxes from database, using mock data:', error);
      return this.getMockBoxes();
    }
  }

  static async getById(id: string): Promise<BoxWithProducts | null> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('boxes')
          .select(`
            *,
            box_products!inner(
              quantity,
              products_catalog!inner(*)
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        return {
          id: data.id,
          theme: data.theme,
          description: data.description,
          created_at: data.created_at,
          updated_at: data.updated_at,
          products: data.box_products.map((bp: any) => bp.products_catalog)
        };
      });
    } catch (error) {
      console.error('Error fetching box by ID:', error);
      return null;
    }
  }

  static async getBoxStats(boxId: string): Promise<{
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
        .eq('box_id', boxId)
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
      console.error('Error fetching box stats:', error);
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

  private static getMockBoxes(): BoxWithProducts[] {
    return [
      {
        id: 'mock-box-1',
        theme: 'Sabores do Verão',
        description: 'Uma seleção especial de produtos refrescantes para o verão',
        created_at: new Date().toISOString(),
        products: [
          {
            id: 'mock-product-1',
            name: 'Açaí Premium Bowl',
            brand: 'AçaíMax',
            category: 'Sobremesas',
            description: 'Açaí cremoso e natural',
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-product-2',
            name: 'Água de Coco Natural',
            brand: 'Coco Fresh',
            category: 'Bebidas',
            description: 'Água de coco 100% natural',
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-product-3',
            name: 'Biscoito Integral',
            brand: 'VitaLife',
            category: 'Snacks',
            description: 'Biscoito integral com fibras',
            is_active: true,
            created_at: new Date().toISOString()
          }
        ]
      }
    ];
  }
}