import { Bot, ArrowRight, Zap, AlertCircle, TrendingDown, Clock, Users, Sparkles, Share2, MessageSquare, Target, Shield, CheckCircle2, Lightbulb, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import type { User } from '@supabase/supabase-js';

function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSocialMediaClick = () => {
    if (user) {
      navigate('/content-blueprint');
    }
  };

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Dash.ai</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#solutions" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Solutions</a>
            <a href="#why-us" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Why Us</a>
            <a href="#customers" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Customers</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
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
              </>
            ) : (
              <>
                <Link to="/auth" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/auth?mode=signup" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-600/30">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full mb-8">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Automation for Retailers</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold mb-4 leading-tight">
            <span className="text-slate-900">One Brain.</span>
            <br />
            <span className="text-blue-600">Zero Amnesia.</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Stop juggling 5+ disconnected tools. Dash.ai unifies lead generation, social media, and customer support into one intelligent platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/auth?mode=signup" className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-blue-600/30 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold transition-all">
              Watch Demo
            </button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>14-day free trial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-full mb-8">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">The Small Business Struggle</span>
          </div>

          {/* Heading */}
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-8">
            Disconnected Systems Kill Growth
          </h2>

          {/* Subheading */}
          <p className="text-xl text-slate-600 leading-relaxed">
            The average small business juggles 6-10 tools. Each one adds friction, costs, and missed opportunities.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-32">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6">
              <TrendingDown className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Pipeline Starvation</h3>
            <p className="text-slate-600 leading-relaxed">
              3-5 disconnected lead management tools drain your revenue potential
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Follow-Up Failure</h3>
            <p className="text-slate-600 leading-relaxed">
              2-3 social media tools but no content at scale when you need it
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Retention Crisis</h3>
            <p className="text-slate-600 leading-relaxed">
              1-2 support tools that can't keep your customers engaged 24/7
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div id="solutions" className="grid md:grid-cols-3 gap-6 mb-32 scroll-mt-24">
          {/* Feature 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Lead Generation & Nurturing Engine</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Automatically capture, qualify, and nurture leads while you sleep. Turn cold prospects into hot opportunities with AI-powered workflows.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium">Smart lead scoring</span>
              </li>
              <li className="flex items-center gap-2 text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium">Auto follow-ups</span>
              </li>
              <li className="flex items-center gap-2 text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium">Pipeline automation</span>
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div
            onClick={handleSocialMediaClick}
            className={`bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all ${
              user ? 'cursor-pointer hover:border-blue-400 hover:scale-[1.02]' : ''
            }`}
          >
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Social Media Content Automation</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Create and schedule content at scale across all platforms. Maintain consistent brand presence without the content creation burnout.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium">AI content creation</span>
              </li>
              <li className="flex items-center gap-2 text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium">Multi-platform scheduling</span>
              </li>
              <li className="flex items-center gap-2 text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium">Performance analytics</span>
              </li>
            </ul>
            {user && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  <span>Click to create content</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Customer Service Bot</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Sell and support 24/7 with an intelligent chatbot trained on your business. Answer FAQs, close sales, and delight customers automatically.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium">24/7 availability</span>
              </li>
              <li className="flex items-center gap-2 text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium">Knowledge base integration</span>
              </li>
              <li className="flex items-center gap-2 text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium">Human handoff</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Solution Section */}
        <div id="why-us" className="text-center max-w-4xl mx-auto mb-20 scroll-mt-24">
          {/* Heading */}
          <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="text-slate-900">Why </span>
            <span className="text-blue-600">Dash.ai</span>
            <span className="text-slate-900"> Wins</span>
          </h2>

          {/* Description */}
          <p className="text-xl text-slate-600 leading-relaxed">
            Big competitors thrive on feature bloat. We thrive on your growth.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Simplicity Over Feature Bloat</h3>
            <p className="text-slate-600 leading-relaxed">
              While competitors like Zapier add complexity, we focus on what retailers actually need. No overwhelming dashboards. Just results.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Speed at Scale</h3>
            <p className="text-slate-600 leading-relaxed">
              Deploy in hours, not months. Our AI adapts to your business instantly, learning from your data to deliver results from day one.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Reliability You Can Count On</h3>
            <p className="text-slate-600 leading-relaxed">
              We don't just sell automation—we sell peace of mind. Your customers get served, your leads get nurtured, automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section id="customers" className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl mb-20 scroll-mt-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
              <span className="text-sm font-medium">Built for Retailers Like You</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Empowering Fashion & Beauty Retailers Worldwide
            </h2>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Dash.ai is purpose-built for growing retailers who refuse to let disconnected systems hold them back. If you're ready to scale without the chaos, you're in the right place.
            </p>

            {/* Checkpoints */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <span className="text-slate-900 font-medium">Beauty & fashion retailers</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <span className="text-slate-900 font-medium">10-100 employees</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <span className="text-slate-900 font-medium">Global presence</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <span className="text-slate-900 font-medium">Growth-focused mindset</span>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white border-l-4 border-blue-600 rounded-lg p-6 shadow-sm">
              <p className="text-slate-700 italic mb-4 leading-relaxed">
                "Finally, a platform that understands retail. We went from juggling 7 tools to one elegant solution. Our response time dropped from hours to seconds."
              </p>
              <p className="text-sm text-slate-500">— Sarah M., Boutique Owner</p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/image copy copy.png"
                alt="Fashion retailer in boutique store"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 mb-20">
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl py-20 px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ready to Unify Your Business?
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join hundreds of retailers who've eliminated system chaos and unlocked growth. Start your 14-day free trial today—no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link to="/auth?mode=signup" className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-blue-600/30 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold transition-all">
              Schedule Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span>Setup takes less than 5 minutes. No technical expertise required.</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900">Dash.ai</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                One brain. Zero amnesia. Unified automation for growing retailers.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Use Cases</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2024 Dash.ai. All rights reserved. Built for retail excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
