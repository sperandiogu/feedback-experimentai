/*
  # Feedback System Database Schema

  1. New Tables
    - `feedback_sessions` - Main feedback session records
    - `product_feedback` - Individual product feedback entries
    - `experimentai_feedback` - Company-specific feedback
    - `delivery_feedback` - Delivery experience feedback
    - `products_catalog` - Enhanced product catalog
    - `box_products` - Many-to-many relationship between boxes and products

  2. Enhancements to Existing Tables
    - Add indexes for better performance
    - Add constraints for data integrity
    - Add triggers for automatic timestamps

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access
*/

-- Create products catalog table
CREATE TABLE IF NOT EXISTS products_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  category text,
  description text,
  image_url text,
  sku text UNIQUE,
  price numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create box_products junction table
CREATE TABLE IF NOT EXISTS box_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id uuid NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products_catalog(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(box_id, product_id)
);

-- Create feedback_sessions table
CREATE TABLE IF NOT EXISTS feedback_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer(customer_id) ON DELETE SET NULL,
  box_id uuid REFERENCES boxes(id) ON DELETE SET NULL,
  user_email text,
  session_status text DEFAULT 'in_progress' CHECK (session_status IN ('in_progress', 'completed', 'abandoned')),
  completion_badge text,
  final_message text,
  ip_address inet,
  user_agent text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_feedback table
CREATE TABLE IF NOT EXISTS product_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_session_id uuid NOT NULL REFERENCES feedback_sessions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products_catalog(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  experience_rating integer CHECK (experience_rating BETWEEN 1 AND 4),
  would_buy text CHECK (would_buy IN ('sim', 'talvez', 'nao')),
  product_vibe text,
  main_attraction text,
  what_caught_attention text,
  created_at timestamptz DEFAULT now()
);

-- Create experimentai_feedback table
CREATE TABLE IF NOT EXISTS experimentai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_session_id uuid NOT NULL REFERENCES feedback_sessions(id) ON DELETE CASCADE,
  box_variety_rating integer CHECK (box_variety_rating BETWEEN 1 AND 5),
  box_theme_rating integer CHECK (box_theme_rating BETWEEN 1 AND 5),
  overall_satisfaction integer CHECK (overall_satisfaction BETWEEN 1 AND 5),
  would_recommend boolean,
  favorite_product text,
  suggestions text,
  created_at timestamptz DEFAULT now()
);

-- Create delivery_feedback table
CREATE TABLE IF NOT EXISTS delivery_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_session_id uuid NOT NULL REFERENCES feedback_sessions(id) ON DELETE CASCADE,
  delivery_time_rating integer CHECK (delivery_time_rating BETWEEN 1 AND 5),
  packaging_condition integer CHECK (packaging_condition BETWEEN 1 AND 5),
  delivery_experience text CHECK (delivery_experience IN ('excelente', 'boa', 'ok', 'ruim')),
  delivery_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_customer_id ON feedback_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_box_id ON feedback_sessions(box_id);
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_status ON feedback_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_created_at ON feedback_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_product_feedback_session_id ON product_feedback(feedback_session_id);
CREATE INDEX IF NOT EXISTS idx_product_feedback_product_id ON product_feedback(product_id);
CREATE INDEX IF NOT EXISTS idx_product_feedback_rating ON product_feedback(experience_rating);

CREATE INDEX IF NOT EXISTS idx_experimentai_feedback_session_id ON experimentai_feedback(feedback_session_id);
CREATE INDEX IF NOT EXISTS idx_delivery_feedback_session_id ON delivery_feedback(feedback_session_id);

CREATE INDEX IF NOT EXISTS idx_products_catalog_brand ON products_catalog(brand);
CREATE INDEX IF NOT EXISTS idx_products_catalog_category ON products_catalog(category);
CREATE INDEX IF NOT EXISTS idx_products_catalog_active ON products_catalog(is_active);

CREATE INDEX IF NOT EXISTS idx_box_products_box_id ON box_products(box_id);
CREATE INDEX IF NOT EXISTS idx_box_products_product_id ON box_products(product_id);

-- Enable Row Level Security
ALTER TABLE products_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE experimentai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to products_catalog"
  ON products_catalog FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public read access to box_products"
  ON box_products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to feedback_sessions"
  ON feedback_sessions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to read their own feedback_sessions"
  ON feedback_sessions FOR SELECT
  TO public
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Allow public insert to product_feedback"
  ON product_feedback FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to experimentai_feedback"
  ON experimentai_feedback FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to delivery_feedback"
  ON delivery_feedback FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_catalog_updated_at
  BEFORE UPDATE ON products_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_sessions_updated_at
  BEFORE UPDATE ON feedback_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO products_catalog (name, brand, category, description, sku, price) VALUES
  ('Açaí Premium Bowl', 'AçaíMax', 'Sobremesas', 'Açaí cremoso e natural', 'ACAI001', 15.90),
  ('Água de Coco Natural', 'Coco Fresh', 'Bebidas', 'Água de coco 100% natural', 'COCO001', 8.50),
  ('Biscoito Integral', 'VitaLife', 'Snacks', 'Biscoito integral com fibras', 'BISC001', 12.30),
  ('Chocolate 70% Cacau', 'ChocoBrasil', 'Doces', 'Chocolate amargo premium', 'CHOC001', 18.90),
  ('Granola Artesanal', 'GranoVida', 'Cereais', 'Granola com frutas secas', 'GRAN001', 22.50)
ON CONFLICT (sku) DO NOTHING;

-- Link products to existing boxes (assuming box with theme 'Sabores do Verão' exists)
DO $$
DECLARE
  box_record RECORD;
  product_record RECORD;
BEGIN
  -- Get the first box
  SELECT * INTO box_record FROM boxes LIMIT 1;
  
  IF box_record.id IS NOT NULL THEN
    -- Link first 3 products to this box
    FOR product_record IN 
      SELECT * FROM products_catalog WHERE is_active = true LIMIT 3
    LOOP
      INSERT INTO box_products (box_id, product_id, quantity)
      VALUES (box_record.id, product_record.id, 1)
      ON CONFLICT (box_id, product_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;