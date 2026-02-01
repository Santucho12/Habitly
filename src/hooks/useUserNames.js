import { useEffect, useState } from 'react';
import { getCompanionData } from '../services/companion';
import { useAuth } from '../context/AuthContext';

// Hook para obtener el nombre del usuario y del compañero (si existe)
export function useUserNames() {
  const { user } = useAuth();
  const [myName, setMyName] = useState((user?.displayName || user?.nombre || 'Tú').toUpperCase());
  const [companionName, setCompanionName] = useState('COMPAÑERO');

  useEffect(() => {
    if (user) {
      setMyName((user.displayName || user.nombre || 'Tú').toUpperCase());
      if (user.companionId) {
        getCompanionData(user.uid).then(compa => {
          if (compa) {
            const name = compa.displayName || compa.nombre || compa.id || user.companionId || 'Compañero';
            setCompanionName((name).toUpperCase());
            console.log('[useUserNames] Compañero encontrado:', compa);
          } else {
            setCompanionName((user.companionId || 'Compañero').toUpperCase());
            console.warn('[useUserNames] Compañero no encontrado para UID:', user.companionId);
          }
        });
      } else {
        setCompanionName('COMPAÑERO');
      }
    }
  }, [user]);

  return { myName, companionName };
}
