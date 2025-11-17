import { useState, useEffect } from 'react';
import { Bot, LogOut, FileText, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import type { User } from '@supabase/supabase-js';

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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waitingForWebhook, setWaitingForWebhook] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [webhookTimeout, setWebhookTimeout] = useState(false);

  const [contentDraft, setContentDraft] = useState<ContentDraft>({
    idea: '',
    platform: '',
    format: '',
    assetSource: '',
    knowledgeBaseFile: null,
    assetFile: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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

  const handleAssetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setContentDraft(prev => ({ ...prev, assetFile: file }));
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

      console.log('Preparing to send webhook with payload:', {
        ...webhookPayload,
        draft_id: draftId,
      });

      setWaitingForWebhook(true);
      setWebhookTimeout(false);
      setGeneratedText(null);
      setGeneratedImageUrl(null);

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

          if (Array.isArray(webhookData) && webhookData.length > 0) {
            const responseData = webhookData[0];
            console.log('Processing array response, first element:', responseData);
            extractedText = responseData.facebookOutput?.[0] || null;
            extractedImageUrl = responseData.url?.[0] || null;
          } else if (typeof webhookData === 'object' && webhookData !== null) {
            console.log('Processing object response');
            extractedText = webhookData.text || webhookData.generated_text || webhookData.facebookOutput?.[0] || null;
            extractedImageUrl = webhookData.url?.[0] || webhookData.image_url || webhookData.generated_image_url || null;
          }

          console.log('=== EXTRACTED DATA ===');
          console.log('Generated Text:', extractedText);
          console.log('Generated Image URL:', extractedImageUrl);

          setGeneratedText(extractedText);
          setGeneratedImageUrl(extractedImageUrl);

          if (draftId) {
            if (extractedText || extractedImageUrl) {
              console.log('=== UPDATING DATABASE ===');
              console.log('Draft ID:', draftId);

              const updateData = {
                generated_text: extractedText,
                generated_image_url: extractedImageUrl,
                generated_at: new Date().toISOString(),
                status: 'content_generated',
              };

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

      if (generatedText || generatedImageUrl) {
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

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Dash.ai</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-slate-700 font-medium">
              Welcome, {displayName}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Social Media Content Blueprint</h1>
          <p className="text-lg text-slate-600">
            Let's create your next engaging social media post
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
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
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-slate-600 font-medium"
                    >
                      <Upload className="w-5 h-5" />
                      {contentDraft.knowledgeBaseFile ? 'Change PDF File' : 'Upload PDF File'}
                    </label>
                  </div>
                  {contentDraft.knowledgeBaseFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4 text-blue-600" />
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
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
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
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
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
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
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
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-slate-600 font-medium"
                        >
                          <Upload className="w-5 h-5" />
                          {contentDraft.assetFile
                            ? `Change ${contentDraft.format === 'Image + Text' ? 'Image' : 'Video'} File`
                            : `Upload ${contentDraft.format === 'Image + Text' ? 'Image' : 'Video'} File`}
                        </label>
                      </div>
                      {contentDraft.assetFile && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{contentDraft.assetFile.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormValid() || loading || waitingForWebhook}
                className="group w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Content Draft...
                  </>
                ) : waitingForWebhook ? (
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
              <p className="text-sm text-slate-500 text-center mt-3">
                <span className="text-red-500">*</span> Required fields
              </p>
            </div>
          </form>
        </div>

        {waitingForWebhook && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Generating Your Content</h3>
              <p className="text-slate-600">Please wait while we create your content. This may take up to 2 minutes...</p>
            </div>
          </div>
        )}

        {!waitingForWebhook && (generatedText || generatedImageUrl) && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Content Generated Successfully!</h3>
                  <p className="text-slate-600">Review your AI-generated content below</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {generatedImageUrl && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-4">Generated Image</p>
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

              {generatedText && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-4">Generated Text</p>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <p className="text-slate-900 text-lg leading-relaxed whitespace-pre-wrap">{generatedText}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => {
                    setGeneratedText(null);
                    setGeneratedImageUrl(null);
                    setSuccess(null);
                  }}
                  className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  Create New Content
                </button>
                <Link
                  to="/content-review"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-blue-600/30 text-center"
                >
                  Go to Review Page
                </Link>
              </div>
            </div>
          </div>
        )}

        {webhookTimeout && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-amber-200 p-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Request Timed Out</h3>
              <p className="text-slate-600 mb-4">
                The content generation is taking longer than expected. Your draft has been saved and the content may still be processing.
              </p>
              <Link
                to="/content-review"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                Check Review Page
              </Link>
            </div>
          </div>
        )}

        <div className="text-center mt-8 space-y-3">
          <div>
            <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
              Back to Home
            </Link>
          </div>
          <div>
            <Link to="/content-review" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
              View Content Review
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ContentBlueprintPage;
