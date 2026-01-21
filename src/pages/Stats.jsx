import React, { useState } from 'react';
import Stats from '../components/Stats/Stats';
import StreaksAndPoints from '../components/Stats/StreaksAndPoints';
import dayjs from 'dayjs';

export default function StatsPage() {
  const now = dayjs();
  const [month, setMonth] = useState(now.format('MM'));
  const [year, setYear] = useState(now.format('YYYY'));

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-blue-300 mb-4 text-center">Estadísticas y calendario</h2>
      <div className="flex justify-center gap-2 mb-4">
        <select value={month} onChange={e => setMonth(e.target.value)} className="bg-gray-700 text-white rounded px-2 py-1">
          {[...Array(12)].map((_, i) => (
            <option key={i+1} value={String(i+1).padStart(2,'0')}>{dayjs().month(i).format('MMMM')}</option>
          ))}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} className="bg-gray-700 text-white rounded px-2 py-1">
          {[now.year(), now.year()-1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <StreaksAndPoints month={month} year={year} />
      <Stats month={month} year={year} />
    </div>
  );
}
