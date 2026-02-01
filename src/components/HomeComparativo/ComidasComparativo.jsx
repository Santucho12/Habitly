import React, { useState, useEffect } from 'react';
import { useUserNames } from '../../hooks/useUserNames';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const comidasDelDiaEjemplo = [
  {
    id: 1,
    foto: '/src/assets/images/desayuno.jpg',
    titulo: 'Desayuno',
    puntuacion: 'buena',
  },
  {
    id: 2,
    foto: '/src/assets/images/almuerzo.jpg',
    titulo: 'Almuerzo',
    puntuacion: 'masomenos',
  },
  {
    id: 3,
    foto: '/src/assets/images/cena.jpg',
    titulo: 'Cena',
    puntuacion: 'mala',
  }
];

const puntuacionColor = {
  buena: 'bg-green-400',
  masomenos: 'bg-yellow-400',
  mala: 'bg-red-400',
};

function ComidasSlider({ comidas, readOnly }) {
  const [current, setCurrent] = useState(0);
  const total = comidas.length;
  const handlePrev = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const handleNext = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  const comida = comidas[current];
  // Traducción y formato de puntuación
  let puntuacionTxt = '';
  if (comida.vacia) {
    puntuacionTxt = 'Sin registro';
  } else if (comida.puntuacion === 'buena' || comida.puntuacion === 5) puntuacionTxt = 'MUY BIEN';
  else if (comida.puntuacion === 'masomenos' || comida.puntuacion === 3) puntuacionTxt = 'BIEN';
  else if (comida.puntuacion === 'mala' || comida.puntuacion === 1) puntuacionTxt = 'REGULAR';
  else if (comida.puntuacion === -1) puntuacionTxt = 'MAL';
  else if (comida.puntuacion === -3) puntuacionTxt = 'MUY MAL';
  else puntuacionTxt = String(comida.puntuacion || '').toUpperCase();
  return (
    <div className="w-full flex flex-col items-center justify-center"
      style={{ transform: 'scale(0.62)', transformOrigin: 'top left', marginTop: '-250px', marginRight: '40px' }}>
      <div className="relative w-72 h-80 flex items-center justify-center">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-900 z-20"
          onClick={handlePrev}
          aria-label="Anterior"
        >
          &#8592;
        </button>
        <div
          className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-2xl p-4 shadow-xl w-64 h-72 flex flex-col items-center justify-center relative"
        >
          {comida.vacia ? (
            <div className="absolute left-1/2 top-1/2 w-[90%] h-[90%] flex flex-col items-center justify-center rounded-xl border-4 border-gray-900 -translate-x-1/2 -translate-y-1/2 z-0 bg-gray-800 opacity-80">
              <span className="text-white text-2xl font-bold">{comida.titulo}</span>
              <span className="text-gray-400 text-sm">Sin registro</span>
            </div>
          ) : (
            <>
              <img
                src={comida.foto}
                alt={comida.titulo}
                className="absolute left-1/2 top-1/2 w-[90%] h-[90%] object-cover rounded-xl border-4 border-gray-900 -translate-x-1/2 -translate-y-1/2 z-0"
                style={{ zIndex: 0 }}
              />
              <div className="relative z-10 w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                <div className="w-full flex flex-col items-center justify-center mb-6">
                  <h3 className="text-xl font-extrabold text-white mb-1 text-center drop-shadow uppercase" style={{ textShadow: '0 2px 8px #000' }}>{comida.titulo?.toUpperCase()}</h3>
                  <span className={`text-white text-base font-bold px-4 py-2 rounded-full shadow ${puntuacionColor[comida.puntuacion] || 'bg-gray-600'} uppercase`} style={{ letterSpacing: 1 }}>{puntuacionTxt}</span>
                </div>
              </div>
            </>
          )}
        </div>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-900"
          onClick={handleNext}
          aria-label="Siguiente"
        >
          &#8594;
        </button>
      </div>
      <div className="mt-2 flex gap-2 justify-center">
        {comidas.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === current ? 'bg-blue-500' : 'bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ComidasComparativo({ usuarioType = 'yo', usuarioId = null }) {
  // Carrusel de todas las comidas (desayuno, almuerzo, merienda, cena) del usuario
  const { myName, companionName } = useUserNames();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchMeals() {
      setLoading(true);
      if (!usuarioId) return setMeals([]);
      // Traer todos los docs de meals cuyo id empieza con usuarioId_
      const allDocs = await getDocs(collection(db, 'meals'));
      // Filtrar solo los del usuario
      const userDocs = allDocs.docs.filter(doc => doc.id.startsWith(usuarioId + '_'));
      // Siempre mostrar 4 cards (desayuno, almuerzo, merienda, cena)
      const hoy = new Date().toISOString().slice(0, 10);
      const baseComidas = [
        { key: 'desayuno', titulo: 'Desayuno' },
        { key: 'almuerzo', titulo: 'Almuerzo' },
        { key: 'merienda', titulo: 'Merienda' },
        { key: 'cena', titulo: 'Cena' },
      ];
      // Buscar comidas guardadas para hoy
      let comidasGuardadas = {};
      userDocs.forEach(doc => {
        const data = doc.data();
        const fechaDoc = data.fecha || doc.id.split('_')[1] || '';
        if (fechaDoc === hoy) {
          baseComidas.forEach(({ key }) => {
            if (data[key] && (data[key].foto || data[key].puntuacion)) {
              comidasGuardadas[key] = {
                ...data[key],
                titulo: key.charAt(0).toUpperCase() + key.slice(1),
                fecha: fechaDoc,
              };
            }
          });
        }
      });
      // Armar array final de 4 comidas (si falta alguna, poner card vacía)
      const comidasHoy = baseComidas.map(({ key, titulo }) =>
        comidasGuardadas[key] || { titulo, vacia: true }
      );
      setMeals(comidasHoy);
      setLoading(false);
    }
    fetchMeals();
  }, [usuarioId]);
  if (loading) return <div>Cargando comidas...</div>;
  return (
    <div>
      {meals.length === 0 ? (
        <div className="text-center"></div>
      ) : (
        <ComidasSlider comidas={meals} readOnly />
      )}
    </div>
  );
}
