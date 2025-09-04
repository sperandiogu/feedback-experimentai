/*
  # Sistema de Perguntas Dinâmicas para Feedback

  1. Novas Tabelas
    - `question_categories` - Categorias de perguntas (produtos, experimentai, entrega)
    - `questions` - Perguntas individuais com configurações
    - `question_options` - Opções de resposta para perguntas de múltipla escolha

  2. Estrutura
    - Perguntas organizadas por categoria e ordem
    - Suporte a diferentes tipos de pergunta (rating, multiple_choice, text, boolean)
    - Opções configuráveis para cada pergunta
    - Sistema flexível para adicionar novas perguntas

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de leitura pública para permitir acesso às perguntas
*/

-- Tabela de categorias de perguntas
CREATE TABLE IF NOT EXISTS question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de perguntas
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES question_categories(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('rating', 'multiple_choice', 'text', 'boolean', 'emoji_rating')),
  is_required boolean DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de opções para perguntas de múltipla escolha
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_value text NOT NULL,
  option_label text NOT NULL,
  option_icon text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura
CREATE POLICY "Allow public read access to question_categories"
  ON question_categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public read access to questions"
  ON questions
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public read access to question_options"
  ON question_options
  FOR SELECT
  TO public
  USING (is_active = true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_questions_category_order ON questions(category_id, order_index);
CREATE INDEX IF NOT EXISTS idx_question_options_question_order ON question_options(question_id, order_index);
CREATE INDEX IF NOT EXISTS idx_question_categories_order ON question_categories(order_index);

-- Inserir categorias padrão
INSERT INTO question_categories (name, display_name, description, order_index) VALUES
('product', 'Avaliação de Produtos', 'Perguntas sobre cada produto individual', 1),
('experimentai', 'Sobre a Experimentaí', 'Perguntas sobre a experiência geral com a box', 2),
('delivery', 'Sobre a Entrega', 'Perguntas sobre o processo de entrega', 3)
ON CONFLICT (name) DO NOTHING;

-- Inserir perguntas para produtos
INSERT INTO questions (category_id, question_text, question_type, order_index, config) VALUES
(
  (SELECT id FROM question_categories WHERE name = 'product'),
  'Como foi testar esse produto?',
  'emoji_rating',
  1,
  '{"min": 1, "max": 4, "emojis": [{"value": 1, "emoji": "😖", "label": "Não curti"}, {"value": 2, "emoji": "😐", "label": "Ok"}, {"value": 3, "emoji": "🙂", "label": "Gostei"}, {"value": 4, "emoji": "😍", "label": "Amei"}]}'
),
(
  (SELECT id FROM question_categories WHERE name = 'product'),
  'Você compraria?',
  'multiple_choice',
  2,
  '{}'
),
(
  (SELECT id FROM question_categories WHERE name = 'product'),
  'O que mais chamou sua atenção?',
  'multiple_choice',
  3,
  '{}'
),
(
  (SELECT id FROM question_categories WHERE name = 'product'),
  'Quer comentar algo específico?',
  'text',
  4,
  '{"placeholder": "Ex: textura cremosa, cheiro incrível... (opcional)", "required": false}'
);

-- Inserir opções para pergunta "Você compraria?"
INSERT INTO question_options (question_id, option_value, option_label, order_index) VALUES
(
  (SELECT id FROM questions WHERE question_text = 'Você compraria?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'sim', 'Sim!', 1
),
(
  (SELECT id FROM questions WHERE question_text = 'Você compraria?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'talvez', 'Talvez', 2
),
(
  (SELECT id FROM questions WHERE question_text = 'Você compraria?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'nao', 'Não', 3
);

-- Inserir opções para pergunta "O que mais chamou sua atenção?"
INSERT INTO question_options (question_id, option_value, option_label, option_icon, order_index) VALUES
(
  (SELECT id FROM questions WHERE question_text = 'O que mais chamou sua atenção?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'sabor', 'Sabor', '👅', 1
),
(
  (SELECT id FROM questions WHERE question_text = 'O que mais chamou sua atenção?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'textura', 'Textura', '✋', 2
),
(
  (SELECT id FROM questions WHERE question_text = 'O que mais chamou sua atenção?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'aroma', 'Cheiro', '👃', 3
),
(
  (SELECT id FROM questions WHERE question_text = 'O que mais chamou sua atenção?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'embalagem', 'Embalagem', '📦', 4
),
(
  (SELECT id FROM questions WHERE question_text = 'O que mais chamou sua atenção?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'preco', 'Preço', '💰', 5
),
(
  (SELECT id FROM questions WHERE question_text = 'O que mais chamou sua atenção?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'marca', 'Marca', '🏷️', 6
),
(
  (SELECT id FROM questions WHERE question_text = 'O que mais chamou sua atenção?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'inovacao', 'Inovação', '🚀', 7
),
(
  (SELECT id FROM questions WHERE question_text = 'O que mais chamou sua atenção?' AND category_id = (SELECT id FROM question_categories WHERE name = 'product')),
  'qualidade', 'Qualidade', '⭐', 8
);

-- Inserir perguntas para Experimentaí
INSERT INTO questions (category_id, question_text, question_type, order_index, config) VALUES
(
  (SELECT id FROM question_categories WHERE name = 'experimentai'),
  'Variedade de produtos na box',
  'rating',
  1,
  '{"min": 1, "max": 5, "icon": "star"}'
),
(
  (SELECT id FROM question_categories WHERE name = 'experimentai'),
  'Curadoria do tema',
  'rating',
  2,
  '{"min": 1, "max": 5, "icon": "star"}'
),
(
  (SELECT id FROM question_categories WHERE name = 'experimentai'),
  'Satisfação geral com a Experimentaí',
  'rating',
  3,
  '{"min": 1, "max": 5, "icon": "heart"}'
),
(
  (SELECT id FROM question_categories WHERE name = 'experimentai'),
  'Indicaria para um amigo?',
  'boolean',
  4,
  '{"true_label": "Com certeza! 🙌", "false_label": "Não indicaria 🤷‍♀️"}'
);

-- Inserir perguntas para entrega
INSERT INTO questions (category_id, question_text, question_type, order_index, config) VALUES
(
  (SELECT id FROM question_categories WHERE name = 'delivery'),
  'Prazo de entrega',
  'rating',
  1,
  '{"min": 1, "max": 5, "icon": "star"}'
),
(
  (SELECT id FROM question_categories WHERE name = 'delivery'),
  'Estado da embalagem',
  'rating',
  2,
  '{"min": 1, "max": 5, "icon": "star"}'
),
(
  (SELECT id FROM question_categories WHERE name = 'delivery'),
  'Experiência geral de entrega',
  'multiple_choice',
  3,
  '{}'
),
(
  (SELECT id FROM question_categories WHERE name = 'delivery'),
  'Quer deixar um recado para as marcas?',
  'text',
  4,
  '{"placeholder": "Seu feedback é muito valioso... (opcional)", "required": false}'
);

-- Inserir opções para pergunta "Experiência geral de entrega"
INSERT INTO question_options (question_id, option_value, option_label, order_index) VALUES
(
  (SELECT id FROM questions WHERE question_text = 'Experiência geral de entrega' AND category_id = (SELECT id FROM question_categories WHERE name = 'delivery')),
  'excelente', 'Excelente! 🌟', 1
),
(
  (SELECT id FROM questions WHERE question_text = 'Experiência geral de entrega' AND category_id = (SELECT id FROM question_categories WHERE name = 'delivery')),
  'boa', 'Boa 👍', 2
),
(
  (SELECT id FROM questions WHERE question_text = 'Experiência geral de entrega' AND category_id = (SELECT id FROM question_categories WHERE name = 'delivery')),
  'ok', 'Ok 😐', 3
),
(
  (SELECT id FROM questions WHERE question_text = 'Experiência geral de entrega' AND category_id = (SELECT id FROM question_categories WHERE name = 'delivery')),
  'ruim', 'Ruim 😕', 4
);