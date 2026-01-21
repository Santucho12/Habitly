import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { getDailyMeals } from '../../services/meals';
import dayjs from 'dayjs';

export default function MealsRacha({ month, year }) {
  const { user } = useAuth();
  const [racha, setRacha] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
    let currentRacha = 0;
    let maxRacha = 0;
    let tempRacha = 0;
    const fetchData = async () => {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = dayjs(`${year}-${month}-${d}`).format('YYYY-MM-DD');
        // eslint-disable-next-line no-await-in-loop
        const meals = await getDailyMeals(user.uid, date);
        if (meals && !meals.excepcion && ['desayuno','almuerzo','merienda','cena'].every(m => meals[m]?.puntuacion === 5)) {
          tempRacha++;
          if (tempRacha > maxRacha) maxRacha = tempRacha;
        } else if (meals && meals.excepcion) {
          // excepción: no corta racha
        } else {
          tempRacha = 0;
        }
      }
      setRacha(maxRacha);
      setLoading(false);
    };
    fetchData();
  }, [user, month, year]);

  if (loading) return <div>Cargando racha de comidas...</div>;

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-bold mb-2">Racha máxima de comidas perfectas</h3>
      <div className="text-2xl text-yellow-300">{racha} días</div>
    </div>
  );
}
