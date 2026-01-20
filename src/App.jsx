

import { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import { ref, push, onValue } from 'firebase/database';

const USERS = ['Yo', 'Mi amigo'];

function App() {
  const [visits, setVisits] = useState([]);
  const [selectedUser, setSelectedUser] = useState(USERS[0]);

  // Escuchar cambios en la base de datos en tiempo real
  useEffect(() => {
    const visitsRef = ref(db, 'visits');
    const unsubscribe = onValue(visitsRef, (snapshot) => {
      const data = snapshot.val();
      const arr = data ? Object.values(data) : [];
      setVisits(arr);
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = () => {
    const visitsRef = ref(db, 'visits');
    push(visitsRef, {
      user: selectedUser,
      date: new Date().toISOString()
    });
  };

  return (
    <div className="container">
      <h1>Registro de Gimnasio</h1>
      <div className="register-section">
        <label>
          ¿Quién fue?
          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
            {USERS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
        <button onClick={handleRegister}>Registrar visita</button>
      </div>

      <h2>Estadísticas</h2>
      <ul className="stats-list">
        {USERS.map(u => {
          const count = visits.filter(v => v.user === u).length;
          return (
            <li key={u}>
              {u}: <b>{count}</b> visita{count !== 1 ? 's' : ''}
            </li>
          );
        })}
      </ul>

      <h2>Historial de visitas</h2>
      <ul className="visit-list">
        {visits.length === 0 && <li>No hay visitas registradas.</li>}
        {visits.map((v, i) => (
          <li key={i}>
            {v.user} — {new Date(v.date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
