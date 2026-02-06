/*
  # Remove is_delivered column from edition table

  1. Changes
    - Remove `is_delivered` column from `edition` table
    - This column is no longer needed because delivery status is determined
      from the `order` table's `status` column (value = 'delivered')

  2. Rationale
    - The `order` table already tracks delivery status per customer per edition
    - Using `order.status = 'delivered'` is more accurate and per-customer
    - Eliminates data duplication and potential inconsistency
*/

ALTER TABLE edition DROP COLUMN IF EXISTS is_delivered;
