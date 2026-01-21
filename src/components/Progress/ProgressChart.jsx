import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Line } from 'react-chartjs-2';
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

  const chartData = {
    labels: progress.map(p => p.mes),
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

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-bold mb-2">Evolución de peso</h3>
      <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
    </div>
  );
}
