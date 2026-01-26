import { createContext, useContext, useEffect, useState } from 'react';

// Hack para iOS PWA: forzar scroll para que el safe-area se aplique correctamente al cargar
function IOSPWAScrollHack() {
  useEffect(() => {
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isIos && isInStandaloneMode) {
      setTimeout(() => {
        window.scrollTo(0, 1);
        window.scrollTo(0, 0);
      }, 100);
    }
  }, []);
  return null;
}
import ThemeProvider from './components/ThemeProvider';
// import ErrorBoundary from './components/ErrorBoundary';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import HomeComparativoPage from './pages/HomeComparativoPage';
import Layout from './components/Layout/Layout';
import ChecklistPage from './pages/Checklist';
import MealsPage from './pages/Meals';
import ProgressPage from './pages/Progress';
import RankingPage from './pages/Ranking';
import StatsPage from './pages/Stats';
import ProfilePage from './pages/Profile';
import AchievementsPage from './pages/Achievements';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <IOSPWAScrollHack />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/comparativo" replace />} />
                    <Route path="/comparativo" element={<HomeComparativoPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/checklist" element={<ChecklistPage />} />
                    <Route path="/meals" element={<MealsPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/ranking" element={<RankingPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/achievements" element={<AchievementsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}



