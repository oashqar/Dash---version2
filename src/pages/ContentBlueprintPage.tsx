import { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { Sidebar } from '../components/Sidebar';

type Platform = 'Facebook' | 'Twitter (X)' | 'Instagram' | '';
type Format = 'Text Only' | 'Image + Text' | 'Video Post' | '';
type AssetSource = 'AI Generate' | 'Upload My Own' | '';

interface ContentDraft {
  idea: string;
  platform: Platform;
  
  format: Format;
  
  assetSource: AssetSource;
  knowledgeBaseFile: File | null;
  assetFile: File | null;
}

function ContentBlueprintPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waitingForWebhook, setWaitingForWebhook] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [userUploadedImageUrl, setUserUploadedImageUrl] = useState<string | null>(null);
  const [userUploadedVideoUrl, setUserUploadedVideoUrl] = useState<string | null>(null);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [webhookTimeout, setWebhookTimeout] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const [contentDraft, setContentDraft] = useState<ContentDraft>({
    idea: '',
    platform: '',
    format: '',
    assetSource: '',
    knowledgeBaseFile: null,
    assetFile: null,
  });

  useEffect(() => {
    if (contentDraft.format === 'Text Only') {
      setContentDraft(prev => ({
        ...prev,
        assetSource: '',
        assetFile: null,
      }));
    }
  }, [contentDraft.format]);

  useEffect(() => {
    if (contentDraft.assetSource !== 'Upload My Own') {
      setContentDraft(prev => ({
        ...prev,
        assetFile: null,
      }));
    }
  }, [contentDraft.assetSource]);

  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentDraft(prev => ({ ...prev, idea: e.target.value }));
  };

  const handlePlatformChange = (platform: Platform) => {
    setContentDraft(prev => ({ ...prev, platform }));
  };

  const handleFormatChange = (format: Format) => {
    setContentDraft(prev => ({ ...prev, format }));
  };

  const handleAssetSourceChange = (assetSource: AssetSource) => {
    setContentDraft(prev => ({ ...prev, assetSource }));
  };

  const handleKnowledgeBaseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setContentDraft(prev => ({ ...prev, knowledgeBaseFile: file }));
  };

  const handleAssetFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setContentDraft(prev => ({ ...prev, assetFile: null }));
      return;
    }

    setError(null);
    setSuccess(null);

    const fileType = file.type;
    const format = contentDraft.format;

    if (format === 'Image + Text' && !fileType.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.) for an Image + Text post.');
      e.target.value = '';
      return;
    }

    if (format === 'Video Post' && !fileType.startsWith('video/')) {
      setError('Please upload a video file (MP4, MOV, etc.) for a Video Post.');
      e.target.value = '';
      return;
    }

    setContentDraft(prev => ({ ...prev, assetFile: file }));

    if (!user?.id) {
      setError('User not authenticated. Please sign in to upload files.');
      return;
    }

    setUploadingFile(true);

    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filePath = `OwnMedia/user-${user.id}/${timestamp}_${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('user-media')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      if (currentDraftId) {
        const updateData: any = {
          is_media_ready: false,
        };

        if (format === 'Image + Text') {
          updateData.user_uploaded_image_url = publicUrl;
          setUserUploadedImageUrl(publicUrl);
        } else if (format === 'Video Post') {
          updateData.user_uploaded_video_url = publicUrl;
          setUserUploadedVideoUrl(publicUrl);
        }

        const { error: updateError } = await supabase
          .from('content_drafts')
          .update(updateData)
          .eq('id', currentDraftId);

        if (updateError) {
          throw updateError;
        }

        setSuccess(`${format === 'Image + Text' ? 'Image' : 'Video'} uploaded successfully and draft updated!`);
      } else {
        if (format === 'Image + Text') {
          setUserUploadedImageUrl(publicUrl);
        } else if (format === 'Video Post') {
          setUserUploadedVideoUrl(publicUrl);
        }
        setSuccess(`${format === 'Image + Text' ? 'Image' : 'Video'} uploaded successfully! It will be saved when you generate the content draft.`);
      }

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Failed to upload file: ${err.message}`);
      setContentDraft(prev => ({ ...prev, assetFile: null }));
      e.target.value = '';
    } finally {
      setUploadingFile(false);
    }
  };

  const handleTestWebhook = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTestingWebhook(true);
    setError(null);
    setSuccess(null);
    setWaitingForWebhook(true);
    setWebhookTimeout(false);
    setGeneratedText(null);
    setGeneratedImageUrl(null);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const webhookPayload = {
        user_id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
        idea: contentDraft.idea.trim() || 'Test content idea',
        platform: contentDraft.platform || 'Facebook',
        format: contentDraft.format || 'Text Only',
        asset_source: contentDraft.format === 'Text Only' ? null : contentDraft.assetSource,
        knowledge_base_file_name: contentDraft.knowledgeBaseFile?.name || null,
        asset_file_name: contentDraft.assetFile?.name || null,
        test_mode: true,
      };

      console.log('=== TEST WEBHOOK REQUEST START ===');
      console.log('Webhook URL: https://myaistaff.app.n8n.cloud/webhook-test/PostBluePrint');
      console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

      let extractedText = null;
      let extractedImageUrl = null;

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Webhook timeout after 2 minutes')), 120000);
      });

      try {
        const webhookPromise = (async () => {
          const webhookResponse = await fetch('https://myaistaff.app.n8n.cloud/webhook-test/PostBluePrint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
          });

          console.log('Webhook response status:', webhookResponse.status);
          console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));

          if (webhookResponse.ok) {
            const responseText = await webhookResponse.text();
            console.log('Raw webhook response:', responseText);

            let webhookData;
            try {
              webhookData = JSON.parse(responseText);
              console.log('Parsed webhook data:', JSON.stringify(webhookData, null, 2));
            } catch (parseError) {
              console.error('Failed to parse webhook response as JSON:', parseError);
              throw new Error('Webhook returned invalid JSON');
            }

            if (Array.isArray(webhookData) && webhookData.length > 0) {
              const responseData = webhookData[0];
              console.log('Processing array response, first element:', responseData);
              extractedText = responseData.generated_text || responseData.facebookOutput?.[0] || null;
              extractedImageUrl = responseData.generated_image_url || responseData.url?.[0] || null;
            } else if (typeof webhookData === 'object' && webhookData !== null) {
              console.log('Processing object response');
              extractedText = webhookData.generated_text || webhookData.text || webhookData.facebookOutput?.[0] || null;
              extractedImageUrl = webhookData.generated_image_url || webhookData.url?.[0] || webhookData.image_url || null;
            }

            console.log('=== EXTRACTED DATA ===');
            console.log('Generated Text:', extractedText);
            console.log('Generated Image URL:', extractedImageUrl);

            setGeneratedText(extractedText);
            setGeneratedImageUrl(extractedImageUrl);
          } else {
            console.error('Webhook request failed with status:', webhookResponse.status);
            throw new Error(`Webhook request failed: ${webhookResponse.status}`);
          }

          console.log('=== TEST WEBHOOK REQUEST END ===');
        })();

        await Promise.race([webhookPromise, timeoutPromise]);

      } catch (webhookError: any) {
        console.error('❌ TEST WEBHOOK REQUEST FAILED');
        console.error('Error message:', webhookError.message);
        console.error('Error name:', webhookError.name);
        console.error('Error stack:', webhookError.stack);

        if (webhookError.message.includes('timeout')) {
          setWebhookTimeout(true);
          setError('Test webhook request timed out after 2 minutes.');
        } else {
          setError(`Test webhook failed: ${webhookError.message}`);
        }
      }

      if (extractedText || extractedImageUrl) {
        setSuccess('Test webhook successful! Content generated.');
      } else if (!webhookTimeout) {
        setSuccess('Test webhook sent successfully, but no content was returned.');
      }

    } catch (err: any) {
      console.error('Test webhook error:', err);
      setError(err.message || 'Failed to test webhook');
    } finally {
      setTestingWebhook(false);
      setWaitingForWebhook(false);
    }
  };

  const getAcceptedFileTypes = () => {
    if (contentDraft.format === 'Image + Text') {
      return '.jpg,.jpeg,.png,.gif';
    } else if (contentDraft.format === 'Video Post') {
      return '.mp4,.mov,.avi';
    }
    return '';
  };

  const isFormValid = () => {
    if (!contentDraft.idea.trim()) return false;
    if (!contentDraft.platform) return false;
    if (!contentDraft.format) return false;

    if (contentDraft.format !== 'Text Only') {
      if (!contentDraft.assetSource) return false;
      if (contentDraft.assetSource === 'Upload My Own' && !contentDraft.assetFile) return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const webhookPayload = {
        user_id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
        idea: contentDraft.idea.trim(),
        platform: contentDraft.platform,
        format: contentDraft.format,
        asset_source: contentDraft.format === 'Text Only' ? null : contentDraft.assetSource,
        knowledge_base_file_name: contentDraft.knowledgeBaseFile?.name || null,
        asset_file_name: contentDraft.assetFile?.name || null,
      };

      const draftData = {
        user_id: user.id,
        created_at: new Date().toISOString(),
        idea: contentDraft.idea.trim(),
        platform: contentDraft.platform,
        format: contentDraft.format,
        asset_source: contentDraft.format === 'Text Only' ? null : contentDraft.assetSource,
        knowledge_base_file_name: contentDraft.knowledgeBaseFile?.name || null,
        asset_file_name: contentDraft.assetFile?.name || null,
        status: 'draft_created',
      };

      const { data, error: insertError } = await supabase
        .from('content_drafts')
        .insert([draftData])
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log('Draft saved successfully:', data);

      const draftId = data[0]?.id;
      setCurrentDraftId(draftId);

      if (contentDraft.assetSource === 'Upload My Own' && (userUploadedImageUrl || userUploadedVideoUrl)) {
        const initialUpdateData: any = {
          is_media_ready: false,
        };
        if (contentDraft.format === 'Image + Text' && userUploadedImageUrl) {
          initialUpdateData.user_uploaded_image_url = userUploadedImageUrl;
        }
        if (contentDraft.format === 'Video Post' && userUploadedVideoUrl) {
          initialUpdateData.user_uploaded_video_url = userUploadedVideoUrl;
        }

        if (Object.keys(initialUpdateData).length > 1) {
          await supabase
            .from('content_drafts')
            .update(initialUpdateData)
            .eq('id', draftId);
        }
      }

      console.log('Preparing to send webhook with payload:', {
        ...webhookPayload,
        draft_id: draftId,
      });

      setWaitingForWebhook(true);
      setWebhookTimeout(false);
      setGeneratedText(null);
      if (contentDraft.assetSource !== 'Upload My Own') {
        setGeneratedImageUrl(null);
        setGeneratedVideoUrl(null);
      }

      let extractedText = null;
      let extractedImageUrl = null;

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Webhook timeout after 2 minutes')), 120000);
      });

      try {
        const webhookPromise = (async () => {
        console.log('=== WEBHOOK REQUEST START ===');
        console.log('Webhook URL: https://myaistaff.app.n8n.cloud/webhook-test/PostBluePrint');
        console.log('Payload:', JSON.stringify({ ...webhookPayload, draft_id: draftId }, null, 2));

        const webhookResponse = await fetch('https://myaistaff.app.n8n.cloud/webhook-test/PostBluePrint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...webhookPayload,
            draft_id: draftId,
          }),
        });

        console.log('Webhook response status:', webhookResponse.status);
        console.log('Webhook response ok:', webhookResponse.ok);
        console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));

        if (webhookResponse.ok) {
          const responseText = await webhookResponse.text();
          console.log('Raw webhook response:', responseText);

          let webhookData;
          try {
            webhookData = JSON.parse(responseText);
            console.log('Parsed webhook data:', JSON.stringify(webhookData, null, 2));
          } catch (parseError) {
            console.error('Failed to parse webhook response as JSON:', parseError);
            throw new Error('Webhook returned invalid JSON');
          }

          let extractedVideoUrl: string | null = null;

          if (Array.isArray(webhookData) && webhookData.length > 0) {
            const responseData = webhookData[0];
            console.log('Processing array response, first element:', responseData);
            extractedText = responseData.generated_text || responseData.post_content || responseData.facebookOutput?.[0] || null;
            extractedImageUrl = responseData.generated_image_url || responseData.url?.[0] || null;
            extractedVideoUrl = responseData.generated_video_url || responseData.video_url || null;
          } else if (typeof webhookData === 'object' && webhookData !== null) {
            console.log('Processing object response');
            extractedText = webhookData.generated_text || webhookData.post_content || webhookData.text || webhookData.facebookOutput?.[0] || null;
            extractedImageUrl = webhookData.generated_image_url || webhookData.url?.[0] || webhookData.image_url || null;
            extractedVideoUrl = webhookData.generated_video_url || webhookData.video_url || null;
          }

          if (extractedText && typeof extractedText === 'string') {
            extractedText = extractedText.replace(/^["'\s]+|["'\s]+$/g, '').trim();
          }

          console.log('=== EXTRACTED DATA ===');
          console.log('Generated Text:', extractedText);
          console.log('Generated Image URL:', extractedImageUrl);
          console.log('Generated Video URL:', extractedVideoUrl);

          setGeneratedText(extractedText);
          setGeneratedImageUrl(extractedImageUrl);
          setGeneratedVideoUrl(extractedVideoUrl);

          if (draftId) {
            if (extractedText || extractedImageUrl || extractedVideoUrl) {
              console.log('=== UPDATING DATABASE ===');
              console.log('Draft ID:', draftId);

              const updateData: any = {
                generated_text: extractedText,
                generated_at: new Date().toISOString(),
                status: 'content_generated',
              };

              if (contentDraft.assetSource === 'Upload My Own') {
                updateData.is_media_ready = true;
              }

              if (contentDraft.format === 'Image + Text') {
                updateData.generated_image_url = extractedImageUrl;
              }

              if (contentDraft.format === 'Video Post') {
                updateData.generated_video_url = extractedVideoUrl;
              }

              console.log('Update data:', updateData);

              const { data: updateResult, error: updateError } = await supabase
                .from('content_drafts')
                .update(updateData)
                .eq('id', draftId)
                .select();

              if (updateError) {
                console.error('❌ DATABASE UPDATE FAILED:', updateError);
              } else {
                console.log('✅ DATABASE UPDATE SUCCESS:', updateResult);
                if (contentDraft.assetSource === 'Upload My Own' && updateResult && updateResult[0]) {
                  setIsMediaReady(true);
                }
              }
            } else {
              console.warn('⚠️ No generated content found in webhook response - database not updated');
            }
          } else {
            console.error('❌ No draft ID available for update');
          }
        } else {
          const errorText = await webhookResponse.text();
          console.error('❌ Webhook returned non-OK status:', webhookResponse.status);
          console.error('Error response:', errorText);
        }
        console.log('=== WEBHOOK REQUEST END ===');
        })();

        await Promise.race([webhookPromise, timeoutPromise]);

      } catch (webhookError: any) {
        console.error('❌ WEBHOOK REQUEST FAILED');
        console.error('Error message:', webhookError.message);
        console.error('Error name:', webhookError.name);
        console.error('Error stack:', webhookError.stack);

        if (webhookError.message.includes('timeout')) {
          setWebhookTimeout(true);
          setError('Webhook request timed out after 2 minutes. The content may still be processing.');
        }
      } finally {
        setWaitingForWebhook(false);
      }

      if (generatedText || generatedImageUrl || generatedVideoUrl) {
        setSuccess('Content generated successfully!');
      } else if (!webhookTimeout) {
        setSuccess('Draft created! Waiting for content generation...');
      }

      setContentDraft({
        idea: '',
        platform: '',
        format: '',
        assetSource: '',
        knowledgeBaseFile: null,
        assetFile: null,
      });

      setTimeout(() => {
        setSuccess(null);
      }, 5000);

    } catch (err: any) {
      console.error('Error saving draft:', err);
      setError(err.message || 'Failed to create content draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-pink-50/30">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-3">
              Social Media Content Blueprint
            </h1>
            <p className="text-lg text-gray-700">
              Let's create your next engaging social media post
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200/50 p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
                Content Idea & Knowledge Base
              </h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="idea" className="block text-sm font-semibold text-slate-700 mb-2">
                    Content Idea <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-slate-500 mb-2">What is the core concept?</p>
                  <textarea
                    id="idea"
                    value={contentDraft.idea}
                    onChange={handleIdeaChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 resize-none"
                    placeholder="Example: Launch announcement for our new sustainable fashion collection featuring eco-friendly materials and modern designs..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="knowledgeBase" className="block text-sm font-semibold text-slate-700 mb-2">
                    Industry Knowledge Base (PDF Upload)
                  </label>
                  <p className="text-sm text-slate-500 mb-2">Optional: Upload a PDF to enhance content generation</p>
                  <div className="relative">
                    <input
                      type="file"
                      id="knowledgeBase"
                      accept=".pdf"
                      onChange={handleKnowledgeBaseFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="knowledgeBase"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer text-gray-600 font-medium"
                    >
                      <Upload className="w-5 h-5" />
                      {contentDraft.knowledgeBaseFile ? 'Change PDF File' : 'Upload PDF File'}
                    </label>
                  </div>
                  {contentDraft.knowledgeBaseFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">{contentDraft.knowledgeBaseFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
                Platform & Format Selection
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Target Social Platform <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Facebook', 'Twitter (X)', 'Instagram'] as Platform[]).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handlePlatformChange(platform)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          contentDraft.platform === platform
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Desired Post Format <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Text Only', 'Image + Text', 'Video Post'] as Format[]).map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => handleFormatChange(format)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          contentDraft.format === format
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {contentDraft.format && contentDraft.format !== 'Text Only' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
                  Asset Source
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Asset Generation Source <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['AI Generate', 'Upload My Own'] as AssetSource[]).map((source) => (
                        <button
                          key={source}
                          type="button"
                          onClick={() => handleAssetSourceChange(source)}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                            contentDraft.assetSource === source
                              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                              : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                          }`}
                        >
                          {source}
                        </button>
                      ))}
                    </div>
                  </div>

                  {contentDraft.assetSource === 'Upload My Own' && (
                    <div>
                      <label htmlFor="assetFile" className="block text-sm font-semibold text-slate-700 mb-2">
                        Upload Custom Asset <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        {contentDraft.format === 'Image + Text'
                          ? 'Upload an image file (JPG, PNG, GIF)'
                          : 'Upload a video file (MP4, MOV, AVI)'}
                      </p>
                      <div className="relative">
                        <input
                          type="file"
                          id="assetFile"
                          accept={getAcceptedFileTypes()}
                          onChange={handleAssetFileChange}
                          className="hidden"
                          required
                        />
                        <label
                          htmlFor="assetFile"
                          className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg transition-all font-medium ${
                            uploadingFile
                              ? 'border-orange-400 bg-orange-50 cursor-wait text-orange-700'
                              : 'border-orange-200 hover:border-orange-400 hover:bg-orange-50 cursor-pointer text-gray-600'
                          }`}
                        >
                          {uploadingFile ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              {contentDraft.assetFile
                                ? `Change ${contentDraft.format === 'Image + Text' ? 'Image' : 'Video'} File`
                                : `Upload ${contentDraft.format === 'Image + Text' ? 'Image' : 'Video'} File`}
                            </>
                          )}
                        </label>
                      </div>
                      {contentDraft.assetFile && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">{contentDraft.assetFile.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={!isFormValid() || loading || waitingForWebhook}
                className="group w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Content Draft...
                  </>
                ) : waitingForWebhook && !testingWebhook ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    Generate Content Draft
                    <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={testingWebhook || waitingForWebhook}
                className="group w-full bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-slate-600/30 flex items-center justify-center gap-2"
              >
                {testingWebhook ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Testing Webhook...
                  </>
                ) : (
                  <>
                    Test Webhook
                    <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-sm text-slate-500 text-center">
                <span className="text-red-500">*</span> Required fields
              </p>
            </div>
          </form>

          {/* Webhook Response Section - Placeholder/Loading/Result */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
              Generated Content Preview
            </h2>

            {!waitingForWebhook && !generatedText && !generatedImageUrl && !generatedVideoUrl && !webhookTimeout && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md mb-6">
                    <Bot className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Awaiting Content Generation</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Your AI-generated content will appear here once the webhook responds. Fill out the form above and click "Generate Content Draft" to begin.
                  </p>
                </div>
              </div>
            )}

            {waitingForWebhook && (
              <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Generating Your Content</h3>
                  <p className="text-slate-600 mb-4">Please wait while we create your content. This may take up to 2 minutes...</p>
                  <div className="max-w-md mx-auto bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 text-left">
                      <span className="font-semibold">Status:</span> Waiting for webhook response...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!waitingForWebhook && (generatedText || generatedImageUrl || generatedVideoUrl || userUploadedImageUrl || userUploadedVideoUrl) && (
              <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Content Generated Successfully!</h3>
                      <p className="text-slate-600">Review your AI-generated content below</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {generatedText && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-slate-700">Generated Text</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <p className="text-slate-900 text-base leading-relaxed whitespace-pre-wrap">{generatedText}</p>
                      </div>
                    </div>
                  )}

                  {userUploadedImageUrl && isMediaReady && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-slate-700">User Uploaded Image</p>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg">
                        <img
                          src={userUploadedImageUrl}
                          alt="User uploaded content"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            console.error('Failed to load image:', userUploadedImageUrl);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {userUploadedImageUrl && !isMediaReady && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-slate-700">User Uploaded Image</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-700 font-semibold mb-2">Media is processing</p>
                        <p className="text-slate-500 text-sm">Your uploaded image is being processed. Please wait...</p>
                      </div>
                    </div>
                  )}

                  {!userUploadedImageUrl && generatedImageUrl && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-slate-700">Generated Image</p>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg">
                        <img
                          src={generatedImageUrl}
                          alt="Generated content"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            console.error('Failed to load image:', generatedImageUrl);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {userUploadedVideoUrl && isMediaReady && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-slate-700">User Uploaded Video</p>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg">
                        <video
                          src={userUploadedVideoUrl}
                          controls
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            console.error('Failed to load video:', userUploadedVideoUrl);
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  {userUploadedVideoUrl && !isMediaReady && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-slate-700">User Uploaded Video</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-700 font-semibold mb-2">Media is processing</p>
                        <p className="text-slate-500 text-sm">Your uploaded video is being processed. Please wait...</p>
                      </div>
                    </div>
                  )}

                  {!userUploadedVideoUrl && generatedVideoUrl && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-slate-700">Generated Video</p>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg">
                        <video
                          src={generatedVideoUrl}
                          controls
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            console.error('Failed to load video:', generatedVideoUrl);
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={() => {
                        setGeneratedText(null);
                        setGeneratedImageUrl(null);
                        setGeneratedVideoUrl(null);
                        setUserUploadedImageUrl(null);
                        setUserUploadedVideoUrl(null);
                        setIsMediaReady(false);
                        setSuccess(null);
                      }}
                      className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all"
                    >
                      Create New Content
                    </button>
                    <Link
                      to="/content-review"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-orange-500/30 text-center"
                    >
                      Go to Review Page
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {webhookTimeout && (
              <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Request Timed Out</h3>
                  <p className="text-slate-600 mb-4">
                    The content generation is taking longer than expected. Your draft has been saved and the content may still be processing.
                  </p>
                  <Link
                    to="/content-review"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Check Review Page
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}


export default ContentBlueprintPage;
