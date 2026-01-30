import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Line, Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ProgressChart() {
  const user = getAuth().currentUser;
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const q = query(collection(db, 'progress'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => doc.data());
      // Ordenar por mes ascendente
      data.sort((a, b) => (a.mes > b.mes ? 1 : -1));
      setProgress(data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div>Cargando evolución...</div>;
  if (progress.length === 0) return <div>No hay datos de progreso.</div>;

  // Calcular variación de peso mes a mes
  // Ahora: los kilos bajados se muestran como negativos (descenso) y los subidos como positivos (aumento)
  const weightDiffs = progress.map((p, i) => {
    if (i === 0) return 0;
    return Number((p.peso - progress[i - 1].peso).toFixed(1));
  });

  const chartLabels = progress.map(p => dayjs(p.mes + '-01').locale('es').format('MMMM YY'));
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Peso (kg)',
        data: progress.map(p => p.peso),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.3,
      },
    ],
  };

  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Variación mensual (kg)',
        data: weightDiffs.map(diff => Math.abs(diff)),
        backgroundColor: weightDiffs.map(diff => diff < 0 ? 'rgba(34,197,94,0.7)' : diff > 0 ? 'rgba(239,68,68,0.7)' : 'rgba(156,163,175,0.7)'),
      },
    ],
  };

  // Calcular total acumulado desde el primer mes
  // El total acumulado ahora es negativo si bajó de peso (peso actual menor al inicial)
  const totalAcumulado = progress.map((p, i) => {
    if (i === 0) return 0;
    return Number((p.peso - progress[0].peso).toFixed(1));
  });

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6 w-full max-w-full" style={{ boxSizing: 'border-box' }}>
      <h3 className="text-lg font-bold mb-2">Evolución de peso</h3>
      <div style={{ overflowX: 'auto', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
        <div
          style={{
            minWidth: chartLabels.length > 5 ? `${chartLabels.length * 90}px` : '100%',
            maxWidth: '100vw',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: true } },
              scales: {
                x: {
                  ticks: {
                    callback: function (value, index, values) {
                      // Mostrar las etiquetas en vertical
                      return this.getLabelForValue(value).replace(' ', '\n');
                    },
                    color: '#fff',
                    font: { size: 12 },
                    maxRotation: 0,
                    minRotation: 0,
                  },
                  grid: {
                    display: true,
                    color: 'rgba(255,255,255,0.15)',
                    drawTicks: true,
                    drawOnChartArea: true,
                    drawBorder: true,
                  },
                },
                y: {
                  grid: {
                    display: true,
                    color: 'rgba(255,255,255,0.10)',
                  },
                  ticks: {
                    color: '#fff',
                  },
                },
              },
            }}
            height={260}
          />
        </div>
      </div>
      <div className="mt-8">
        <h4 className="text-md font-semibold mb-2">Variación mensual de peso</h4>
        <Bar data={barData} options={{
          responsive: true,
          plugins: { legend: { display: false }, tooltip: { callbacks: { 
            label: ctx => {
              const i = ctx.dataIndex;
              const diff = weightDiffs[i];
              if (i === 0) return '-';
              return (diff < 0 ? '-' : '+') + Math.abs(diff) + ' kg';
            }
          } } },
          scales: { y: { beginAtZero: true } },
        }} />
        <table className="w-full mt-4 text-sm text-white text-center border-separate border-spacing-y-1">
          <thead>
            <tr className="bg-gray-700">
              <th className="rounded-l px-2 py-1">Mes</th>
              <th>Peso (kg)</th>
              <th>Variación</th>
              <th className="rounded-r px-2 py-1">Total acumulado</th>
            </tr>
          </thead>
          <tbody>
            {progress.map((p, i) => (
              <tr key={p.mes} className="bg-gray-900">
                <td className="px-2 py-1">{dayjs(p.mes + '-01').locale('es').format('MMMM YYYY')}</td>
                <td>{p.peso}</td>
                <td className={weightDiffs[i] < 0 ? 'text-green-400' : weightDiffs[i] > 0 ? 'text-red-400' : 'text-gray-300'}>
                  {i === 0 ? '-' : (weightDiffs[i] < 0 ? '-' : '+') + Math.abs(weightDiffs[i]) + ' kg'}
                </td>
                <td className={totalAcumulado[i] < 0 ? 'text-green-400' : totalAcumulado[i] > 0 ? 'text-red-400' : 'text-gray-300'}>
                  {i === 0 ? '-' : (totalAcumulado[i] < 0 ? '-' : '+') + Math.abs(totalAcumulado[i]) + ' kg'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
