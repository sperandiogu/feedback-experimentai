/*
  # Fix RLS policies for feedback system

  1. Security Changes
    - Update RLS policies to allow public inserts for feedback tables
    - Maintain read restrictions for privacy
    - Allow anonymous feedback creation

  2. Tables Updated
    - feedback_sessions: Allow public insert
    - product_feedback: Allow public insert  
    - experimentai_feedback: Allow public insert
    - delivery_feedback: Allow public insert
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow users to read their own feedback_sessions" ON feedback_sessions;
DROP POLICY IF EXISTS "Allow public insert to feedback_sessions" ON feedback_sessions;
DROP POLICY IF EXISTS "Allow public insert to product_feedback" ON product_feedback;
DROP POLICY IF EXISTS "Allow public insert to experimentai_feedback" ON experimentai_feedback;
DROP POLICY IF EXISTS "Allow public insert to delivery_feedback" ON delivery_feedback;

-- Create permissive policies for feedback creation
CREATE POLICY "Allow public feedback session creation"
  ON feedback_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public product feedback creation"
  ON product_feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public experimentai feedback creation"
  ON experimentai_feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delivery feedback creation"
  ON delivery_feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow reading own feedback sessions (for authenticated users)
CREATE POLICY "Allow users to read their own feedback_sessions"
  ON feedback_sessions
  FOR SELECT
  TO public
  USING (
    user_email = (current_setting('request.jwt.claims', true)::json ->> 'email')
    OR user_email IS NULL
  );