/*
  # Add campaign fields to content_drafts table

  ## Changes
  This migration adds campaign-related fields to the content_drafts table to associate each draft with a specific campaign.

  ## New Columns
  - `campaign_name` (text) - Name of the campaign this content belongs to
  - `campaign_id` (uuid) - Unique identifier for the campaign

  ## Notes
  - Both fields are nullable to maintain backward compatibility with existing drafts
  - The campaign_id can be used to group multiple content drafts under a single campaign
*/

-- Add campaign_name column to content_drafts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'campaign_name'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN campaign_name text;
  END IF;
END $$;

-- Add campaign_id column to content_drafts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'campaign_id'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN campaign_id uuid;
  END IF;
END $$;

-- Create index on campaign_id for efficient campaign-based queries
CREATE INDEX IF NOT EXISTS content_drafts_campaign_id_idx ON content_drafts(campaign_id);
