/*
  # Adicionar suporte a perguntas específicas por produto

  1. Alterações na tabela questions
    - Adicionar coluna `product_id` (opcional)
    - Perguntas podem ser globais (product_id = null) ou específicas de um produto

  2. Funcionalidades
    - Perguntas globais aparecem para todos os produtos
    - Perguntas específicas aparecem apenas para o produto relacionado
    - Mantém compatibilidade com perguntas existentes
*/

-- Adicionar coluna product_id na tabela questions
ALTER TABLE questions 
ADD COLUMN product_id uuid REFERENCES products(id) ON DELETE SET NULL;

-- Adicionar índice para melhor performance
CREATE INDEX idx_questions_product_id ON questions(product_id);

-- Adicionar constraint de foreign key
ALTER TABLE questions 
ADD CONSTRAINT fk_questions_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Exemplos de perguntas específicas por produto
-- (Você pode adicionar suas perguntas específicas aqui)

-- Exemplo: Pergunta específica para produtos de skincare
INSERT INTO questions (
  category_id,
  question_text,
  question_type,
  is_required,
  order_index,
  config,
  product_id
) VALUES (
  (SELECT id FROM question_categories WHERE name = 'product'),
  'Como foi a textura do produto na sua pele?',
  'multiple_choice',
  false,
  10,
  '{"allow_multiple": false}',
  null -- Será definido quando soubermos o ID do produto específico
);

-- Adicionar opções para a pergunta de textura (exemplo)
INSERT INTO question_options (
  question_id,
  option_value,
  option_label,
  order_index
) VALUES 
  (
    (SELECT id FROM questions WHERE question_text = 'Como foi a textura do produto na sua pele?' LIMIT 1),
    'oleosa',
    'Oleosa',
    1
  ),
  (
    (SELECT id FROM questions WHERE question_text = 'Como foi a textura do produto na sua pele?' LIMIT 1),
    'seca',
    'Seca',
    2
  ),
  (
    (SELECT id FROM questions WHERE question_text = 'Como foi a textura do produto na sua pele?' LIMIT 1),
    'hidratante',
    'Hidratante',
    3
  ),
  (
    (SELECT id FROM questions WHERE question_text = 'Como foi a textura do produto na sua pele?' LIMIT 1),
    'pegajosa',
    'Pegajosa',
    4
  );