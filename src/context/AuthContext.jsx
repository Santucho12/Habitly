import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Datos extendidos de Firestore
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Sincronizar datos extendidos del usuario (pairId, companionId, etc.)
  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }
    const userDoc = doc(db, 'users', user.uid);
    const unsub = onSnapshot(userDoc, (snap) => {
      setUserData(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [user]);

  const logout = () => signOut(auth);

  // userData puede ser null si no está logueado o el doc no existe
  // Unificamos los datos de auth y firestore para exponerlos juntos
  const mergedUser = user && userData ? { ...user, ...userData } : user;
  return (
    <AuthContext.Provider value={{ user: mergedUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
