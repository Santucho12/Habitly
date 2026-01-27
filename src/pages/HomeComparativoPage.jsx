import React from 'react';


import ChecklistComparativo from '../components/HomeComparativo/ChecklistComparativo';
import ComidasComparativo from '../components/HomeComparativo/ComidasComparativo';
import ProgresoComparativo from '../components/HomeComparativo/ProgresoComparativo';
import EstadisticasComparativo from '../components/HomeComparativo/EstadisticasComparativo';
import PuntosComparativo from '../components/HomeComparativo/PuntosComparativo';

import { useAuth } from '../App';

export default function HomeComparativoPage() {
  const { user } = useAuth();
  // Aquí deberías obtener el id del compañero desde tu lógica (servicio, contexto, etc)
  // Ejemplo: const companeroId = ...
  const companeroId = 'COMPANERO_ID_AQUI'; // Reemplaza por el id real
  return (
    <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-8 px-2 pt-[78px]">
      <div style={{ marginTop: '-230px', marginLeft: '-165px' }}>
        <PuntosComparativo usuarioId={user?.uid} companeroId={companeroId} />
      </div>
      <div className="flex flex-row gap-0 justify-center items-start mb-8" style={{ marginLeft: '-4px', marginTop: '15px' }}>
        <div className="flex-1 flex justify-end p-0 m-0" style={{ marginLeft: '-24px' }}>
          <ChecklistComparativo usuarioType="yo" usuarioId={user?.uid} />
        </div>
        <div className="flex-1 flex justify-start p-0 m-0" style={{ marginLeft: '-119px' }}>
          <ChecklistComparativo usuarioType="companero" usuarioId={companeroId} />
        </div>
      </div>
      <div className="flex flex-row gap-0 justify-center items-start" style={{ marginLeft: '1px' }}>
        <div className="flex-1 flex justify-end p-0 m-0" style={{ marginLeft: '-20px', marginTop: '22px' }}>
          <ComidasComparativo usuarioType="yo" usuarioId={user?.uid} />
        </div>
        <div className="flex-1 flex justify-start p-0 m-0" style={{ marginLeft: '-125px', marginTop: '22px' }}>
          <ComidasComparativo usuarioType="companero" usuarioId={companeroId} />
        </div>
      </div>
      <div className="flex flex-row gap-0 justify-center items-start mt-8">
        <div style={{ marginLeft: '-64px', marginTop: '-55px' }}>
          <ProgresoComparativo 
            usuario={{ nombre: 'Tú', pesoActual: 72, kilosBajados: 3.5, mes: 'Enero' }}
            companero={{ nombre: 'Compañero', pesoActual: 80, kilosBajados: 2.0, mes: 'Enero' }}
          />
        </div>
      </div>
      <div className="flex flex-row gap-0 justify-center items-start mt-8">
        <div style={{ marginLeft: '-7px', marginTop: '-25px' }}>
          <EstadisticasComparativo
            usuario={{ nombre: 'Tú', habitosCumplidos: 15, puntos: 1200 }}
            companero={{ nombre: 'Compañero', habitosCumplidos: 12, puntos: 950 }}
          />
        </div>
      </div>
    </div>
  );
}
