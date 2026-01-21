import React, { useEffect, useState } from 'react';
import AchievementBanner from '../Achievements/AchievementBanner';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { calcularPuntosDia } from '../../utils/points';
import dayjs from 'dayjs';

export default function StreaksAndPoints({ month, year }) {
  const user = getAuth().currentUser;
  const [dias, setDias] = useState([]);
  const [racha, setRacha] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMsg, setBannerMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const monthStr = `${year}-${month}`;
      const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
      let totalPuntos = 0;
      let diasCumplidos = [];
      let excepciones = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const fecha = dayjs(`${year}-${month}-${d}`).format('YYYY-MM-DD');
        // Habits
        const habitsSnap = await getDocs(query(collection(db, 'habits'), where('userId', '==', user.uid), where('date', '==', fecha)));
        let gym = false, correr = false, caminar = false, rachaGimnasio = 0;
        habitsSnap.forEach(doc => {
          const data = doc.data();
          if (data.gym) gym = true;
          if (data.correr) correr = true;
          if (data.caminar) caminar = true;
        });
        // Meals
        const mealsSnap = await getDocs(query(collection(db, 'meals'), where('userId', '==', user.uid), where('fecha', '==', fecha)));
        let comidas = [];
        let bonoPerfecto = false;
        let excepcion = false;
        mealsSnap.forEach(doc => {
          const data = doc.data();
          comidas = ['desayuno','almuerzo','merienda','cena'].map(m => data[m]);
          bonoPerfecto = data.bonoPerfecto;
          excepcion = data.excepcion;
        });
        if (excepcion) excepciones.push(d-1);
        const puntosDia = calcularPuntosDia({ gym, correr, caminar, comidas, bonoPerfecto, rachaGimnasio, excepcion });
        totalPuntos += puntosDia;
        diasCumplidos.push(gym || correr || caminar || (comidas && comidas.every(c => c?.puntuacion === 5)));
      }
      setDias(diasCumplidos);
      setPuntos(totalPuntos);
      // Racha máxima
      let maxRacha = 0, actual = 0;
      for (let i = 0; i < diasCumplidos.length; i++) {
        if (diasCumplidos[i] || excepciones.includes(i)) {
          actual++;
          if (actual > maxRacha) maxRacha = actual;
        } else {
          actual = 0;
        }
      }
      setRacha(maxRacha);
      setLoading(false);
      // Mostrar banner de logro si se alcanza una nueva racha
      if (maxRacha === 7) {
        setBannerMsg('¡Logro: 7 días de racha!');
        setShowBanner(true);
      } else if (maxRacha === 14) {
        setBannerMsg('¡Logro: 14 días de racha!');
        setShowBanner(true);
      } else if (maxRacha === 30) {
        setBannerMsg('¡Logro: mes perfecto!');
        setShowBanner(true);
      }
    };
    fetchData();
  }, [user, month, year]);

  if (loading) return <div>Cargando puntos y rachas...</div>;

  return (
    <>
      {showBanner && <AchievementBanner message={bannerMsg} onClose={() => setShowBanner(false)} />}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-bold mb-2">Puntos y Racha del mes</h3>
        <div className="text-2xl text-blue-400 mb-2">Puntos: {puntos}</div>
        <div className="text-2xl text-yellow-300 mb-2">Racha máxima: {racha} días</div>
        {racha >= 7 && <div className="text-green-400">¡Logro: 7 días de racha!</div>}
        {racha >= 14 && <div className="text-green-400">¡Logro: 14 días de racha!</div>}
        {racha >= 30 && <div className="text-green-400">¡Logro: mes perfecto!</div>}
      </div>
    </>
  );
}
