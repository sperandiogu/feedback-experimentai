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

export interface Edition {
  edition_id: string;
  edition: string;
  created_at?: string;
  updated_at?: string;
}

export interface Products {
  id: string;
  name: string;
  brand: string;
  category?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface ProductEdition {
  edition_id: string;
  product_id: string;
}

export interface FeedbackSession {
  id: string;
  customer_id?: string;
  edition_id?: string;
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
  answers?: Array<{ question_id: string; question_text: string; question_type: string; answer: any }>;
  created_at?: string;
}

export interface ExperimentaiFeedback {
  id: string;
  feedback_session_id: string;
  answers?: Array<{ question_id: string; question_text: string; question_type: string; answer: any }>;
  created_at?: string;
}

export interface DeliveryFeedback {
  id: string;
  feedback_session_id: string;
  answers?: Array<{ question_id: string; question_text: string; question_type: string; answer: any }>;
  created_at?: string;
}

// Combined types for API responses
export interface EditionWithProducts extends Edition {
  products: Products[];
}

interface QuestionAnswer {
  question_id: string;
  question_text: string;
  question_type: string;
  answer: any;
}

export interface CompleteFeedbackData {
  edition_id: string;
  user_email?: string;
  product_feedbacks: Array<{
    product_name: string;
    answers: QuestionAnswer[];
  }>;
  experimentai_feedback: {
    answers: QuestionAnswer[];
  };
  delivery_feedback: {
    answers: QuestionAnswer[];
  };
  completion_badge: string;
  final_message?: string;
}