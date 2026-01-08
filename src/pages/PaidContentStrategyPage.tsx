import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Copy, Download, Edit, RefreshCw, Target, TrendingUp, Users, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

function PaidContentStrategyPage() {
  const [copySuccess, setCopySuccess] = useState(false);

  const campaignData = {
    campaignName: "Summer Product Launch 2024",
    platform: "Facebook",
    objective: "Drive Website Traffic",
    primaryGoal: "Generate 500+ qualified leads",
    dailyBudget: "$50",
    duration: "14 days",
    totalBudget: "$700",
    strategyOverview: "This campaign leverages seasonal interest in sustainable fashion to drive traffic to your new collection landing page. By targeting eco-conscious consumers aged 25-45, we'll position your brand as a leader in ethical fashion. The strategy focuses on highlighting unique product features and limited-time launch offers to create urgency and drive immediate action.",

    audience: {
      ageRange: "25-45",
      gender: "All Genders",
      location: "United States, Canada",
      interests: "Sustainable Fashion, Eco-Friendly Products, Ethical Shopping",
      audienceType: "Cold Audience",
      psychologyInsight: "Your target audience values authenticity and sustainability. They're willing to pay premium prices for products that align with their values. These consumers actively seek brands with transparent supply chains and environmental commitments. They respond best to educational content that demonstrates your brand's impact and unique value proposition."
    },

    adVariations: [
      {
        id: 1,
        name: "Ad Variation A",
        format: "Image + Text",
        platform: "Facebook",
        headline: "Sustainable Style Meets Modern Design",
        primaryText: "Introducing our new eco-friendly fashion collection - where style meets sustainability. Each piece is crafted from 100% organic materials, designed to last, and produced with ethical practices. Shop the collection now and get 20% off during our launch week. Your wardrobe, reimagined.",
        cta: "Shop Collection",
        videoHook: null
      },
      {
        id: 2,
        name: "Ad Variation B",
        format: "Image + Text",
        platform: "Facebook",
        headline: "Fashion That Feels Good, Inside and Out",
        primaryText: "Transform your closet with pieces that matter. Our sustainable collection combines cutting-edge design with environmental responsibility. Made from recycled and organic materials, each item tells a story of positive change. Limited launch pricing - 20% off ends soon.",
        cta: "Discover More",
        videoHook: null
      }
    ],

    creativeDirection: {
      contentAngle: "Value-Driven Sustainability",
      toneOfVoice: "Authentic, Inspiring, Educational",
      cta: "Shop Collection / Discover More",
      visualGuidance: "Use bright, natural lighting with clean, minimalist backgrounds that emphasize the products. Showcase the texture and quality of materials through close-up shots. Include lifestyle imagery that depicts the target audience wearing the products in everyday settings. Color palette should feature earth tones with pops of vibrant accent colors. Avoid overly staged or artificial-looking scenes - authenticity is key. Consider user-generated content style visuals to build trust and relatability."
    }
  };

  const handleCopyAds = () => {
    const adsText = campaignData.adVariations.map((ad, index) =>
      `${ad.name}\n\nHeadline: ${ad.headline}\n\nPrimary Text: ${ad.primaryText}\n\nCTA: ${ad.cta}\n\n---\n\n`
    ).join('');

    navigator.clipboard.writeText(adsText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-pink-50/30">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-end mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 transition-colors group"
            >
              <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold">DashAI</span>
            </Link>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-3">
              <Zap className="w-4 h-4" />
              {campaignData.campaignName}
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-3">
              Paid Content Strategy
            </h1>
            <p className="text-lg text-gray-700">
              AI-generated ad strategy and creatives optimized for performance
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-orange-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Campaign Strategy Overview</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Platform</p>
                  <p className="text-lg font-bold text-slate-900">{campaignData.platform}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Objective</p>
                  <p className="text-lg font-bold text-slate-900">{campaignData.objective}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Primary Goal</p>
                  <p className="text-lg font-bold text-slate-900">{campaignData.primaryGoal}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Budget</p>
                  <p className="text-lg font-bold text-slate-900">{campaignData.dailyBudget}/day</p>
                  <p className="text-xs text-slate-600">{campaignData.duration} · {campaignData.totalBudget} total</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-6 border border-slate-200">
                <p className="text-slate-800 leading-relaxed">
                  {campaignData.strategyOverview}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-orange-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Target Audience</h2>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                  <span className="text-xs font-semibold uppercase tracking-wide">Age:</span>
                  <span>{campaignData.audience.ageRange}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium border border-pink-200">
                  <span className="text-xs font-semibold uppercase tracking-wide">Gender:</span>
                  <span>{campaignData.audience.gender}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                  <span className="text-xs font-semibold uppercase tracking-wide">Location:</span>
                  <span>{campaignData.audience.location}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
                  <span className="text-xs font-semibold uppercase tracking-wide">Type:</span>
                  <span>{campaignData.audience.audienceType}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-6 border border-slate-200 mb-4">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Interests</p>
                <p className="text-slate-800 font-medium">{campaignData.audience.interests}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">Audience Psychology</p>
                <p className="text-slate-800 leading-relaxed">
                  {campaignData.audience.psychologyInsight}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-orange-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Ad Variations</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaignData.adVariations.map((ad) => (
                  <div key={ad.id} className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border-2 border-slate-200 overflow-hidden hover:border-orange-300 transition-all">
                    <div className="bg-white border-b border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{ad.name}</h3>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                            {ad.format}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {ad.platform}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Headline</p>
                        <p className="text-xl font-bold text-slate-900 leading-snug">{ad.headline}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Primary Text</p>
                        <p className="text-slate-800 leading-relaxed">{ad.primaryText}</p>
                      </div>

                      {ad.videoHook && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Video Hook (First 3 seconds)</p>
                          <p className="text-slate-800 italic">{ad.videoHook}</p>
                        </div>
                      )}

                      <div className="pt-4">
                        <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg">
                          {ad.cta}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-orange-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Creative Direction</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Content Angle</p>
                  <p className="text-slate-900 font-semibold">{campaignData.creativeDirection.contentAngle}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Tone of Voice</p>
                  <p className="text-slate-900 font-semibold">{campaignData.creativeDirection.toneOfVoice}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">CTA</p>
                  <p className="text-slate-900 font-semibold">{campaignData.creativeDirection.cta}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-6 border border-orange-200">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-3">Visual & Messaging Guidance</p>
                <p className="text-slate-800 leading-relaxed">
                  {campaignData.creativeDirection.visualGuidance}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 shadow-2xl z-40">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={handleCopyAds}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  <Copy className="w-4 h-4" />
                  {copySuccess ? 'Copied!' : 'Copy Ads'}
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold transition-all hover:bg-slate-50">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download Strategy (PDF)</span>
                  <span className="sm:hidden">Download</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold transition-all hover:bg-slate-50">
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Duplicate Campaign</span>
                  <span className="sm:hidden">Duplicate</span>
                </button>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-300 hover:border-orange-400 text-orange-700 rounded-lg font-semibold transition-all hover:bg-orange-50">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Inputs</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PaidContentStrategyPage;
