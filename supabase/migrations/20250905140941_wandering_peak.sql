/*
  # Ajustar tabelas para receber dados do webhook

  1. Modificações nas tabelas existentes
    - Remover colunas específicas antigas do product_feedback
    - Remover colunas específicas antigas do experimentai_feedback  
    - Remover colunas específicas antigas do delivery_feedback
    - Adicionar coluna answers (JSONB) em todas as tabelas de feedback

  2. Estrutura das respostas
    - answers: Array de objetos com question_id, question_text, question_type, answer
    - Permite flexibilidade total nas perguntas e respostas

  3. Manter compatibilidade
    - Manter product_name no product_feedback para identificação
    - Manter campos essenciais de identificação
*/

-- Modificar tabela product_feedback
ALTER TABLE product_feedback 
DROP COLUMN IF EXISTS experience_rating,
DROP COLUMN IF EXISTS would_buy,
DROP COLUMN IF EXISTS product_vibe,
DROP COLUMN IF EXISTS main_attraction,
DROP COLUMN IF EXISTS what_caught_attention;

ALTER TABLE product_feedback 
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb;

-- Modificar tabela experimentai_feedback
ALTER TABLE experimentai_feedback 
DROP COLUMN IF EXISTS box_variety_rating,
DROP COLUMN IF EXISTS box_theme_rating,
DROP COLUMN IF EXISTS overall_satisfaction,
DROP COLUMN IF EXISTS would_recommend,
DROP COLUMN IF EXISTS favorite_product,
DROP COLUMN IF EXISTS suggestions;

ALTER TABLE experimentai_feedback 
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb;

-- Modificar tabela delivery_feedback
ALTER TABLE delivery_feedback 
DROP COLUMN IF EXISTS delivery_time_rating,
DROP COLUMN IF EXISTS packaging_condition,
DROP COLUMN IF EXISTS delivery_experience,
DROP COLUMN IF EXISTS delivery_notes;

ALTER TABLE delivery_feedback 
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb;

-- Remover constraints antigas que não são mais necessárias
DO $$
BEGIN
  -- Remove constraint do product_feedback se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_feedback_would_buy_check' 
    AND table_name = 'product_feedback'
  ) THEN
    ALTER TABLE product_feedback DROP CONSTRAINT product_feedback_would_buy_check;
  END IF;

  -- Remove constraint do product_feedback se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_feedback_experience_rating_check' 
    AND table_name = 'product_feedback'
  ) THEN
    ALTER TABLE product_feedback DROP CONSTRAINT product_feedback_experience_rating_check;
  END IF;

  -- Remove constraints do experimentai_feedback se existirem
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'experimentai_feedback_box_variety_rating_check' 
    AND table_name = 'experimentai_feedback'
  ) THEN
    ALTER TABLE experimentai_feedback DROP CONSTRAINT experimentai_feedback_box_variety_rating_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'experimentai_feedback_box_theme_rating_check' 
    AND table_name = 'experimentai_feedback'
  ) THEN
    ALTER TABLE experimentai_feedback DROP CONSTRAINT experimentai_feedback_box_theme_rating_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'experimentai_feedback_overall_satisfaction_check' 
    AND table_name = 'experimentai_feedback'
  ) THEN
    ALTER TABLE experimentai_feedback DROP CONSTRAINT experimentai_feedback_overall_satisfaction_check;
  END IF;

  -- Remove constraints do delivery_feedback se existirem
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'delivery_feedback_delivery_time_rating_check' 
    AND table_name = 'delivery_feedback'
  ) THEN
    ALTER TABLE delivery_feedback DROP CONSTRAINT delivery_feedback_delivery_time_rating_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'delivery_feedback_packaging_condition_check' 
    AND table_name = 'delivery_feedback'
  ) THEN
    ALTER TABLE delivery_feedback DROP CONSTRAINT delivery_feedback_packaging_condition_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'delivery_feedback_delivery_experience_check' 
    AND table_name = 'delivery_feedback'
  ) THEN
    ALTER TABLE delivery_feedback DROP CONSTRAINT delivery_feedback_delivery_experience_check;
  END IF;
END $$;

-- Adicionar índices para melhor performance nas consultas JSONB
CREATE INDEX IF NOT EXISTS idx_product_feedback_answers ON product_feedback USING GIN (answers);
CREATE INDEX IF NOT EXISTS idx_experimentai_feedback_answers ON experimentai_feedback USING GIN (answers);
CREATE INDEX IF NOT EXISTS idx_delivery_feedback_answers ON delivery_feedback USING GIN (answers);

-- Comentários para documentar a nova estrutura
COMMENT ON COLUMN product_feedback.answers IS 'Array de objetos com question_id, question_text, question_type, answer';
COMMENT ON COLUMN experimentai_feedback.answers IS 'Array de objetos com question_id, question_text, question_type, answer';
COMMENT ON COLUMN delivery_feedback.answers IS 'Array de objetos com question_id, question_text, question_type, answer';