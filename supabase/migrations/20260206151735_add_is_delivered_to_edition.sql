/*
  # Add delivery status to editions

  1. Changes
    - Add `is_delivered` boolean column to `edition` table (default false)
      - Controls whether an edition is available for feedback
      - Editions that haven't been shipped yet should not appear for feedback
    - Set all existing editions except the most recent (Fevereiro) to delivered

  2. Business Logic
    - Only delivered editions appear in the feedback flow
    - Users see the oldest unanswered delivered edition first
    - Admins can toggle delivery status when a new edition ships
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'edition' AND column_name = 'is_delivered'
  ) THEN
    ALTER TABLE edition ADD COLUMN is_delivered boolean DEFAULT false;
  END IF;
END $$;

UPDATE edition SET is_delivered = true WHERE edition IN ('Outubro', 'Novembro', 'Dezembro', 'Janeiro');
UPDATE edition SET is_delivered = false WHERE edition = 'Fevereiro';

COMMENT ON COLUMN edition.is_delivered IS 'Whether this edition has been shipped to subscribers. Only delivered editions are available for feedback.';
