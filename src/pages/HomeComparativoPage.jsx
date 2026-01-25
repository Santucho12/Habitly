import React from 'react';

import ChecklistComparativo from '../components/HomeComparativo/ChecklistComparativo';
import ComidasComparativo from '../components/HomeComparativo/ComidasComparativo';
import ProgresoComparativo from '../components/HomeComparativo/ProgresoComparativo';
import EstadisticasComparativo from '../components/HomeComparativo/EstadisticasComparativo';

import { useAuth } from '../App';

export default function HomeComparativoPage() {
  const { user } = useAuth();
  // Aquí deberías obtener el id del compañero desde tu lógica (servicio, contexto, etc)
  // Ejemplo: const companeroId = ...
  const companeroId = 'COMPANERO_ID_AQUI'; // Reemplaza por el id real
  return (
    <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-8 px-2">
      <div className="flex flex-row gap-0 justify-center items-start mb-8">
        <div className="flex-1 flex justify-end p-0 m-0">
          <ChecklistComparativo usuarioType="yo" usuarioId={user?.uid} />
        </div>
        <div className="flex-1 flex justify-start p-0 m-0" style={{ marginLeft: '-130px' }}>
          <ChecklistComparativo usuarioType="companero" usuarioId={companeroId} />
        </div>
      </div>
      <div className="flex flex-row gap-0 justify-center items-start">
        <div className="flex-1 flex justify-end p-0 m-0">
          <ComidasComparativo usuarioType="yo" usuarioId={user?.uid} />
        </div>
        <div className="flex-1 flex justify-start p-0 m-0" style={{ marginLeft: '-130px' }}>
          <ComidasComparativo usuarioType="companero" usuarioId={companeroId} />
        </div>
      </div>
      <div className="flex flex-row gap-0 justify-center items-start mt-8">
        <ProgresoComparativo 
          usuario={{ nombre: 'Tú', pesoActual: 72, kilosBajados: 3.5, mes: 'Enero' }}
          companero={{ nombre: 'Compañero', pesoActual: 80, kilosBajados: 2.0, mes: 'Enero' }}
        />
      </div>
      <div className="flex flex-row gap-0 justify-center items-start mt-8">
        <EstadisticasComparativo
          usuario={{ nombre: 'Tú', habitosCumplidos: 15, puntos: 1200 }}
          companero={{ nombre: 'Compañero', habitosCumplidos: 12, puntos: 950 }}
        />
      </div>
    </div>
  );
}
