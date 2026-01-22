import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import AppLogo from '../assets/icons/AppLogo';

const schema = yup.object().shape({
  displayName: yup.string().required('Nombre es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña es requerida'),
});

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.displayName });
      // Guardar datos en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: userCredential.user.photoURL || '',
        compañeroId: '',
        rachaGimnasio: 0,
        rachaComidas: 0,
        rachaCorrer: 0,
        rachaCaminar: 0,
        diasPermitidos: [],
        puntosMes: 0,
        puntosDia: 0,
        pesoActual: null,
        fotoProgresoActual: '',
        notificaciones: true
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full min-w-[400px] mx-auto p-0">
        <div className="flex flex-col items-center mb-6">
          <AppLogo size={56} />
          <h2 className="text-3xl font-bold mt-2 mb-2 text-gray-900 dark:text-white">Registro</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl px-8 py-8 animate-fadein">
          <div className="mb-6 relative">
            <input
              {...register('displayName')}
              id="displayName"
              className={`peer w-full px-3 pt-6 pb-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 transition-all`}
              autoComplete="off"
            />
            <label htmlFor="displayName" className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:text-blue-600 peer-placeholder-shown:text-base peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-500 pointer-events-none bg-white dark:bg-gray-800 px-1">
              Nombre
            </label>
            {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>}
          </div>
          <div className="mb-6 relative">
            <input
              {...register('email')}
              id="email"
              className={`peer w-full px-3 pt-6 pb-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 transition-all`}
              autoComplete="off"
            />
            <label htmlFor="email" className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:text-blue-600 peer-placeholder-shown:text-base peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-500 pointer-events-none bg-white dark:bg-gray-800 px-1">
              Email
            </label>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-6 relative">
            <input
              type="password"
              {...register('password')}
              id="password"
              className={`peer w-full px-3 pt-6 pb-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 transition-all`}
              autoComplete="off"
            />
            <label htmlFor="password" className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:text-blue-600 peer-placeholder-shown:text-base peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-500 pointer-events-none bg-white dark:bg-gray-800 px-1">
              Contraseña
            </label>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md w-full shadow-md transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          {error && <div className="text-red-500 mt-3 text-center text-sm">{error}</div>}
          {success && <div className="text-green-500 mt-3 text-center text-sm">¡Registro exitoso!</div>}
        </form>
      </div>
    </div>
  );
}
