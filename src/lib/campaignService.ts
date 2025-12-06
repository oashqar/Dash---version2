import { supabase } from './supabase';

export type Platform = 'facebook' | 'x' | 'instagram';

export interface CampaignContent {
  id: string;
  campaign_id: string;
  platform: Platform;
  text_content: string | null;
  image_link: string | null;
  video_link: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  campaign_name: string;
  content_idea: string;
  knowledge_base_file: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithContent extends Campaign {
  campaign_content: CampaignContent[];
}

export async function getApprovedCampaigns(): Promise<CampaignWithContent[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_content (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }

  return data as CampaignWithContent[];
}

export async function searchCampaignsByName(searchTerm: string): Promise<CampaignWithContent[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_content (*)
    `)
    .eq('user_id', user.id)
    .ilike('campaign_name', `%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching campaigns:', error);
    throw error;
  }

  return data as CampaignWithContent[];
}

export async function createCampaign(
  campaignName: string,
  contentIdea: string,
  knowledgeBaseFile?: string
): Promise<Campaign> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: user.id,
      campaign_name: campaignName,
      content_idea: contentIdea,
      knowledge_base_file: knowledgeBaseFile || null,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }

  return data as Campaign;
}

export async function addCampaignContent(
  campaignId: string,
  platform: Platform,
  textContent?: string,
  imageLink?: string,
  videoLink?: string
): Promise<CampaignContent> {
  const { data, error } = await supabase
    .from('campaign_content')
    .insert({
      campaign_id: campaignId,
      platform,
      text_content: textContent || null,
      image_link: imageLink || null,
      video_link: videoLink || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding campaign content:', error);
    throw error;
  }

  return data as CampaignContent;
}

export async function updateCampaignStatus(
  campaignId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('campaigns')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', campaignId);

  if (error) {
    console.error('Error updating campaign status:', error);
    throw error;
  }
}
