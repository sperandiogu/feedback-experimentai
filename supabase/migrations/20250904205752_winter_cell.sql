/*
  # Permitir inserções anônimas para tabelas de feedback

  1. Políticas RLS
    - Permite inserção anônima em `feedback_sessions`
    - Permite inserção anônima em `product_feedback`
    - Permite inserção anônima em `experimentai_feedback`
    - Permite inserção anônima em `delivery_feedback`
  
  2. Segurança
    - Mantém RLS habilitado
    - Permite apenas operações de INSERT para anon
    - Leitura continua restrita
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow public feedback session creation" ON feedback_sessions;
DROP POLICY IF EXISTS "Allow public product feedback creation" ON product_feedback;
DROP POLICY IF EXISTS "Allow public experimentai feedback creation" ON experimentai_feedback;
DROP POLICY IF EXISTS "Allow public delivery feedback creation" ON delivery_feedback;

-- Create new permissive INSERT policies for anon role
CREATE POLICY "Enable insert for anon users" ON feedback_sessions
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "Enable insert for anon users" ON product_feedback
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "Enable insert for anon users" ON experimentai_feedback
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "Enable insert for anon users" ON delivery_feedback
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Also allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users" ON feedback_sessions
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users" ON product_feedback
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users" ON experimentai_feedback
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users" ON delivery_feedback
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);