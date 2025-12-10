/*
  # Add Fifth Emoji Option to Product Rating Question

  1. Changes
    - Updates the "Como foi testar esse produto?" question configuration
    - Changes from 4-point scale (1-4) to 5-point scale (1-5)
    - Adds new emoji option "😊 Adorei" between "Gostei" and "Amei"
  
  2. New Scale
    - 1: 😖 Não curti
    - 2: 😐 Ok
    - 3: 🙂 Gostei
    - 4: 😊 Adorei (NEW)
    - 5: 😍 Amei
  
  3. Notes
    - This aligns all rating questions to use consistent 1-5 scale
    - Existing feedback responses remain unchanged (historical data preserved)
    - New responses will use the 5-point scale
*/

-- Update the product rating question to use 5 emoji options
UPDATE questions
SET config = '{"min": 1, "max": 5, "emojis": [{"value": 1, "emoji": "😖", "label": "Não curti"}, {"value": 2, "emoji": "😐", "label": "Ok"}, {"value": 3, "emoji": "🙂", "label": "Gostei"}, {"value": 4, "emoji": "😊", "label": "Adorei"}, {"value": 5, "emoji": "😍", "label": "Amei"}]}'
WHERE question_text = 'Como foi testar esse produto?'
  AND question_type = 'emoji_rating'
  AND category_id = (SELECT id FROM question_categories WHERE name = 'product');