/*
  # Add Product-Specific Questions Support

  1. Changes
    - Add `product_id` column to `questions` table (nullable)
      - Allows questions to be either global (NULL) or product-specific (references products_catalog)
    - Create index for performance on queries filtering by category and product
    - Add foreign key constraint to ensure data integrity with products_catalog

  2. Business Logic
    - Questions with `product_id = NULL` are global and appear for all products
    - Questions with a specific `product_id` only appear for that product
    - Product-specific questions are particularly useful for:
      - Products with multiple flavors/variations
      - Products with unique characteristics
      - Custom feedback for specific items
    
  3. Performance
    - Composite index on (category_id, product_id, order_index) for efficient querying
    
  4. Backward Compatibility
    - Existing questions remain global (product_id NULL)
    - Existing queries continue to work without modification
*/

-- Add product_id column to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE questions ADD COLUMN product_id uuid REFERENCES products_catalog(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create composite index for efficient querying
DROP INDEX IF EXISTS idx_questions_category_product_order;
CREATE INDEX idx_questions_category_product_order 
ON questions(category_id, product_id, order_index) 
WHERE is_active = true;

-- Add comment explaining the product_id column
COMMENT ON COLUMN questions.product_id IS 'If NULL, question is global and applies to all products. If set, question only applies to the specific product.';