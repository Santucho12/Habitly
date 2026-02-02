import React from 'react';
import ChecklistComparativo from '../components/HomeComparativo/ChecklistComparativo';
import ComidasComparativo from '../components/HomeComparativo/ComidasComparativo';
import ProgresoComparativo from '../components/HomeComparativo/ProgresoComparativo';
import EstadisticasComparativo from '../components/HomeComparativo/EstadisticasComparativo';
import PuntosComparativo from '../components/HomeComparativo/PuntosComparativo';

import { useAuth } from '../context/AuthContext';

export default function HomeComparativoPage() {
  const { user } = useAuth();
  const companeroId = user?.companionId || null;
  // Si no hay compañero, igual renderiza la página (puedes mostrar un estado vacío en los componentes si lo deseas)

  // Loader para el checklist del compañero
  const [showCompaneroChecklist, setShowCompaneroChecklist] = React.useState(false);
  React.useEffect(() => {
    if (companeroId) setShowCompaneroChecklist(true);
  }, [companeroId]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-8 px-2 pt-[290px]">
      <div style={{ marginTop: '-300px', marginLeft: '-156px' }}>
        <PuntosComparativo usuarioId={user?.uid} companeroId={companeroId} />
      </div>
      {/* Nombres eliminados aquí, solo se muestran las tarjetas */}
      <div className="flex flex-row gap-0 justify-center items-start mb-8" style={{ marginLeft: '-4px', marginTop: '15px' }}>
        <div className="flex-1 flex justify-end p-0 m-0" style={{ marginLeft: '-19px' }}>
          <ChecklistComparativo usuarioType="yo" usuarioId={user?.uid} />
        </div>
        <div className="flex-1 flex justify-start p-0 m-0" style={{ marginLeft: '-123px' }}>
          {showCompaneroChecklist ? (
            <ChecklistComparativo usuarioType="companero" usuarioId={companeroId} />
          ) : (
            <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-2xl p-5 mb-8 shadow-xl min-w-[320px] min-h-[320px] flex items-center justify-center text-gray-400 animate-pulse">
              Cargando check-list del compañero...
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row gap-0 justify-center items-start" style={{ marginLeft: '1px', marginTop: '70px' }}>
        <div className="flex-1 flex justify-end p-0 m-0" style={{ marginLeft: '-33px', marginTop: '22px' }}>
          <ComidasComparativo usuarioType="yo" usuarioId={user?.uid} />
        </div>
        <div className="flex-1 flex justify-start p-0 m-0" style={{ marginLeft: '-125px', marginTop: '22px' }}>
          <ComidasComparativo usuarioType="companero" usuarioId={companeroId} />
        </div>
      </div>
      <div className="flex flex-row gap-0 justify-center items-start mt-8">
        <div style={{ marginLeft: '-54px', marginTop: '-55px' }}>
          <ProgresoComparativo 
            usuarioId={user?.uid}
            companeroId={companeroId}
          />
        </div>
      </div>
      <div className="flex flex-row gap-0 justify-center items-start mt-8">
        <div style={{ marginLeft: '-4px', marginTop: '-25px' }}>
          <EstadisticasComparativo
            usuario={user}
            companero={{ uid: companeroId }}
          />
        </div>
      </div>
    </div>
  );
}
