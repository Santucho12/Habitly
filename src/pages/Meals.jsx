

import React from 'react';
import Meals from '../components/Meals/Meals';
import { useFechaActual } from '../context/FechaContext';

export default function MealsPage() {
  const { fechaActual } = useFechaActual();
  const fecha = fechaActual.format('YYYY-MM-DD');
  return <Meals fecha={fecha} />;
}
