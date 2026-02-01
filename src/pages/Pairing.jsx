// Página para vincular usuarios mediante QR/código
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { linkUsers } from '../services/userPairing';
import { QRCodeCanvas } from 'qrcode.react';

export default function Pairing() {
  const { user } = useAuth();
  const [inputUid, setInputUid] = useState('');
  const [pairId, setPairId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generar QR con el UID propio
  const qrValue = user?.uid || '';

  // Vincular con otro usuario
  const handlePair = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!inputUid || !user?.uid) throw new Error('UID inválido');
      const newPairId = await linkUsers(user.uid, inputUid);
      setPairId(newPairId);
      setSuccess('¡Vinculación exitosa!');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 pt-3 pb-6 bg-white rounded shadow w-fit mx-auto" style={{ minHeight: 420 }}>
      <h2 className="text-xl font-bold mb-4">Vincular con otro usuario</h2>
      <div className="mb-6 flex flex-col items-center justify-center">
        <p className="mb-2">Tu código QR (compártelo con tu compañero):</p>
        <div className="flex items-center justify-center w-full">
          {qrValue && <QRCodeCanvas value={qrValue} size={128} />}
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center w-full break-all">UID: {qrValue}</p>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">UID del compañero</label>
        <input
          type="text"
          className="border px-2 py-1 w-full rounded"
          value={inputUid}
          onChange={e => setInputUid(e.target.value)}
          placeholder="Pega el UID o escanea QR"
        />
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handlePair}
        disabled={loading}
      >
        Vincular
      </button>
      {loading && <p className="mt-2 text-blue-600">Procesando...</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {success && <p className="mt-2 text-green-600">{success}</p>}
      {pairId && (
        <div className="mt-4 p-2 bg-green-100 rounded">
          <p>Pareja creada. ID: <span className="font-mono">{pairId}</span></p>
        </div>
      )}
    </div>
  );
}
