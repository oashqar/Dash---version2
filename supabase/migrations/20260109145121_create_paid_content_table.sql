/*
  # Create paid_content table

  ## Overview
  This migration creates the paid_content table for storing paid social and display ad campaign content generation requests.

  ## New Tables
  
  ### `paid_content`
  - `id` (uuid, primary key) - Unique identifier for each paid content request
  - `user_id` (uuid, foreign key) - References auth.users, identifies the content owner
  - `created_at` (timestamptz) - Timestamp when the request was created
  - `updated_at` (timestamptz) - Timestamp when the request was last updated
  
  ### Campaign & Objective
  - `campaign_name` (text, not null) - Name of the campaign
  - `primary_goal` (text, not null) - Brand Awareness, Traffic, Leads, Sales, App Installs
  - `target_platform` (text, not null) - Meta, TikTok, Google/YouTube, LinkedIn, X
  
  ### Audience Definition
  - `audience_type` (text, not null) - Cold, Warm, Retargeting
  - `audience_characteristics` (text, not null) - Interests, pain points, desires
  - `age_range` (text, nullable) - Optional age range
  - `gender` (text, nullable) - Optional gender targeting
  - `location` (text, nullable) - Optional location targeting
  - `language` (text, nullable) - Optional language preference
  
  ### Budget & Duration
  - `budget_type` (text, not null) - Daily or Lifetime
  - `budget_amount` (numeric, not null) - Budget amount
  - `start_date` (date, nullable) - Campaign start date
  - `end_date` (date, nullable) - Campaign end date
  - `optimization_preference` (text, not null) - Conversions, Reach, Engagement, Lowest Cost
  
  ### Creative Direction
  - `content_idea` (text, not null) - Core content concept
  - `brand_tone` (text, not null) - Professional, Friendly, Bold, Luxury, Playful
  - `cta_objective` (text, not null) - Learn More, Buy Now, Sign Up, Download, Contact Us
  - `visual_style` (text, not null) - Product-focused, Lifestyle, UGC, Minimal, Bold
  
  ### Output Preferences
  - `generate_ad_copy` (boolean, default true) - Whether to generate ad copy
  - `generate_headlines` (boolean, default true) - Whether to generate headlines
  - `generate_cta_text` (boolean, default true) - Whether to generate CTA text
  - `generate_image_prompt` (boolean, default true) - Whether to generate image prompt
  - `generate_video_hooks` (boolean, default true) - Whether to generate video hook ideas
  - `number_of_variations` (integer, default 3) - Number of variations to generate
  
  ### Generated Content
  - `generated_ad_copy` (text, nullable) - Generated primary ad copy
  - `generated_headlines` (text, nullable) - Generated headline variations (JSON array stored as text)
  - `generated_cta_suggestions` (text, nullable) - Generated CTA suggestions (JSON array stored as text)
  - `generated_image_prompt` (text, nullable) - Generated image prompt
  - `generated_video_hooks` (text, nullable) - Generated video hook ideas (JSON array stored as text)
  - `status` (text, default 'draft') - Current status: draft, generated, saved

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the paid_content table
  - Users can only view their own paid content
  - Users can only insert content associated with their own user_id
  - Users can only update their own paid content
  - Users can only delete their own paid content
  
  ## Indexes
  - Primary index on id
  - Index on user_id for efficient user-specific queries
  - Index on created_at for chronological sorting

  ## Important Notes
  1. All paid content is associated with authenticated users only
  2. Optional fields allow for flexible audience targeting
  3. Generated content is stored as text (JSON arrays stored as text for simplicity)
  4. Default status is 'draft' for all new records
  5. Budget amount uses numeric type for precision
*/

-- Create paid_content table
CREATE TABLE IF NOT EXISTS paid_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  campaign_name text NOT NULL,
  primary_goal text NOT NULL,
  target_platform text NOT NULL,
  
  audience_type text NOT NULL,
  audience_characteristics text NOT NULL,
  age_range text,
  gender text,
  location text,
  language text,
  
  budget_type text NOT NULL,
  budget_amount numeric NOT NULL,
  start_date date,
  end_date date,
  optimization_preference text NOT NULL,
  
  content_idea text NOT NULL,
  brand_tone text NOT NULL,
  cta_objective text NOT NULL,
  visual_style text NOT NULL,
  
  generate_ad_copy boolean DEFAULT true NOT NULL,
  generate_headlines boolean DEFAULT true NOT NULL,
  generate_cta_text boolean DEFAULT true NOT NULL,
  generate_image_prompt boolean DEFAULT true NOT NULL,
  generate_video_hooks boolean DEFAULT true NOT NULL,
  number_of_variations integer DEFAULT 3 NOT NULL,
  
  generated_ad_copy text,
  generated_headlines text,
  generated_cta_suggestions text,
  generated_image_prompt text,
  generated_video_hooks text,
  status text DEFAULT 'draft' NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS paid_content_user_id_idx ON paid_content(user_id);
CREATE INDEX IF NOT EXISTS paid_content_created_at_idx ON paid_content(created_at DESC);

-- Enable Row Level Security
ALTER TABLE paid_content ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own paid content
CREATE POLICY "Users can view own paid content"
  ON paid_content
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert only their own paid content
CREATE POLICY "Users can insert own paid content"
  ON paid_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update only their own paid content
CREATE POLICY "Users can update own paid content"
  ON paid_content
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own paid content
CREATE POLICY "Users can delete own paid content"
  ON paid_content
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);