import React, { useEffect, useState, useRef } from 'react';
import EmptyState from '../components/EmptyState';
import { getMonthlyRanking } from '../services/ranking';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

function Ranking() {


  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevPos, setPrevPos] = useState(null);
  const user = getAuth().currentUser;
  const mes = dayjs().format('YYYY-MM');
  const animRowRef = useRef(null);

  useEffect(() => {
    getMonthlyRanking(mes).then(data => {
      const usuarios = data?.usuarios || [];
      const myUser = usuarios.find(u => u.userId === user?.uid);
      if (myUser && prevPos !== null && myUser.posicion < prevPos) {
        // Subió de posición
        if (animRowRef.current) {
          animRowRef.current.classList.add('animate-ranking-up');
          setTimeout(() => {
            if (animRowRef.current) animRowRef.current.classList.remove('animate-ranking-up');
          }, 1200);
        }
      }
      setPrevPos(myUser?.posicion || null);
      setRanking(usuarios);
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [mes]);

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-blue-300 mb-4 text-center">Ranking mensual</h2>
      {loading ? (
        <div className="text-white text-center">Cargando ranking...</div>
      ) : !ranking.length ? (
        <EmptyState
          title="¡Aún no hay ranking este mes!"
          description="Participa y suma puntos para aparecer aquí."
          illustration="habit"
        />
      ) : (
        <table className="w-full text-left bg-gray-900 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-2 px-2">Posición</th>
              <th className="py-2 px-2">Usuario</th>
              <th className="py-2 px-2">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.sort((a,b)=>a.posicion-b.posicion).map((u) => {
              const isMe = u.userId === user?.uid;
              return (
                <tr
                  key={u.userId}
                  ref={isMe ? animRowRef : null}
                  className={
                    isMe
                      ? 'bg-blue-900 text-blue-300 font-bold transition animate-fade-in'
                      : 'hover:bg-gray-700 transition'
                  }
                >
                  <td className="py-2 px-2">{u.posicion}</td>
                  <td className="py-2 px-2">{isMe ? 'Tú' : u.userId}</td>
                  <td className="py-2 px-2">{u.puntos}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {/* Estado vacío ya cubierto arriba con EmptyState */}
    </div>
  );
}

export default Ranking;
