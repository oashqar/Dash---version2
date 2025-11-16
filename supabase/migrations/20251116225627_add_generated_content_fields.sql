/*
  # Add Generated Content Fields to content_drafts Table

  ## Overview
  This migration adds fields to store the AI-generated content (text and image URL) returned from the n8n webhook response.

  ## Changes
  
  ### Modified Tables
  
  #### `content_drafts`
  - `generated_text` (text, nullable) - The AI-generated text content returned from webhook
  - `generated_image_url` (text, nullable) - The URL of the AI-generated image returned from webhook
  - `generated_at` (timestamptz, nullable) - Timestamp when the content was generated

  ## Important Notes
  1. These fields will be null when the draft is first created
  2. They will be populated when the webhook returns the generated content
  3. Users can view and update these fields via RLS policies already in place
*/

-- Add generated content fields to content_drafts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'generated_text'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN generated_text text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'generated_image_url'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN generated_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'generated_at'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN generated_at timestamptz;
  END IF;
END $$;