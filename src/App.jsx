

import { createContext, useContext, useEffect, useState } from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

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
  const { user, logout } = useAuth() || {};
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md mx-auto">
          <nav className="flex gap-4 p-4 bg-gray-800 rounded-t-xl">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Registro</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            {user && (
              <button onClick={logout} className="ml-4 bg-red-600 px-2 py-1 rounded hover:bg-red-700">Logout</button>
            )}
          </nav>
          <div className="bg-gray-900 rounded-b-xl shadow-xl">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}


