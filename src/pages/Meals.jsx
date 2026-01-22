
import React from 'react';
import Meals from '../components/Meals/Meals';
import dayjs from 'dayjs';

export default function MealsPage() {
  const fecha = dayjs().format('YYYY-MM-DD');
  return <Meals fecha={fecha} />;
}
