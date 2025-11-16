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

      try {
        const webhookResponse = await fetch('https://myaistaff.app.n8n.cloud/webhook-test/PostBluePrint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        console.log('Webhook request sent, status:', webhookResponse.status);
      } catch (webhookError) {
        console.warn('Webhook request encountered an issue, but continuing:', webhookError);
      }

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

      setSuccess('Data successfully submitted! Your post is being generated.');

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
                disabled={!isFormValid() || loading}
                className="group w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Content Draft...
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
