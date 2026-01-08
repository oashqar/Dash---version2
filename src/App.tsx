import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ContentBlueprintPage from './pages/ContentBlueprintPage';
import ContentReviewPage from './pages/ContentReviewPage';
import ContentHistoryPage from './pages/ContentHistoryPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/content-blueprint"
            element={
              <ProtectedRoute>
                <ContentBlueprintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content-review"
            element={
              <ProtectedRoute>
                <ContentReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content-history"
            element={
              <ProtectedRoute>
                <ContentHistoryPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
