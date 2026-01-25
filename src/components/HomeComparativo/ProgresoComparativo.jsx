import { FaArrowDown } from 'react-icons/fa';

export default function ProgresoComparativo({ usuario, companero }) {
  return (
    <div className="flex items-center justify-center gap-8 mt-8">
      {/* Card Usuario */}
      <div className="rounded-2xl shadow-lg p-4 bg-cyan-600 flex flex-col items-center justify-center text-white w-56" style={{ transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-170px', marginLeft: '-60px' }}>
        <div className="mb-2 text-3xl">⚖️</div>
        <div className="font-bold text-lg mb-1">{usuario?.nombre || 'Tú'}</div>
        <div className="mb-2">
          <span className="text-sm">Peso actual:</span><br />
          <span className="font-semibold text-base">{usuario?.pesoActual ?? '-'}</span> <span className="text-xs">kg</span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm">Kilos bajados:</span>
          <FaArrowDown className="text-white text-xl" />
          <span className="font-semibold text-base">{usuario?.kilosBajados ?? '-'}</span> <span className="text-xs">kg</span>
        </div>
        <span className="text-xs text-gray-200 mt-1">{usuario?.mes || ''}</span>
      </div>
      {/* Card Compañero */}
      <div className="rounded-2xl shadow-lg p-4 bg-fuchsia-600 flex flex-col items-center justify-center text-white w-56" style={{ transform: 'scale(0.6)', transformOrigin: 'top left', marginTop: '-170px', marginLeft: '-70px' }}>
        <div className="mb-2 text-3xl">🏋️‍♂️</div>
        <div className="font-bold text-lg mb-1">{companero?.nombre || 'Compañero'}</div>
        <div className="mb-2">
          <span className="text-sm">Peso actual:</span><br />
          <span className="font-semibold text-base">{companero?.pesoActual ?? '-'}</span> <span className="text-xs">kg</span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm">Kilos bajados:</span>
          <FaArrowDown className="text-white text-xl" />
          <span className="font-semibold text-base">{companero?.kilosBajados ?? '-'}</span> <span className="text-xs">kg</span>
        </div>
        <span className="text-xs text-gray-200 mt-1">{companero?.mes || ''}</span>
      </div>
    </div>
  );
}

