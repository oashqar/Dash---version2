import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Loader2, DollarSign, Target, Copy, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { Sidebar } from '../components/Sidebar';

interface PaidContentForm {
  campaignName: string;
  primaryGoal: string;
  targetPlatform: string;
  audienceType: string;
  audienceCharacteristics: string;
  ageRange: string;
  gender: string;
  location: string;
  language: string;
  budgetType: string;
  budgetAmount: string;
  startDate: string;
  endDate: string;
  optimizationPreference: string;
  contentIdea: string;
  brandTone: string;
  ctaObjective: string;
  visualStyle: string;
  generateAdCopy: boolean;
  generateHeadlines: boolean;
  generateCtaText: boolean;
  generateImagePrompt: boolean;
  generateVideoHooks: boolean;
  numberOfVariations: number;
}

interface GeneratedContent {
  adCopy: string;
  headlines: string[];
  ctaSuggestions: string[];
  imagePrompt: string;
  videoHooks: string[];
}

function PaidContentPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const [formData, setFormData] = useState<PaidContentForm>({
    campaignName: '',
    primaryGoal: '',
    targetPlatform: '',
    audienceType: '',
    audienceCharacteristics: '',
    ageRange: '',
    gender: '',
    location: '',
    language: '',
    budgetType: '',
    budgetAmount: '',
    startDate: '',
    endDate: '',
    optimizationPreference: '',
    contentIdea: '',
    brandTone: '',
    ctaObjective: '',
    visualStyle: '',
    generateAdCopy: true,
    generateHeadlines: true,
    generateCtaText: true,
    generateImagePrompt: true,
    generateVideoHooks: true,
    numberOfVariations: 3,
  });

  const updateField = (field: keyof PaidContentForm, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.campaignName.trim() !== '' &&
      formData.primaryGoal !== '' &&
      formData.targetPlatform !== '' &&
      formData.audienceType !== '' &&
      formData.audienceCharacteristics.trim() !== '' &&
      formData.budgetType !== '' &&
      formData.budgetAmount !== '' &&
      parseFloat(formData.budgetAmount) > 0 &&
      formData.optimizationPreference !== '' &&
      formData.contentIdea.trim() !== '' &&
      formData.brandTone !== '' &&
      formData.ctaObjective !== '' &&
      formData.visualStyle !== ''
    );
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

      const draftData = {
        user_id: user.id,
        campaign_name: formData.campaignName.trim(),
        primary_goal: formData.primaryGoal,
        target_platform: formData.targetPlatform,
        audience_type: formData.audienceType,
        audience_characteristics: formData.audienceCharacteristics.trim(),
        age_range: formData.ageRange || null,
        gender: formData.gender || null,
        location: formData.location || null,
        language: formData.language || null,
        budget_type: formData.budgetType,
        budget_amount: parseFloat(formData.budgetAmount),
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        optimization_preference: formData.optimizationPreference,
        content_idea: formData.contentIdea.trim(),
        brand_tone: formData.brandTone,
        cta_objective: formData.ctaObjective,
        visual_style: formData.visualStyle,
        generate_ad_copy: formData.generateAdCopy,
        generate_headlines: formData.generateHeadlines,
        generate_cta_text: formData.generateCtaText,
        generate_image_prompt: formData.generateImagePrompt,
        generate_video_hooks: formData.generateVideoHooks,
        number_of_variations: formData.numberOfVariations,
        status: 'draft',
      };

      const { data, error: insertError } = await supabase
        .from('paid_content')
        .insert([draftData])
        .select();

      if (insertError) {
        throw insertError;
      }

      const draftId = data[0]?.id;
      setCurrentDraftId(draftId);

      const mockGenerated: GeneratedContent = {
        adCopy: `Transform your business with our innovative solution! ${formData.contentIdea}. Perfect for ${formData.audienceType.toLowerCase()} audiences looking to achieve their goals.`,
        headlines: [
          `${formData.campaignName}: Your Success Starts Here`,
          `Discover the Power of ${formData.campaignName}`,
          `Join Thousands Who Trust ${formData.campaignName}`,
        ],
        ctaSuggestions: [
          formData.ctaObjective,
          `Get Started Now`,
          `${formData.ctaObjective} - Limited Time`,
        ],
        imagePrompt: `Create a ${formData.visualStyle.toLowerCase()} image showing ${formData.contentIdea}. Style: ${formData.brandTone.toLowerCase()}, professional quality, optimized for ${formData.targetPlatform}.`,
        videoHooks: [
          `"What if I told you ${formData.contentIdea}..."`,
          `"Stop scrolling! Here's why ${formData.campaignName} is different..."`,
          `"The secret to success? Let me show you..."`,
        ],
      };

      setGeneratedContent(mockGenerated);

      const updateData = {
        generated_ad_copy: mockGenerated.adCopy,
        generated_headlines: JSON.stringify(mockGenerated.headlines),
        generated_cta_suggestions: JSON.stringify(mockGenerated.ctaSuggestions),
        generated_image_prompt: mockGenerated.imagePrompt,
        generated_video_hooks: JSON.stringify(mockGenerated.videoHooks),
        status: 'generated',
      };

      await supabase
        .from('paid_content')
        .update(updateData)
        .eq('id', draftId);

      setSuccess('Paid content generated successfully!');

      setTimeout(() => {
        setSuccess(null);
      }, 5000);

    } catch (err: any) {
      console.error('Error creating paid content:', err);
      setError(err.message || 'Failed to create paid content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!currentDraftId) {
      setError('No content to save');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from('paid_content')
        .update({ status: 'saved' })
        .eq('id', currentDraftId);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Draft saved successfully!');

      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err: any) {
      console.error('Error saving draft:', err);
      setError(err.message || 'Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleRegenerate = async (field: keyof GeneratedContent) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newContent = { ...generatedContent } as GeneratedContent;

      switch (field) {
        case 'adCopy':
          newContent.adCopy = `Discover the power of ${formData.campaignName}! ${formData.contentIdea}. Designed for ${formData.audienceType.toLowerCase()} audiences who want real results.`;
          break;
        case 'headlines':
          newContent.headlines = [
            `${formData.campaignName}: Change Everything Today`,
            `Why ${formData.campaignName} Is the Smart Choice`,
            `Unlock Your Potential with ${formData.campaignName}`,
          ];
          break;
        case 'ctaSuggestions':
          newContent.ctaSuggestions = [
            `${formData.ctaObjective} Today`,
            `Start Your Journey`,
            `Claim Your Offer`,
          ];
          break;
        case 'imagePrompt':
          newContent.imagePrompt = `Professional ${formData.visualStyle.toLowerCase()} image featuring ${formData.contentIdea}. Tone: ${formData.brandTone.toLowerCase()}, high-quality, platform: ${formData.targetPlatform}.`;
          break;
        case 'videoHooks':
          newContent.videoHooks = [
            `"Ready to transform your approach? Watch this..."`,
            `"This is what you've been missing..."`,
            `"Before you scroll away, see this..."`,
          ];
          break;
      }

      setGeneratedContent(newContent);

      if (currentDraftId) {
        const updateData: any = {};
        if (field === 'adCopy') updateData.generated_ad_copy = newContent.adCopy;
        if (field === 'headlines') updateData.generated_headlines = JSON.stringify(newContent.headlines);
        if (field === 'ctaSuggestions') updateData.generated_cta_suggestions = JSON.stringify(newContent.ctaSuggestions);
        if (field === 'imagePrompt') updateData.generated_image_prompt = newContent.imagePrompt;
        if (field === 'videoHooks') updateData.generated_video_hooks = JSON.stringify(newContent.videoHooks);

        await supabase
          .from('paid_content')
          .update(updateData)
          .eq('id', currentDraftId);
      }

    } catch (err: any) {
      console.error('Error regenerating content:', err);
      setError(err.message || 'Failed to regenerate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-pink-50/30">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex justify-end mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 transition-colors group"
            >
              <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold">DashAI</span>
            </Link>
          </div>

          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <DollarSign className="w-10 h-10 text-orange-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Paid Content
              </h1>
            </div>
            <p className="text-lg text-gray-700">
              Generate ad-ready content for paid social and display campaigns
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200/50 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200 flex items-center gap-2">
                <Target className="w-6 h-6 text-orange-500" />
                Campaign & Objective
              </h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="campaignName" className="block text-sm font-semibold text-slate-700 mb-2">
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="campaignName"
                    value={formData.campaignName}
                    onChange={(e) => updateField('campaignName', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900"
                    placeholder="Spring Sale 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Primary Goal <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Brand Awareness', 'Traffic', 'Leads', 'Sales', 'App Installs'].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => updateField('primaryGoal', goal)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          formData.primaryGoal === goal
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Target Platform <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Meta', 'TikTok', 'Google/YouTube', 'LinkedIn', 'X'].map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => updateField('targetPlatform', platform)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          formData.targetPlatform === platform
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200/50 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
                Audience Definition
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Audience Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Cold', 'Warm', 'Retargeting'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateField('audienceType', type)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          formData.audienceType === type
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="audienceCharacteristics" className="block text-sm font-semibold text-slate-700 mb-2">
                    Audience Characteristics <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-slate-500 mb-2">Describe interests, pain points, and desires</p>
                  <textarea
                    id="audienceCharacteristics"
                    value={formData.audienceCharacteristics}
                    onChange={(e) => updateField('audienceCharacteristics', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900 resize-none"
                    placeholder="Young professionals interested in productivity tools, struggling with time management..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ageRange" className="block text-sm font-semibold text-slate-700 mb-2">
                      Age Range
                    </label>
                    <input
                      type="text"
                      id="ageRange"
                      value={formData.ageRange}
                      onChange={(e) => updateField('ageRange', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900"
                      placeholder="25-45"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-2">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900"
                    >
                      <option value="">All</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900"
                      placeholder="United States, UK"
                    />
                  </div>

                  <div>
                    <label htmlFor="language" className="block text-sm font-semibold text-slate-700 mb-2">
                      Language
                    </label>
                    <input
                      type="text"
                      id="language"
                      value={formData.language}
                      onChange={(e) => updateField('language', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900"
                      placeholder="English"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200/50 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
                Budget & Duration
              </h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Budget Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Daily', 'Lifetime'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateField('budgetType', type)}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                            formData.budgetType === type
                              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                              : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="budgetAmount" className="block text-sm font-semibold text-slate-700 mb-2">
                      Budget Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                      <input
                        type="number"
                        id="budgetAmount"
                        value={formData.budgetAmount}
                        onChange={(e) => updateField('budgetAmount', e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900"
                        placeholder="500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={formData.startDate}
                      onChange={(e) => updateField('startDate', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={formData.endDate}
                      onChange={(e) => updateField('endDate', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Optimization Preference <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Conversions', 'Reach', 'Engagement', 'Lowest Cost'].map((pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => updateField('optimizationPreference', pref)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          formData.optimizationPreference === pref
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200/50 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
                Creative Direction
              </h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="contentIdea" className="block text-sm font-semibold text-slate-700 mb-2">
                    Content Idea <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contentIdea"
                    value={formData.contentIdea}
                    onChange={(e) => updateField('contentIdea', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900 resize-none"
                    placeholder="Launch announcement for our new productivity app with AI-powered features..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Brand Tone <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Professional', 'Friendly', 'Bold', 'Luxury', 'Playful'].map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => updateField('brandTone', tone)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          formData.brandTone === tone
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    CTA Objective <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Learn More', 'Buy Now', 'Sign Up', 'Download', 'Contact Us'].map((cta) => (
                      <button
                        key={cta}
                        type="button"
                        onClick={() => updateField('ctaObjective', cta)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          formData.ctaObjective === cta
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {cta}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Visual Style Preference <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Product-focused', 'Lifestyle', 'UGC', 'Minimal', 'Bold'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => updateField('visualStyle', style)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          formData.visualStyle === style
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200/50 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
                Output Preferences
              </h2>

              <div className="space-y-5">
                <div className="space-y-3">
                  {[
                    { key: 'generateAdCopy', label: 'Ad copy' },
                    { key: 'generateHeadlines', label: 'Headlines' },
                    { key: 'generateCtaText', label: 'CTA text' },
                    { key: 'generateImagePrompt', label: 'Image prompt' },
                    { key: 'generateVideoHooks', label: 'Video hook ideas' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[key as keyof PaidContentForm] as boolean}
                        onChange={(e) => updateField(key as keyof PaidContentForm, e.target.checked)}
                        className="w-5 h-5 text-orange-500 border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">Generate {label}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label htmlFor="numberOfVariations" className="block text-sm font-semibold text-slate-700 mb-2">
                    Number of Variations
                  </label>
                  <input
                    type="number"
                    id="numberOfVariations"
                    value={formData.numberOfVariations}
                    onChange={(e) => updateField('numberOfVariations', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-900"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!isFormValid() || loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Paid Content
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {generatedContent && (
            <div className="mt-8 bg-white rounded-2xl shadow-xl border-2 border-green-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Content Generated Successfully!</h3>
                    <p className="text-slate-600">Review your AI-generated ad content below</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {formData.generateAdCopy && generatedContent.adCopy && (
                  <div className="border-2 border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900">Primary Ad Copy</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(generatedContent.adCopy)}
                          className="p-2 text-slate-600 hover:text-orange-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRegenerate('adCopy')}
                          disabled={loading}
                          className="p-2 text-slate-600 hover:text-orange-600 transition-colors disabled:opacity-50"
                          title="Regenerate"
                        >
                          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-900 leading-relaxed">{generatedContent.adCopy}</p>
                  </div>
                )}

                {formData.generateHeadlines && generatedContent.headlines && (
                  <div className="border-2 border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900">Headline Variations</h4>
                      <button
                        onClick={() => handleRegenerate('headlines')}
                        disabled={loading}
                        className="p-2 text-slate-600 hover:text-orange-600 transition-colors disabled:opacity-50"
                        title="Regenerate"
                      >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {generatedContent.headlines.map((headline, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-bold text-orange-600 mt-0.5">{idx + 1}.</span>
                          <p className="flex-1 text-slate-900">{headline}</p>
                          <button
                            onClick={() => copyToClipboard(headline)}
                            className="p-1 text-slate-600 hover:text-orange-600 transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.generateCtaText && generatedContent.ctaSuggestions && (
                  <div className="border-2 border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900">CTA Suggestions</h4>
                      <button
                        onClick={() => handleRegenerate('ctaSuggestions')}
                        disabled={loading}
                        className="p-2 text-slate-600 hover:text-orange-600 transition-colors disabled:opacity-50"
                        title="Regenerate"
                      >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {generatedContent.ctaSuggestions.map((cta, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg border border-orange-200"
                        >
                          <span className="text-sm font-semibold text-slate-900">{cta}</span>
                          <button
                            onClick={() => copyToClipboard(cta)}
                            className="p-1 text-slate-600 hover:text-orange-600 transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.generateImagePrompt && generatedContent.imagePrompt && (
                  <div className="border-2 border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900">Image Generation Prompt</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(generatedContent.imagePrompt)}
                          className="p-2 text-slate-600 hover:text-orange-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRegenerate('imagePrompt')}
                          disabled={loading}
                          className="p-2 text-slate-600 hover:text-orange-600 transition-colors disabled:opacity-50"
                          title="Regenerate"
                        >
                          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-900 leading-relaxed bg-slate-50 p-4 rounded-lg">
                      {generatedContent.imagePrompt}
                    </p>
                  </div>
                )}

                {formData.generateVideoHooks && generatedContent.videoHooks && (
                  <div className="border-2 border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900">Video Hook / Script Ideas</h4>
                      <button
                        onClick={() => handleRegenerate('videoHooks')}
                        disabled={loading}
                        className="p-2 text-slate-600 hover:text-orange-600 transition-colors disabled:opacity-50"
                        title="Regenerate"
                      >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {generatedContent.videoHooks.map((hook, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-bold text-orange-600 mt-0.5">{idx + 1}.</span>
                          <p className="flex-1 text-slate-900">{hook}</p>
                          <button
                            onClick={() => copyToClipboard(hook)}
                            className="p-1 text-slate-600 hover:text-orange-600 transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedContent(null);
                      setCurrentDraftId(null);
                    }}
                    className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all"
                  >
                    Create New
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PaidContentPage;
