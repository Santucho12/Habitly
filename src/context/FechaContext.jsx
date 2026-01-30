import React, { createContext, useContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';

// Contexto global para la fecha actual de la app
const FechaContext = createContext();

export function FechaProvider({ children }) {
  // Inicializa con la fecha real del sistema
  const [fechaActual, setFechaActual] = useState(dayjs());

  // Actualiza automáticamente la fecha a medianoche
  useEffect(() => {
    const updateFecha = () => setFechaActual(dayjs());
    // Calcula ms hasta la próxima medianoche
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1) - now;
    const timeout = setTimeout(() => {
      updateFecha();
      setInterval(updateFecha, 24 * 60 * 60 * 1000); // Cada 24h
    }, msToMidnight);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <FechaContext.Provider value={{ fechaActual }}>
      {children}
    </FechaContext.Provider>
  );
}

export function useFechaActual() {
  return useContext(FechaContext);
}
