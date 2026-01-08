import { User, ChevronDown, ChevronUp, Briefcase, Sparkles, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/authContext';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [contentExpanded, setContentExpanded] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-64 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 border-r-2 border-orange-200/50 flex flex-col h-screen shadow-xl">
      <div className="p-6 border-b-2 border-orange-200/50 bg-white/60 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg transform hover:scale-105 transition-transform">
            <User className="w-12 h-12 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800 text-center break-words px-2">
            {user?.email || 'User'}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          <button
            onClick={() => setContentExpanded(!contentExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 hover:bg-orange-100/50 rounded-xl transition-all font-semibold"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>Content</span>
            </div>
            {contentExpanded ? (
              <ChevronUp className="w-4 h-4 text-orange-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-orange-500" />
            )}
          </button>

          {contentExpanded && (
            <div className="mt-2 ml-4 space-y-2">
              <button
                onClick={() => navigate('/content-blueprint')}
                className={`w-full px-4 py-2.5 text-left rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  isActive('/content-blueprint')
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-700 bg-white/60 hover:bg-orange-50 border-2 border-orange-200/50'
                }`}
              >
                Creation
              </button>
              <button
                onClick={() => navigate('/paid-content-strategy')}
                className={`w-full px-4 py-2.5 text-left rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  isActive('/paid-content-strategy')
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-700 bg-white/60 hover:bg-orange-50 border-2 border-orange-200/50'
                }`}
              >
                Paid Strategy
              </button>
              <button
                onClick={() => navigate('/content-review')}
                className={`w-full px-4 py-2.5 text-left rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  isActive('/content-review')
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-700 bg-white/60 hover:bg-orange-50 border-2 border-orange-200/50'
                }`}
              >
                Review
              </button>
              <button
                onClick={() => navigate('/content-history')}
                className={`w-full px-4 py-2.5 text-left rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  isActive('/content-history')
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-700 bg-white/60 hover:bg-orange-50 border-2 border-orange-200/50'
                }`}
              >
                History
              </button>
            </div>
          )}
        </div>

        <div className="px-3 mt-3">
          <button className="w-full px-4 py-3 text-left text-gray-700 bg-white/60 hover:bg-orange-50 rounded-xl transition-all font-semibold border-2 border-orange-200/50 transform hover:scale-105">
            Leads Gen
          </button>
        </div>

        <div className="px-3 mt-3">
          <button className="w-full px-4 py-3 text-left text-gray-700 bg-white/60 hover:bg-orange-50 rounded-xl transition-all font-semibold border-2 border-orange-200/50 transform hover:scale-105">
            Cust. Serv.
          </button>
        </div>
      </nav>

      <div className="p-4 border-t-2 border-orange-200/50 space-y-2 bg-white/60 backdrop-blur-sm">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-100 to-pink-100 hover:from-orange-200 hover:to-pink-200 rounded-xl transition-all transform hover:scale-105 shadow-sm">
          <Briefcase className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-gray-800">Subscription Plans</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-xl transition-all font-semibold border-2 border-orange-300 transform hover:scale-105"
        >
          <LogOut className="w-5 h-5 text-orange-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
