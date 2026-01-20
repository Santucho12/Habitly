import { useAuth } from '../App';
import { useEffect, useState } from 'react';
import { getHabitsByUser } from '../services/habitService';

export default function Dashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getHabitsByUser(user.uid)
        .then(setHabits)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>¡Bienvenido a tu panel de hábitos!</p>
      {user && (
        <div className="mt-4 mb-6">
          <span className="block">Usuario: <b>{user.email}</b></span>
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Tus hábitos
        </h2>
        {loading ? (
          <div className="animate-pulse text-gray-400">Cargando hábitos...</div>
        ) : habits.length === 0 ? (
          <div className="text-gray-400 italic">No tienes hábitos aún.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map(habit => (
              <li key={habit.id} className="bg-gradient-to-br from-green-800 to-gray-900 rounded-xl p-5 shadow-lg flex flex-col gap-2 border border-green-700 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" /></svg>
                  <span className="font-bold text-lg text-green-200">{habit.name}</span>
                </div>
                <div className="text-sm text-gray-200 mb-1">{habit.description}</div>
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                  Frecuencia: <span className="ml-1 font-semibold">{habit.frequency}</span>
                </div>
                {habit.days && habit.days.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {habit.days.map(day => (
                      <span key={day} className="bg-green-700 text-xs px-2 py-0.5 rounded-full text-white font-medium">{day}</span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
