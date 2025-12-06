import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Sparkles, Calendar, Filter } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { getApprovedCampaigns, searchCampaignsByName } from '../lib/campaignService';
import type { CampaignWithContent, Platform } from '../lib/campaignService';

function ContentHistoryPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithContent[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<CampaignWithContent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await getApprovedCampaigns();
      setCampaigns(data);
      setAllCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      alert('Error loading campaigns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCampaigns();
      return;
    }

    try {
      setIsLoading(true);
      const data = await searchCampaignsByName(searchTerm);
      setCampaigns(data);
      setAllCampaigns(data);
    } catch (error) {
      console.error('Error searching campaigns:', error);
      alert('Error searching campaigns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allCampaigns];

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(campaign => new Date(campaign.created_at) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(campaign => new Date(campaign.created_at) <= end);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    setCampaigns(filtered);
  };

  const handleReset = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    loadCampaigns();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlatformLabel = (platform: Platform) => {
    switch (platform) {
      case 'facebook': return 'Facebook';
      case 'x': return 'X';
      case 'instagram': return 'Instagram';
    }
  };

  const getPlatformsList = (campaign: CampaignWithContent) => {
    return campaign.campaign_content
      .map(content => getPlatformLabel(content.platform))
      .join(', ');
  };

  const toggleRowExpansion = (campaignId: string) => {
    setExpandedRow(expandedRow === campaignId ? null : campaignId);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-pink-50/30">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3 flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-orange-500" />
              Content History
            </h1>
            <p className="text-gray-600 text-lg">View and manage all your approved campaigns</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/50 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by Campaign Name"
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-lg"
              >
                Search
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-lg"
              >
                Reset
              </button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-500" />
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={applyFilters}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-lg whitespace-nowrap"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white/50">
              <div className="text-xl text-gray-600">Loading campaigns...</div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white/50">
              <div className="text-xl text-gray-600">
                {searchTerm ? 'No campaigns found matching your search.' : 'No approved campaigns yet.'}
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Campaign ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Campaign Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Creation Date</th>
                      <th className="px-6 py-4 text-left font-semibold">Platforms</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-center font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <>
                        <tr
                          key={campaign.id}
                          className="hover:bg-orange-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                            {campaign.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {campaign.campaign_name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatDate(campaign.created_at)}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {getPlatformsList(campaign)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm">
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleRowExpansion(campaign.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg transition-all font-medium transform hover:scale-105 shadow-sm"
                            >
                              {expandedRow === campaign.id ? (
                                <>
                                  Hide <ChevronUp className="w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  View <ChevronDown className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRow === campaign.id && (
                          <tr key={`${campaign.id}-details`}>
                            <td colSpan={6} className="px-6 py-6 bg-gradient-to-br from-orange-50/50 to-pink-50/50">
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                  <div className="bg-white/60 rounded-xl p-4 border border-white/50">
                                    <span className="text-sm font-semibold text-gray-700">Full Campaign ID:</span>
                                    <p className="mt-1 text-gray-600 font-mono text-sm break-all">{campaign.id}</p>
                                  </div>
                                  <div className="bg-white/60 rounded-xl p-4 border border-white/50">
                                    <span className="text-sm font-semibold text-gray-700">Content Idea:</span>
                                    <p className="mt-1 text-gray-600">{campaign.content_idea}</p>
                                  </div>
                                  {campaign.knowledge_base_file && (
                                    <div className="bg-white/60 rounded-xl p-4 border border-white/50">
                                      <span className="text-sm font-semibold text-gray-700">Knowledge Base File:</span>
                                      <p className="mt-1 text-gray-600">{campaign.knowledge_base_file}</p>
                                    </div>
                                  )}
                                </div>

                                {campaign.campaign_content.map((content) => (
                                  <div key={content.id} className="border-t-2 border-orange-200 pt-6">
                                    <h4 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-4">
                                      {getPlatformLabel(content.platform)}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                      {content.text_content && (
                                        <div className="bg-white/60 rounded-xl p-4 border border-white/50">
                                          <span className="text-sm font-semibold text-gray-700">Text:</span>
                                          <p className="mt-1 text-gray-600 whitespace-pre-wrap">{content.text_content}</p>
                                        </div>
                                      )}
                                      {content.image_link && (
                                        <div className="bg-white/60 rounded-xl p-4 border border-white/50">
                                          <span className="text-sm font-semibold text-gray-700">Generated Image:</span>
                                          <div className="mt-3">
                                            <img
                                              src={content.image_link}
                                              alt={`${getPlatformLabel(content.platform)} content`}
                                              className="w-full max-w-md rounded-xl shadow-lg border-2 border-white"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                              }}
                                            />
                                          </div>
                                          <p className="mt-2 text-xs text-gray-500 break-all">{content.image_link}</p>
                                        </div>
                                      )}
                                      {content.video_link && (
                                        <div className="bg-white/60 rounded-xl p-4 border border-white/50">
                                          <span className="text-sm font-semibold text-gray-700">Video Link:</span>
                                          <p className="mt-1 text-gray-600 break-all">{content.video_link}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ContentHistoryPage;
