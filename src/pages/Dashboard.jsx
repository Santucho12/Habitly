import RankingMes from '../components/Ranking/RankingMes';
import ComparacionCompanero from '../components/Ranking/ComparacionCompanero';
import { useAuth } from '../App';
import { useEffect, useState } from 'react';
import { getHabitsByUser, addHabit } from '../services/habitService';
import CompanionPairing from '../components/Companion/CompanionPairing';
import { hasCompanion } from '../services/companion';
import Checklist from '../components/Checklist/Checklist';
import Meals from '../components/Meals/Meals';
import MealsRacha from '../components/Meals/MealsRacha';
import Calendar from '../components/Calendar/Calendar';
import Stats from '../components/Stats/Stats';
import StreaksAndPoints from '../components/Stats/StreaksAndPoints';
import ProgressForm from '../components/Progress/ProgressForm';
import ProgressChart from '../components/Progress/ProgressChart';
import ProgressPhotoCompare from '../components/Progress/ProgressPhotoCompare';
import dayjs from 'dayjs';


export default function Dashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    type: 'correr',
    cantidadDias: 1,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [companionChecked, setCompanionChecked] = useState(false);
  const [hasComp, setHasComp] = useState(false);

  // Eliminado weekDays, ya no se usa

  useEffect(() => {
    if (user) {
      getHabitsByUser(user.uid)
        .then(setHabits)
        .finally(() => setLoading(false));
      hasCompanion(user.uid).then((res) => {
        setHasComp(res);
        setCompanionChecked(true);
      });
    }
  }, [user]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'cantidadDias' ? Number(value) : value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    if (form.cantidadDias < 1 || form.cantidadDias > 7) {
      setFormError('La cantidad de días debe ser entre 1 y 7');
      return;
    }
    setFormLoading(true);
    try {
      await addHabit({
        name: form.name,
        type: form.type,
        cantidadDias: form.cantidadDias,
        owner: user.uid,
        createdAt: new Date(),
      });
      setForm({ name: '', type: 'correr', cantidadDias: 1 });
      // Refrescar hábitos
      const updated = await getHabitsByUser(user.uid);
      setHabits(updated);
    } catch (err) {
      setFormError('Error al guardar el hábito');
    } finally {
      setFormLoading(false);
    }
  };

  if (!companionChecked) {
    return <div className="p-8">Cargando...</div>;
  }
  if (!hasComp) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>¡Bienvenido a tu panel de hábitos!</p>
        <CompanionPairing />
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gray-900">
      <div className="w-[400px] min-h-screen bg-gray-900 p-4 flex flex-col justify-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>¡Bienvenido a tu panel de hábitos!</p>
        {user && (
          <div className="mt-4 mb-6">
            <span className="block">Usuario: <b>{user.email}</b></span>
          </div>
        )}
        {/* Check-list diaria de actividades */}
        <Checklist />
        <Meals fecha={dayjs().format('YYYY-MM-DD')} />
        <MealsRacha month={dayjs().format('MM')} year={dayjs().format('YYYY')} />
        <ProgressForm mes={dayjs().format('YYYY-MM')} />
        <ProgressChart />
        <ProgressPhotoCompare />
        {/* Visualización de calendario y estadísticas */}
        <Calendar month={dayjs().format('MM')} year={dayjs().format('YYYY')} />
        <Stats month={dayjs().format('MM')} year={dayjs().format('YYYY')} />
        <StreaksAndPoints />
        <RankingMes />
        <ComparacionCompanero />
        {/* Formulario para crear hábito físico */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Agregar hábito físico</h3>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-white mb-1">Nombre del hábito</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded text-black"
                placeholder="Ej: Salir a correr"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
                className="w-full px-3 py-2 rounded text-black"
              >
                <option value="correr">Correr</option>
                <option value="caminar">Caminar</option>
                <option value="gym">Gimnasio</option>
              </select>
            </div>
            <div>
              <label className="block text-white mb-1">Días por semana</label>
              <div className="flex flex-wrap gap-2">
                {[1,2,3,4,5,6,7].map((num) => (
                  <label key={num} className="flex items-center gap-1 text-white text-sm">
                    <input
                      type="radio"
                      name="cantidadDias"
                      value={num}
                      checked={form.cantidadDias === num}
                      onChange={handleFormChange}
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>
            {formError && <div className="text-red-400 text-sm">{formError}</div>}
            <button
              type="submit"
              className="bg-green-600 px-4 py-2 rounded w-full hover:bg-green-700 disabled:opacity-50 text-white font-semibold"
              disabled={formLoading}
            >
              {formLoading ? 'Guardando...' : 'Agregar hábito'}
            </button>
          </form>
        </div>
        {/* Lista de hábitos */}
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
                  <div className="text-sm text-gray-200 mb-1 capitalize">Tipo: {habit.type}</div>
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                    Días por semana: <span className="ml-1 font-semibold">{habit.cantidadDias}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
