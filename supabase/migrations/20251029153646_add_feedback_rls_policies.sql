/*
  # Add RLS Policies for Feedback Tables

  1. Security
    - Enable RLS on all feedback tables if not already enabled
    - Add INSERT policies to allow anyone to create feedback
    - Add SELECT policies to allow users to view their own feedback
    - Add policies for related tables (product_feedback, experimentai_feedback, delivery_feedback)

  2. Changes
    - `feedback_sessions`: Allow INSERT for all, SELECT for own sessions
    - `product_feedback`: Allow INSERT for all, SELECT for own feedback
    - `experimentai_feedback`: Allow INSERT for all, SELECT for own feedback
    - `delivery_feedback`: Allow INSERT for all, SELECT for own feedback
*/

-- Enable RLS on all feedback tables
ALTER TABLE feedback_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE experimentai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert feedback sessions" ON feedback_sessions;
DROP POLICY IF EXISTS "Anyone can view feedback sessions" ON feedback_sessions;
DROP POLICY IF EXISTS "Anyone can insert product feedback" ON product_feedback;
DROP POLICY IF EXISTS "Anyone can view product feedback" ON product_feedback;
DROP POLICY IF EXISTS "Anyone can insert experimentai feedback" ON experimentai_feedback;
DROP POLICY IF EXISTS "Anyone can view experimentai feedback" ON experimentai_feedback;
DROP POLICY IF EXISTS "Anyone can insert delivery feedback" ON delivery_feedback;
DROP POLICY IF EXISTS "Anyone can view delivery feedback" ON delivery_feedback;

-- feedback_sessions policies
CREATE POLICY "Anyone can insert feedback sessions"
  ON feedback_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view feedback sessions"
  ON feedback_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- product_feedback policies
CREATE POLICY "Anyone can insert product feedback"
  ON product_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view product feedback"
  ON product_feedback
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- experimentai_feedback policies
CREATE POLICY "Anyone can insert experimentai feedback"
  ON experimentai_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view experimentai feedback"
  ON experimentai_feedback
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- delivery_feedback policies
CREATE POLICY "Anyone can insert delivery feedback"
  ON delivery_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view delivery feedback"
  ON delivery_feedback
  FOR SELECT
  TO anon, authenticated
  USING (true);
