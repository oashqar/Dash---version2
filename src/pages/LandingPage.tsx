import { useNavigate } from 'react-router-dom';
import { Smartphone, Sparkles, Target, MessageSquare, Zap, ArrowRight, Twitter, Linkedin, Github, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import type { User } from '@supabase/supabase-js';

export default function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleWatchDemo = () => {
    setIsVideoPlaying(true);
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      videoRef.current?.play();
    }, 500);
  };

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const features = [
    {
      icon: Sparkles,
      title: 'Social Media Automation',
      description: 'Generate engaging content across all platforms with AI-powered creativity. Schedule, publish, and optimize in one place.',
      gradient: 'from-orange-400 to-pink-500',
      onClick: user ? () => navigate('/content-blueprint') : undefined,
    },
    {
      icon: Target,
      title: 'Lead Generation',
      description: 'Capture and nurture leads automatically. Transform visitors into customers with intelligent workflows.',
      gradient: 'from-pink-500 to-purple-500',
      onClick: undefined,
    },
    {
      icon: MessageSquare,
      title: 'Customer Support',
      description: 'Provide instant, 24/7 support with AI assistants. Keep every conversation context-aware and personalized.',
      gradient: 'from-purple-500 to-orange-400',
      onClick: () => window.open('https://exclusive-urban-fash-qh61.bolt.host/', '_blank'),
    },
  ];

  const useCases = [
    {
      title: 'Content Creators',
      description: 'Create viral content effortlessly',
      detail: 'Save 10+ hours per week on social media management',
      avatar: '🎨',
    },
    {
      title: 'Marketing Teams',
      description: 'Scale campaigns without scaling headcount',
      detail: 'Coordinate multi-channel campaigns from one dashboard',
      avatar: '📊',
    },
    {
      title: 'Small Businesses',
      description: 'Compete with enterprise-level tools',
      detail: 'Affordable automation that grows with you',
      avatar: '🚀',
    },
  ];

  const stats = [
    { value: '10x', label: 'Faster Content Creation' },
    { value: '85%', label: 'Time Saved Weekly' },
    { value: '3M+', label: 'Posts Generated' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-lg shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Dash.ai
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors relative group">
              Solutions
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500 transition-all group-hover:w-full" />
            </button>
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors relative group">
              Why Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500 transition-all group-hover:w-full" />
            </button>
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors relative group">
              Customers
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500 transition-all group-hover:w-full" />
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-700 font-medium">
                  Welcome, {displayName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/auth?mode=signup')}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-6 py-2.5 rounded-full transition-all transform hover:scale-105 hover:shadow-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-float" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
              One Brain.
              <br />
              <span className="text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Automate. Convert. Support.
              </span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            Stop juggling 5+ disconnected tools. Dash.ai unifies lead generation, social media, and customer support into one intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="group bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-10 py-5 rounded-full text-lg transition-all transform hover:scale-105 hover:shadow-2xl flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleWatchDemo}
              className="group bg-white hover:bg-gray-50 text-gray-900 font-semibold px-10 py-5 rounded-full text-lg transition-all border-2 border-gray-200 hover:border-gray-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-2"
            >
              Watch Demo
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>

          <div ref={videoSectionRef} className="relative animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-3xl blur-2xl opacity-20" />
            <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-4 shadow-2xl border border-gray-200">
              <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
                {!isVideoPlaying && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10" />
                    <svg
                      className="w-full h-full opacity-10"
                      viewBox="0 0 800 450"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line x1="0" y1="0" x2="800" y2="450" stroke="#9CA3AF" strokeWidth="2" />
                      <line x1="800" y1="0" x2="0" y2="450" stroke="#9CA3AF" strokeWidth="2" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse-slow">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-700 text-lg font-semibold">Platform Preview</p>
                      </div>
                    </div>
                  </>
                )}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover rounded-2xl ${isVideoPlaying ? 'block' : 'hidden'}`}
                  controls
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  <source src="https://ntetahapqyfjomzdhayn.supabase.co/storage/v1/object/public/ai-videos/ProductIntro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Everything you need, in one place
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools that work together seamlessly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={feature.onClick}
                className={`group relative bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-transparent transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 ${
                  feature.onClick ? 'cursor-pointer' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`} />

                <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg transform transition-transform duration-300 ${hoveredFeature === index ? 'rotate-6 scale-110' : ''}`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                <div className={`mt-6 flex items-center gap-2 text-transparent bg-gradient-to-r ${feature.gradient} bg-clip-text font-semibold opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {feature.onClick && user ? 'Start creating' : 'Learn more'}
                  <ArrowRight className="w-4 h-4 text-orange-500 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Built for everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From solo creators to growing teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-6xl mb-6">{useCase.avatar}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-lg text-gray-700 mb-2 font-medium">
                  {useCase.description}
                </p>
                <p className="text-gray-600">
                  {useCase.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-pink-50 hover:from-orange-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-3">
                  {stat.value}
                </div>
                <div className="text-lg text-gray-700 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of teams already saving time and scaling faster with Dash.ai
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="group bg-white hover:bg-gray-100 text-gray-900 font-semibold px-10 py-5 rounded-full text-lg transition-all transform hover:scale-105 hover:shadow-2xl flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleWatchDemo}
              className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-10 py-5 rounded-full text-lg transition-all border-2 border-white/30 hover:border-white/50 transform hover:scale-105 flex items-center gap-2"
            >
              See it in action
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Dash.ai</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The unified platform for modern marketing teams.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Dash.ai. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
