import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().required('Contraseña es requerida'),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input {...register('email')} className="w-full px-3 py-2 rounded text-black" />
          {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block mb-1">Contraseña</label>
          <input type="password" {...register('password')} className="w-full px-3 py-2 rounded text-black" />
          {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
        </div>
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded w-full hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
        {error && <div className="text-red-400 mt-2">{error}</div>}
        {success && <div className="text-green-400 mt-2">¡Login exitoso!</div>}
      </form>
    </div>
  );
}
