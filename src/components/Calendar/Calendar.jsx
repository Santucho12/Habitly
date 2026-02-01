import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDailyActivity } from '../../services/habits';
import dayjs from 'dayjs';

// Devuelve color según cumplimiento: verde, amarillo, rojo
function getDayColor(checked) {
  if (!checked) return 'bg-gray-400';
  const { gym, correr, caminar } = checked;
  if (gym && correr && caminar) return 'bg-green-500';
  if (gym || correr || caminar) return 'bg-yellow-400';
  return 'bg-red-500';
}

export default function Calendar({ month, year }) {
  const { user } = useAuth();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
    const fetchData = async () => {
      const arr = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = dayjs(`${year}-${month}-${d}`).format('YYYY-MM-DD');
        // eslint-disable-next-line no-await-in-loop
        const checked = await getDailyActivity(user.uid, date);
        arr.push({ date, checked });
      }
      setDays(arr);
      setLoading(false);
    };
    fetchData();
  }, [user, month, year]);

  if (loading) return <div>Cargando calendario...</div>;

  // Renderiza calendario simple
  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-bold mb-2">Calendario de Actividad</h3>
      <div className="grid grid-cols-7 gap-1">
        {[...Array(days.length)].map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-xs text-white ${getDayColor(days[i].checked)}`}
            title={days[i].date}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
