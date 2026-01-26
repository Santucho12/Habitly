import { FaArrowDown } from 'react-icons/fa';

export default function ProgresoComparativo({ usuario, companero }) {
  return (
    <div className="flex items-center justify-center gap-8 mt-8">
      {/* Card Usuario */}
        <div className="rounded-3xl border-4 border-blue-900 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 shadow-2xl p-6 flex flex-col items-center justify-center text-white w-64" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)', transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-120px' }}>
          <div className="mb-3 text-5xl drop-shadow-lg">⚖️</div>
          <div className="font-extrabold text-2xl mb-2 tracking-wide uppercase drop-shadow">{usuario?.nombre || 'Tú'}</div>
          <div className="mb-3">
            <span className="text-base font-semibold text-cyan-100">Peso actual:</span><br />
            <span className="flex justify-center items-center">
              <span className="font-bold text-2xl text-white drop-shadow">{usuario?.pesoActual ?? '-'}</span>
              <span className="text-base ml-2">kg</span>
            </span>
          </div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-cyan-100">Kilos bajados:</span>
            <FaArrowDown className="text-cyan-200 text-lg" />
            <span className="font-bold text-lg text-white drop-shadow">{usuario?.kilosBajados ?? '-'}</span> <span className="text-xs">kg</span>
          </div>
          <span className="text-lg text-cyan-100 mt-2 font-bold">{usuario?.mes || ''}</span>
        </div>
      {/* Card Compañero */}
        <div className="rounded-3xl border-4 border-pink-900 bg-gradient-to-br from-gray-900 via-pink-900 to-gray-800 shadow-2xl p-6 flex flex-col items-center justify-center text-white w-64" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)', transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-120px', marginLeft: '-86px' }}>
          <div className="mb-3 text-5xl drop-shadow-lg">🏋️‍♂️</div>
          <div className="font-extrabold text-2xl mb-2 tracking-wide uppercase drop-shadow">{companero?.nombre || 'Compañero'}</div>
          <div className="mb-3">
            <span className="text-base font-semibold text-pink-100">Peso actual:</span><br />
            <span className="flex justify-center items-center">
              <span className="font-bold text-2xl text-white drop-shadow">{companero?.pesoActual ?? '-'}</span>
              <span className="text-base ml-2">kg</span>
            </span>
          </div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-pink-100">Kilos bajados:</span>
            <FaArrowDown className="text-pink-200 text-lg" />
            <span className="font-bold text-lg text-white drop-shadow">{companero?.kilosBajados ?? '-'}</span> <span className="text-xs">kg</span>
          </div>
          <span className="text-lg text-pink-100 mt-2 font-bold">{companero?.mes || ''}</span>
        </div>
    </div>
  );
}

