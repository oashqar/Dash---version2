import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { Sidebar } from '../components/Sidebar';

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
  generated_video_url: string | null;
  user_uploaded_image_url: string | null;
  user_uploaded_video_url: string | null;
  is_media_ready: boolean;
  generated_at: string | null;
}

function ContentReviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingContent, setFetchingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [latestDraft, setLatestDraft] = useState<ContentDraft | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchLatestContent(user.id);
    }
  }, [user]);

  const fetchLatestContent = async (userId: string) => {
    setFetchingContent(true);
    setError(null);
    setSuccessMessage(null);

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

  const handleRefresh = () => {
    if (user?.id) {
      fetchLatestContent(user.id);
    }
  };

  const handleApprove = async () => {
    if (!latestDraft) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await supabase
        .from('content_drafts')
        .update({ status: 'content_generated_approved' })
        .eq('id', latestDraft.id);

      if (updateError) {
        throw updateError;
      }

      setSuccessMessage('The approval has been registered in the database successfully!');

      const webhookPayload = {
        draft_id: latestDraft.id,
      };

      await fetch('https://myaistaff.app.n8n.cloud/webhook-test/Approved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      setTimeout(() => {
        navigate('/content-blueprint');
      }, 2000);
    } catch (err: any) {
      console.error('Error approving content:', err);
      setError('Failed to approve content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!latestDraft) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await supabase
        .from('content_drafts')
        .update({ status: 'content_generated_Rejected' })
        .eq('id', latestDraft.id);

      if (updateError) {
        throw updateError;
      }

      setSuccessMessage('The rejection has been registered in the database successfully!');
      setLoading(false);

      setTimeout(() => {
        navigate('/content-blueprint');
      }, 2000);
    } catch (err: any) {
      console.error('Error rejecting content:', err);
      setError('Failed to reject content. Please try again.');
      setLoading(false);
    }
  };

  const contentText = latestDraft?.generated_text || '';
  const imageUrl = latestDraft?.generated_image_url || '';
  const videoUrl = latestDraft?.generated_video_url || '';
  const userUploadedImageUrl = latestDraft?.user_uploaded_image_url || '';
  const userUploadedVideoUrl = latestDraft?.user_uploaded_video_url || '';
  const isMediaReady = latestDraft?.is_media_ready || false;
  const platform = latestDraft?.platform || '';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-pink-50/30">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-3">
              Review Generated Content
            </h1>
            <p className="text-lg text-gray-700">
              Review your AI-generated social media post
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200/50 overflow-hidden">
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {fetchingContent ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-700 text-lg">Loading content...</p>
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
                      className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                )}

                {!contentText && !imageUrl && !videoUrl && !userUploadedImageUrl && !userUploadedVideoUrl && latestDraft?.status === 'draft_created' && (
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

                {userUploadedImageUrl && isMediaReady && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-4">User Uploaded Image</p>
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
                    <p className="text-sm font-semibold text-slate-700 mb-4">User Uploaded Image</p>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
                      <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-700 font-semibold mb-2">Media is processing</p>
                      <p className="text-slate-500 text-sm">Your uploaded image is being processed. Please wait...</p>
                    </div>
                  </div>
                )}

                {!userUploadedImageUrl && imageUrl && (
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

                {userUploadedVideoUrl && isMediaReady && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-4">User Uploaded Video</p>
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
                    <p className="text-sm font-semibold text-slate-700 mb-4">User Uploaded Video</p>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
                      <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-700 font-semibold mb-2">Media is processing</p>
                      <p className="text-slate-500 text-sm">Your uploaded video is being processed. Please wait...</p>
                    </div>
                  </div>
                )}

                {!userUploadedVideoUrl && videoUrl && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-4">Generated Video</p>
                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          console.error('Failed to load video:', videoUrl);
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
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
                      className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Create New Content
                    </Link>
                  </div>
                )}
              </div>

              {(contentText || imageUrl || videoUrl || userUploadedImageUrl || userUploadedVideoUrl) && (
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
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-orange-500/30 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed"
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
        </div>
      </main>
    </div>
  );
}

export default ContentReviewPage;
