import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateCompanionCode, findUserByCode, pairUsers, hasCompanion } from '../../services/companion';
import QRCode from 'react-qr-code';

export default function CompanionPairing() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(false);

  const myCode = user ? generateCompanionCode(user) : '';

  const handlePair = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      if (!code || code === user.uid) {
        setStatus('Código inválido.');
        return;
      }
      // Validación estricta: no permitir si ya tiene compañero
      if (await hasCompanion(user.uid)) {
        setStatus('Ya tienes un compañero asignado. No puedes cambiarlo.');
        return;
      }
      // Busca usuario por código
      const found = await findUserByCode(code);
      if (!found) {
        setStatus('No se encontró usuario con ese código.');
        return;
      }
      if (await hasCompanion(found.id)) {
        setStatus('El usuario ya tiene compañero.');
        return;
      }
      // Empareja ambos
      await pairUsers(user.uid, found.id);
      setCompanion(found);
      setStatus('¡Emparejamiento exitoso!');
    } finally {
      setLoading(false);
    }
  };

  // Si ya tiene compañero, bloquear UI
  if (user && companion) {
    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Compañero asignado</h2>
        <div className="mt-4 p-2 bg-green-100 rounded">
          <div>Compañero: <b>{companion.displayName || companion.email}</b></div>
        </div>
        <div className="mt-2 text-sm text-gray-600">No puedes cambiar de compañero una vez emparejado.</div>
      </div>
    );
  }
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Emparejamiento con compañero</h2>
      <form onSubmit={handlePair} className="mb-2">
        <label className="block text-sm font-medium">Código de tu compañero:</label>
        <input
          type="text"
          className="border p-2 rounded w-full mb-2"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Pega aquí el código de tu compañero"
          disabled={loading}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full" disabled={loading}>Emparejar</button>
      </form>
      {loading && <div className="text-center text-sm mt-2 text-gray-500">Procesando...</div>}
      {status && <div className="text-center text-sm mt-2 text-blue-700">{status}</div>}
    </div>
  );
}
