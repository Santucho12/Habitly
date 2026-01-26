import React, { useState } from 'react';

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
  return (
    <div className="w-full flex flex-col items-center justify-center"
    style={{ transform: 'scale(0.62)', transformOrigin: 'top left', marginTop: '-250px', marginRight: '40px' }}>
      <div className="relative w-72 h-80 flex items-center justify-center">
            {(
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-900"
            onClick={handlePrev}
            aria-label="Anterior"
          >
            &#8592;
          </button>
            )}
        <div
          className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-2xl p-4 shadow-xl w-64 h-72 flex flex-col items-center justify-center"
             
        >
          <img
            src={comida.foto}
            alt={comida.titulo}
            className="w-40 h-40 object-cover rounded-xl mb-4 border-4 border-gray-900"
          />
          <h3 className="text-xl font-bold text-white mb-2 text-center drop-shadow">{comida.titulo}</h3>
          <span className={`text-white text-base font-semibold px-4 py-2 rounded-full shadow ${puntuacionColor[comida.puntuacion]}`}>
            {comida.puntuacion === 'buena' ? 'Buena 👍' : comida.puntuacion === 'masomenos' ? 'Más o menos 😐' : 'Mala 👎'}
          </span>
        </div>
            {(
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-900"
            onClick={handleNext}
            aria-label="Siguiente"
          >
            &#8594;
          </button>
            )}
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
  // Aquí deberías obtener las comidas reales según usuarioId y usuarioType
  // Por ahora, usamos datos de ejemplo
  return (
    <ComidasSlider comidas={comidasDelDiaEjemplo} readOnly={usuarioType !== 'yo'} />
  );
}
