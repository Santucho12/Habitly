
import React from 'react';
import Checklist from '../components/Checklist/Checklist';
import { useFechaActual } from '../context/FechaContext';

export default function ChecklistPage() {
  const { fechaActual } = useFechaActual();
  const fecha = fechaActual.format('YYYY-MM-DD');
  return (
    <div className="w-full max-w-full sm:max-w-md mx-auto mt-4 sm:mt-8 px-2">
      <Checklist fecha={fecha} />
    </div>
  );
}
