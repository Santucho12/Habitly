import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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
        navigate('/login');
      }, 1200);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
        <div className="mb-4">
          <label className="block mb-1">Nombre</label>
          <input {...register('displayName')} className="w-full px-3 py-2 rounded text-black" />
          {errors.displayName && <p className="text-red-400 text-sm">{errors.displayName.message}</p>}
        </div>
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
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        {error && <div className="text-red-400 mt-2">{error}</div>}
        {success && <div className="text-green-400 mt-2">¡Registro exitoso!</div>}
      </form>
    </div>
  );
}
