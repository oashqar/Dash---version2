import { useState, useEffect } from 'react';
import { Bot, LogOut, CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import type { User } from '@supabase/supabase-js';

interface ContentDraft {
  id: string;
  user_id: string;
  created_at: string;
  idea: string;
  platform: string;
  format: string;
  status: string;
  generated_text: string | null;
  generated_image_url: string | null;
  generated_at: string | null;
}

function ContentReviewPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingContent, setFetchingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestDraft, setLatestDraft] = useState<ContentDraft | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchLatestContent(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchLatestContent(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchLatestContent = async (userId: string) => {
    setFetchingContent(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('content_drafts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setLatestDraft(data);
    } catch (err: any) {
      console.error('Error fetching content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setFetchingContent(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleRefresh = () => {
    if (user?.id) {
      fetchLatestContent(user.id);
    }
  };

  const handleApprove = async () => {
    if (!latestDraft) return;

    setLoading(true);
    setError(null);

    try {
      const approvalPayload = {
        user_id: user?.id,
        email: user?.email,
        draft_id: latestDraft.id,
        status: 'approved',
        content_text: latestDraft.generated_text,
        image_url: latestDraft.generated_image_url,
        platform: latestDraft.platform,
        approved_at: new Date().toISOString(),
      };

      const webhookResponse = await fetch('https://myaistaff.app.n8n.cloud/webhook/ApprovedPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalPayload),
      });

      console.log('Approval webhook sent, status:', webhookResponse.status);

      await supabase
        .from('content_drafts')
        .update({ status: 'approved' })
        .eq('id', latestDraft.id);

      navigate('/content-blueprint');
    } catch (err: any) {
      console.error('Error approving content:', err);
      setError('Failed to approve content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    navigate('/content-blueprint');
  };

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const contentText = latestDraft?.generated_text || '';
  const imageUrl = latestDraft?.generated_image_url || '';
  const platform = latestDraft?.platform || '';

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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Review Generated Content</h1>
          <p className="text-lg text-slate-600">
            Review your AI-generated social media post
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {fetchingContent ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 text-lg">Loading content...</p>
            </div>
          ) : (
            <>
              <div className="p-8 space-y-8">
                {platform && (
                  <div className="pb-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Platform</p>
                      <p className="text-xl font-bold text-slate-900">{platform}</p>
                    </div>
                    <button
                      onClick={handleRefresh}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                )}

                {!contentText && !imageUrl && latestDraft?.status === 'draft_created' && (
                  <div className="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
                    <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
                    <p className="text-yellow-900 text-lg font-semibold mb-2">Content is being generated</p>
                    <p className="text-yellow-700 mb-4">This may take a few moments. Please wait...</p>
                    <button
                      onClick={handleRefresh}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Check Status
                    </button>
                  </div>
                )}

                {imageUrl && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-4">Generated Image</p>
                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg">
                      <img
                        src={imageUrl}
                        alt="Generated content"
                        className="w-full h-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          console.error('Failed to load image:', imageUrl);
                        }}
                      />
                    </div>
                  </div>
                )}

                {contentText && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-4">Generated Text</p>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <p className="text-slate-900 text-lg leading-relaxed whitespace-pre-wrap">{contentText}</p>
                    </div>
                  </div>
                )}

                {!latestDraft && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">No content available to review</p>
                    <Link
                      to="/content-blueprint"
                      className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create New Content
                    </Link>
                  </div>
                )}
              </div>

              {(contentText || imageUrl) && (
                <div className="p-8 bg-slate-50 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleReject}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-green-600/30 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Approve
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 text-center mt-4">
                    Approve to publish or reject to create new content
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-center mt-8">
          <Link to="/content-blueprint" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
            Back to Content Blueprint
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ContentReviewPage;
