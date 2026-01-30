import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { getDailyActivity } from '../../services/habits';
import dayjs from 'dayjs';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Stats({ month, year }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
    const fetchData = async () => {
      let gym = 0, correr = 0, caminar = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const date = dayjs(`${year}-${month}-${d}`).format('YYYY-MM-DD');
        // eslint-disable-next-line no-await-in-loop
        const checked = await getDailyActivity(user.uid, date);
        if (checked?.gym) gym++;
        if (checked?.correr) correr++;
        if (checked?.caminar) caminar++;
      }
      setData({ gym, correr, caminar });
      setLoading(false);
    };
    fetchData();
  }, [user, month, year]);

  if (loading) return <div>Cargando estadísticas...</div>;

  const chartData = {
    labels: ['Gimnasio', 'Correr', 'Caminar'],
    datasets: [
      {
        label: 'Días cumplidos',
        data: [data.gym, data.correr, data.caminar],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(251, 191, 36, 0.7)',
        ],
      },
    ],
  };

  const sinDatos = !data.gym && !data.correr && !data.caminar;

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-bold mb-2">Estadísticas del mes</h3>
      {sinDatos ? (
        <div className="text-gray-400 text-center mt-8">
          <img src="/src/assets/images/empty-habits.svg" alt="Sin estadísticas" className="mx-auto mb-4 w-24 h-24 opacity-80" />
          <div className="font-semibold">¡Aún no tienes estadísticas este mes!</div>
          <div className="text-sm text-gray-400">Marca actividades para ver tu progreso aquí.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[400px] max-w-full">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 0,
                      minRotation: 0,
                      callback: function(value, index, values) {
                        // Show full label horizontally
                        return this.getLabelForValue(value);
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
