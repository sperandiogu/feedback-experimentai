/*
  # Fix: Ensure "Como foi testar esse produto?" question has correct category

  1. Problem
    - The product testing question ("Como foi testar esse produto?") is not appearing
    - The category assignment may be incorrect or the category/question may be inactive

  2. Fix
    - Ensure the 'product' category exists and is active
    - Ensure the question has the correct category_id pointing to 'product'
    - Ensure the question is active
    - Re-insert the question if it was accidentally deleted
*/

-- Step 1: Ensure the 'product' category is active
UPDATE question_categories
SET is_active = true
WHERE name = 'product';

-- Step 2: Fix category_id if the question exists but has wrong category
UPDATE questions
SET category_id = (SELECT id FROM question_categories WHERE name = 'product'),
    is_active = true
WHERE question_text = 'Como foi testar esse produto?'
  AND question_type = 'emoji_rating';

-- Step 3: Insert the question if it doesn't exist (e.g., was accidentally deleted)
INSERT INTO questions (category_id, question_text, question_type, order_index, config, is_active)
SELECT
  (SELECT id FROM question_categories WHERE name = 'product'),
  'Como foi testar esse produto?',
  'emoji_rating',
  1,
  '{"min": 1, "max": 5, "emojis": [{"value": 1, "emoji": "😖", "label": "Não curti"}, {"value": 2, "emoji": "😐", "label": "Ok"}, {"value": 3, "emoji": "🙂", "label": "Gostei"}, {"value": 4, "emoji": "😊", "label": "Adorei"}, {"value": 5, "emoji": "😍", "label": "Amei"}]}',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM questions
  WHERE question_text = 'Como foi testar esse produto?'
    AND question_type = 'emoji_rating'
);
