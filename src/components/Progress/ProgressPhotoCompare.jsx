import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.96)' }} onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl shadow-2xl relative flex flex-col items-center"
        style={{
          padding: '1.2rem',
          maxWidth: '95vw',
          maxHeight: '90vh',
          minWidth: 0,
          minHeight: 0,
          boxSizing: 'border-box',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-2 right-2 text-white text-2xl" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>,
    document.body
  );
}
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

export default function ProgressPhotoCompare() {
  const user = getAuth().currentUser;
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [months, setMonths] = useState([]); // lista de meses a mostrar
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [pesoInput, setPesoInput] = useState('');
  const [fotoInput, setFotoInput] = useState(null);
  const [previewFoto, setPreviewFoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const q = query(collection(db, 'progress'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => doc.data());
      // Ordenar por mes ascendente
      data.sort((a, b) => (a.mes > b.mes ? 1 : -1));
      setProgress(data);
      // Mostrar todos los meses desde enero 2025 hasta diciembre 2028
      let monthsArr = [];
      let start = dayjs('2025-01-01');
      let end = dayjs('2028-12-01');
      let m = start;
      while (m.isBefore(end) || m.isSame(end, 'month')) {
        monthsArr.push(m.format('YYYY-MM'));
        m = m.add(1, 'month');
      }
      // Por defecto, mostrar el mes actual
      setMonths(monthsArr);
      const idx = monthsArr.findIndex(val => val === dayjs().format('YYYY-MM'));
      setIndex(idx !== -1 ? idx : 0);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div>Cargando fotos...</div>;

  // Navegación circular entre todos los meses
  const prev = () => setIndex(i => months.length === 0 ? 0 : (i - 1 + months.length) % months.length);
  const next = () => setIndex(i => months.length === 0 ? 0 : (i + 1) % months.length);

  // Buscar datos del mes actual del carrusel
  let currentMonth = months[index];
  let progressData = progress.find(p => p.mes === currentMonth);

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-bold mb-2">Historial de progreso</h3>
      <div className="flex gap-4 items-center justify-center">
        <button onClick={prev} disabled={months.length === 0} className="px-2 py-1 bg-gray-700 rounded text-white disabled:opacity-50">◀</button>
        <div className="flex flex-col items-center">
          {months.length > 0 ? (
            <>
              {progressData && progressData.foto ? (
                <>
                  <img
                    src={progressData.foto}
                    alt={`Foto ${currentMonth}`}
                    className="w-96 h-96 object-cover rounded-xl shadow-lg border-2 border-blue-400 cursor-zoom-in"
                    onClick={() => { setShowModal(true); setModalIndex(index); }}
                  />
                  <Modal open={showModal} onClose={() => setShowModal(false)}>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setModalIndex(i => (i - 1 + months.length) % months.length)}
                        className="flex items-center justify-center w-10 h-10 bg-blue-700 bg-opacity-80 hover:bg-blue-800 rounded-full text-white text-2xl font-bold shadow-lg mx-2 z-10"
                        aria-label="Anterior"
                        style={{ alignSelf: 'center' }}
                      >◀</button>
                      <img
                        src={progress.find(p => p.mes === months[modalIndex])?.foto}
                        alt={`Foto ${months[modalIndex]}`}
                        className="object-contain rounded-xl border-2 border-blue-400 bg-black"
                        style={{ maxWidth: '70vw', maxHeight: '70vh', minWidth: 120, minHeight: 120 }}
                      />
                      <button
                        onClick={() => setModalIndex(i => (i + 1) % months.length)}
                        className="flex items-center justify-center w-10 h-10 bg-blue-700 bg-opacity-80 hover:bg-blue-800 rounded-full text-white text-2xl font-bold shadow-lg mx-2 z-10"
                        aria-label="Siguiente"
                        style={{ alignSelf: 'center' }}
                      >▶</button>
                    </div>
                    <div className="text-center text-lg mt-2 font-bold text-blue-300">
                      {dayjs(months[modalIndex]).locale('es').format('MMMM YYYY')}
                    </div>
                  </Modal>
                </>
              ) : (
                <>
                  {showForm ? (
                    <form className="w-56 h-80 flex flex-col items-center justify-center bg-gray-700 rounded-xl border-2 border-dashed border-blue-400 text-gray-400 text-center gap-2 px-2"
                      onSubmit={async e => {
                        e.preventDefault();
                        if (currentMonth !== dayjs().format('YYYY-MM')) return;
                        setError('');
                        if (!pesoInput || isNaN(Number(pesoInput))) {
                          setError('Ingresa un peso válido.');
                          return;
                        }
                        if (!fotoInput) {
                          setError('Selecciona una foto.');
                          return;
                        }
                        setSaving(true);
                        try {
                          // Subir foto a Cloudinary
                          const uploadResult = await import('../../services/cloudinary').then(mod => mod.uploadImageToCloudinary(fotoInput));
                          if (!uploadResult.secure_url) throw new Error('Error al subir la foto');
                          // Guardar en Firestore
                          await import('../../services/progress').then(mod => mod.saveMonthlyProgress(user.uid, currentMonth, { peso: Number(pesoInput), foto: uploadResult.secure_url }));
                          setShowForm(false);
                          setPesoInput('');
                          setFotoInput(null);
                          setPreviewFoto('');
                          setError('');
                          // Refrescar datos
                          const q = query(collection(db, 'progress'), where('userId', '==', user.uid));
                          const snap = await getDocs(q);
                          const data = snap.docs.map(doc => doc.data());
                          data.sort((a, b) => (a.mes > b.mes ? 1 : -1));
                          setProgress(data);
                        } catch (err) {
                          setError('Error al guardar: ' + (err.message || err.toString()));
                        } finally {
                          setSaving(false);
                        }
                      }}>
                      <input
                        type="number"
                        step="0.1"
                        value={pesoInput}
                        onChange={e => setPesoInput(e.target.value)}
                        className="rounded px-2 py-1 text-black w-full mb-1"
                        placeholder="Peso (kg)"
                        disabled={saving || currentMonth !== dayjs().format('YYYY-MM')}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          setFotoInput(file);
                          if (file && file.type && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onloadend = ev => setPreviewFoto(ev.target.result);
                            reader.readAsDataURL(file);
                          } else {
                            setPreviewFoto('');
                          }
                        }}
                        className="w-full mb-1"
                        disabled={saving || currentMonth !== dayjs().format('YYYY-MM')}
                      />
                      {previewFoto && (
                        <img src={previewFoto} alt="Preview" className="w-32 h-32 object-cover rounded mb-1 mx-auto" />
                      )}
                      <button type="submit" className="bg-blue-600 text-white rounded px-2 py-1 mt-1 font-bold text-sm hover:bg-blue-700 disabled:bg-gray-500 transition w-full" disabled={saving || currentMonth !== dayjs().format('YYYY-MM')}>
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button type="button" className="text-xs text-gray-300 mt-1 underline" onClick={() => { setShowForm(false); setError(''); }} disabled={saving}>
                        Cancelar
                      </button>
                      {currentMonth !== dayjs().format('YYYY-MM') && (
                        <div className="text-xs text-yellow-400 font-semibold mt-1 text-center">
                          {(() => {
                            const meses = [
                              'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                              'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                            ];
                            const mesNum = Number(currentMonth.split('-')[1]) - 1;
                            const mesEs = meses[mesNum] || '';
                            return `No está habilitado hasta que sea ${mesEs}`;
                          })()}
                        </div>
                      )}
                      {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
                    </form>
                  ) : (
                    <div className="w-56 h-80 flex flex-col items-center justify-center bg-gray-700 rounded-xl border-2 border-dashed border-blue-400 text-gray-400 text-center gap-2">
                      <span>Sin foto de progreso</span>
                      <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700" onClick={() => setShowForm(true)}>
                        Agregar foto y peso
                      </button>
                    </div>
                  )}
                </>
              )}
              <div className="text-center text-sm mt-1 font-bold text-blue-300">{dayjs(currentMonth).locale('es').format('MMMM YYYY')}</div>
              <div className="text-center text-sm mt-1 text-gray-200">
                {progressData && progressData.peso ? (
                  <>Peso: <span className="font-bold">{progressData.peso} kg</span></>
                ) : (
                  <span className="italic text-gray-400">Sin peso registrado</span>
                )}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-center">No hay meses para mostrar.</div>
          )}
        </div>
        <button onClick={next} disabled={months.length === 0} className="px-2 py-1 bg-gray-700 rounded text-white disabled:opacity-50">▶</button>
      </div>
    </div>
  );
}
