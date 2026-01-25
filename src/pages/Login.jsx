

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().required('Contraseña es requerida'),
});


export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/comparativo');
    } catch (e) {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <img src="https://www.gstatic.com/images/branding/product/1x/avatar_square_blue_512dp.png" alt="Logo" className="w-12 h-12 mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-gray-900">Inicia sesión</h1>
        <p className="mb-6 text-gray-600 text-center text-sm">Accede con tu cuenta de Habitly. Esta cuenta estará disponible para otras funciones de la app.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 text-sm">Correo electrónico</label>
            <input type="email" autoComplete="email" placeholder="Correo electrónico" {...register('email')} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block mb-1 text-gray-700 text-sm">Contraseña</label>
            <input type="password" {...register('password')} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" />
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mt-2 text-lg" disabled={loading}>
            {loading ? 'Ingresando...' : 'Siguiente'}
          </button>
        </form>
        <div className="w-full flex flex-col items-center mt-6">
          <Link to="/register" className="text-blue-600 hover:underline text-sm">Crear cuenta</Link>
          <a href="#" className="text-blue-600 hover:underline text-xs mt-2">¿Has olvidado tu correo electrónico?</a>
          <a href="#" className="text-blue-600 hover:underline text-xs mt-1">¿Necesitas ayuda?</a>
        </div>
      </div>
    </div>
  );
}
