import React from 'react';
import { FaMedal, FaTrophy, FaStar } from 'react-icons/fa';

const achievements = [
  {
    icon: <FaMedal className="text-yellow-400 text-3xl" />,
    title: 'Primer Hábito',
    desc: '¡Completaste tu primer hábito!'
  },
  {
    icon: <FaTrophy className="text-orange-400 text-3xl" />,
    title: 'Racha de 7 días',
    desc: '¡Una semana completa de hábitos!'
  },
  {
    icon: <FaStar className="text-blue-400 text-3xl" />,
    title: 'Perfecto en comidas',
    desc: '¡Comidas saludables toda la semana!'
  },
  // Puedes agregar más logros aquí
];

export default function Achievements() {
  return (
    <div className="max-w-2xl mx-auto p-4 fade-in">
      <h1 className="text-3xl font-bold mb-4 text-center">Logros y Medallas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {achievements.map((ach, i) => (
          <div key={i} className="bg-white/90 rounded-xl shadow p-6 flex flex-col items-center gap-2 border border-gray-200">
            {ach.icon}
            <div className="font-semibold text-lg text-gray-900">{ach.title}</div>
            <div className="text-gray-600 text-sm text-center">{ach.desc}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-blue-700 font-medium">¡Sigue sumando hábitos y desbloquea más medallas!</p>
    </div>
  );
}
