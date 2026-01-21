import { useMemo } from 'react';
import HomeSummary from '../components/Home/HomeSummary';

const mensajes = [
  '¡Hoy es un gran día para mejorar tus hábitos! 💪',
  'Recuerda: cada pequeño paso cuenta. 🚶‍♂️',
  '¡Sigue así! La constancia es la clave del éxito. 🔑',
  'No te rindas, los resultados llegarán. 🌱',
  '¡Eres capaz de lograrlo! Confía en ti. ✨',
  'Hoy es una nueva oportunidad para avanzar. 🏃‍♀️',
  'Celebra cada logro, por pequeño que sea. 🏅',
  '¡Hazlo por ti! Tu bienestar es lo más importante. 💚',
  'La disciplina te acerca a tus metas. 🎯',
  '¡Sigue sumando hábitos positivos! 📈',
];

export default function Home() {
  // Mensaje motivacional diario (cambia cada día)
  const mensaje = useMemo(() => {
    const day = new Date().toISOString().slice(0, 10);
    // Hash simple para elegir mensaje según el día
    let sum = 0;
    for (let i = 0; i < day.length; i++) sum += day.charCodeAt(i);
    return mensajes[sum % mensajes.length];
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] fade-in">
      <HomeSummary />
      <div className="text-white text-2xl font-bold text-center mb-4">
        ¡Bienvenido a Habitly!
      </div>
      <div className="bg-blue-800/90 text-white rounded-xl shadow px-6 py-4 text-lg font-semibold max-w-xl text-center border border-blue-400 animate-pulse">
        {mensaje}
      </div>
      <div className="text-white text-base mt-8 opacity-80">Selecciona una opción en el menú para comenzar.</div>
    </div>
  );
}
