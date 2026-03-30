/*
  # Fix: Restore emoji config for "Como foi testar esse produto?" question

  1. Problem
    - The product testing question config was empty ({})
    - Without the emojis array in config, the emoji_rating renderer shows nothing
    - The question appeared in the DOM but with no interactive options

  2. Fix
    - Restore the 5-point emoji scale config on the existing question
    - Ensure the question is active with correct category
*/

-- Fix the empty config - restore emoji scale
UPDATE questions
SET config = '{"min": 1, "max": 5, "emojis": [{"value": 1, "emoji": "😖", "label": "Não curti"}, {"value": 2, "emoji": "😐", "label": "Ok"}, {"value": 3, "emoji": "🙂", "label": "Gostei"}, {"value": 4, "emoji": "😊", "label": "Adorei"}, {"value": 5, "emoji": "😍", "label": "Amei"}]}',
    is_active = true,
    category_id = (SELECT id FROM question_categories WHERE name = 'product')
WHERE question_text = 'Como foi testar esse produto?'
  AND question_type = 'emoji_rating';
