import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import dayjs from 'dayjs';

export default function ProgressPhotoCompare() {
  const user = getAuth().currentUser;
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const q = query(collection(db, 'progress'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => doc.data()).filter(p => p.foto);
      // Ordenar por mes ascendente
      data.sort((a, b) => (a.mes > b.mes ? 1 : -1));
      setProgress(data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div>Cargando fotos...</div>;
  if (progress.length < 2) return <div>Sube al menos dos fotos para comparar.</div>;

  const prev = () => setIndex(i => Math.max(i - 1, 0));
  const next = () => setIndex(i => Math.min(i + 1, progress.length - 2));

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-bold mb-2">Comparación de fotos</h3>
      <div className="flex gap-4 items-center justify-center">
        <div>
          <img src={progress[index].foto} alt={`Foto ${progress[index].mes}`} className="w-32 h-32 object-cover rounded" />
          <div className="text-center text-sm mt-1">{progress[index].mes}</div>
        </div>
        <span className="text-2xl">⇄</span>
        <div>
          <img src={progress[index+1].foto} alt={`Foto ${progress[index+1].mes}`} className="w-32 h-32 object-cover rounded" />
          <div className="text-center text-sm mt-1">{progress[index+1].mes}</div>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-2">
        <button onClick={prev} disabled={index === 0} className="px-2 py-1 bg-gray-700 rounded text-white disabled:opacity-50">Anterior</button>
        <button onClick={next} disabled={index >= progress.length - 2} className="px-2 py-1 bg-gray-700 rounded text-white disabled:opacity-50">Siguiente</button>
      </div>
    </div>
  );
}
