// Database type definitions
export interface Customer {
  customer_id: string;
  name: string;
  phone?: string;
  email: string;
  address?: string;
  cpf?: string;
  created_at?: string;
  stripe_customer_id?: string;
}

export interface Box {
  id: string;
  theme: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductsCatalog {
  id: string;
  name: string;
  brand: string;
  category?: string;
  description?: string;
  image_url?: string;
  sku?: string;
  price?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BoxProducts {
  id: string;
  box_id: string;
  product_id: string;
  quantity: number;
  created_at?: string;
}

export interface FeedbackSession {
  id: string;
  customer_id?: string;
  box_id?: string;
  user_email?: string;
  session_status: 'in_progress' | 'completed' | 'abandoned';
  completion_badge?: string;
  final_message?: string;
  ip_address?: string;
  user_agent?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFeedback {
  id: string;
  feedback_session_id: string;
  product_id?: string;
  product_name: string;
  experience_rating: number;
  would_buy: 'sim' | 'talvez' | 'nao';
  product_vibe?: string;
  main_attraction?: string;
  what_caught_attention?: string;
  created_at?: string;
}

export interface ExperimentaiFeedback {
  id: string;
  feedback_session_id: string;
  box_variety_rating: number;
  box_theme_rating: number;
  overall_satisfaction: number;
  would_recommend: boolean;
  favorite_product?: string;
  suggestions?: string;
  created_at?: string;
}

export interface DeliveryFeedback {
  id: string;
  feedback_session_id: string;
  delivery_time_rating: number;
  packaging_condition: number;
  delivery_experience: 'excelente' | 'boa' | 'ok' | 'ruim';
  delivery_notes?: string;
  created_at?: string;
}

// Combined types for API responses
export interface BoxWithProducts extends Box {
  products: ProductsCatalog[];
}

export interface CompleteFeedbackData {
  box_id: string;
  user_email?: string;
  product_feedbacks: Array<{
    product_name: string;
    experience_rating: number;
    would_buy: string;
    product_vibe?: string;
    main_attraction?: string;
    what_caught_attention?: string;
  }>;
  experimentai_feedback: {
    box_variety_rating: number;
    box_theme_rating: number;
    overall_satisfaction: number;
    would_recommend: boolean;
    favorite_product?: string;
  };
  delivery_feedback: {
    delivery_time_rating: number;
    packaging_condition: number;
    delivery_experience: string;
    final_message?: string;
  };
  completion_badge: string;
  final_message?: string;
}