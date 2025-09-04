/*
  # Desabilitar RLS para tabelas de feedback

  1. Desabilita RLS completamente para todas as tabelas de feedback
  2. Remove todas as políticas existentes que estão causando conflito
  3. Permite inserção livre para qualquer usuário
*/

-- Desabilitar RLS para todas as tabelas de feedback
ALTER TABLE feedback_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE experimentai_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_feedback DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Allow users to read their own feedback_sessions" ON feedback_sessions;
DROP POLICY IF EXISTS "Enable insert for anon users" ON feedback_sessions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON feedback_sessions;
DROP POLICY IF EXISTS "Allow anon insert feedback_sessions" ON feedback_sessions;
DROP POLICY IF EXISTS "Allow authenticated insert feedback_sessions" ON feedback_sessions;

DROP POLICY IF EXISTS "Enable insert for anon users" ON product_feedback;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON product_feedback;
DROP POLICY IF EXISTS "Allow anon insert product_feedback" ON product_feedback;
DROP POLICY IF EXISTS "Allow authenticated insert product_feedback" ON product_feedback;

DROP POLICY IF EXISTS "Enable insert for anon users" ON experimentai_feedback;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON experimentai_feedback;
DROP POLICY IF EXISTS "Allow anon insert experimentai_feedback" ON experimentai_feedback;
DROP POLICY IF EXISTS "Allow authenticated insert experimentai_feedback" ON experimentai_feedback;

DROP POLICY IF EXISTS "Enable insert for anon users" ON delivery_feedback;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON delivery_feedback;
DROP POLICY IF EXISTS "Allow anon insert delivery_feedback" ON delivery_feedback;
DROP POLICY IF EXISTS "Allow authenticated insert delivery_feedback" ON delivery_feedback;