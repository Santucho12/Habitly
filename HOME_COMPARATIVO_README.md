# Guía Detallada para Implementar el Home Comparativo

## Objetivo
Crear una pantalla Home que muestre un resumen comparativo de los datos principales (Checklist, Comidas, Progreso, Estadísticas) entre el usuario y su compañero, de forma visual, clara y atractiva.

---

## 1. Estructura General
- **Dos columnas:**
  - Izquierda: datos del usuario actual.
  - Derecha: datos del compañero.
- **Secciones:**
  - Checklist
  - Comidas
  - Progreso
  - Estadísticas
- **Diseño:**
  - Tarjetas o bloques para cada sección.
  - Avatares/íconos de cada usuario.
  - Colores diferenciados (ej: azul y rosa).
  - Tooltips y textos explicativos.
  - Animaciones sutiles para logros o acciones destacadas.

---

## 2. Checklist
- **Puntos totales** de cada uno.
- **Estado de tareas diarias** (ej: gimnasio, correr, caminar) con check/tildes para ambos.
- **Mini resumen semanal:** cantidad de tareas completadas por cada uno.
- **Streak (racha de días cumplidos)** de cada uno.

### UI Sugerida
- Lista de tareas con dos columnas de checks.
- Barra de progreso semanal.
- Indicador de racha (fuego, medalla, etc).

---

## 3. Comidas
- **Última comida registrada** por cada uno (tipo y hora).
- **Calificación** de la comida (bien, más o menos, mal) con color/emoji.
- **Puntos obtenidos** por la comida.
- **Cantidad de comidas saludables** en la semana.

### UI Sugerida
- Tarjeta con nombre, tipo, puntaje y emoji.
- Barra o contador de comidas saludables.

---

## 4. Progreso
- **Peso actual** de cada uno (última medición).
- **Cambio de peso** respecto a la semana anterior (flecha arriba/abajo).

### UI Sugerida
- Tarjeta con peso y flecha de tendencia.
- Color verde/rojo según progreso.

---

## 5. Estadísticas
- **Puntaje global** de cada uno.
- **Ranking mensual** o posición respecto a otros usuarios.
- **Cantidad de hábitos cumplidos** en el mes.

### UI Sugerida
- Tarjeta con puntaje y ranking.
- Barra de hábitos cumplidos.

---

## 6. Experiencia y Detalles Visuales
- **Animaciones:** confeti, sonido, o highlight cuando el compañero complete una tarea.
- **Mensajes motivacionales** o de competencia sana.
- **Botón de felicitación rápida** ("¡Bien hecho!").
- **No permitir editar datos del compañero.**

---

## 7. Lógica de Datos
- Obtener datos del usuario y del compañero desde los servicios existentes (`services/`).
- Unificar la estructura de datos para renderizar ambos lados de cada sección.
- Manejar estados de carga y errores para cada bloque.
- No duplicar lógica: reutilizar hooks y servicios existentes.

---

## 8. Componentización
- Crear componentes reutilizables para tarjetas comparativas.
- Separar lógica de obtención de datos y presentación.
- Usar `props` para pasar datos de usuario y compañero a cada tarjeta.

---

## 9. Accesibilidad y Responsividad
- Asegurar contraste de colores y legibilidad.
- Adaptar el diseño a dispositivos móviles (columnas apiladas).
- Agregar descripciones para lectores de pantalla.

---

## 10. Ejemplo de Estructura de Componentes

```
HomeComparativo
├── ChecklistComparativo
├── ComidasComparativo
├── ProgresoComparativo
├── EstadisticasComparativo
```
Cada uno recibe `{ usuario, companero }` como props.

---

## 11. Buenas Prácticas
- Mantener el código limpio y comentado.
- Usar Tailwind para estilos consistentes y modernos.
- Validar datos antes de renderizar.
- Probar en distintos dispositivos y resoluciones.

---

## 12. Sugerencias Extra (para destacar la experiencia)
- Mostrar streak de días cumplidos.
- Mostrar cantidad de comidas saludables en la semana.
- Mostrar cambio de peso semanal.
- Mostrar ranking mensual y hábitos cumplidos.
- Usar tarjetas con avatares y colores diferenciados.
- Agregar tooltips y textos explicativos.
- Animaciones al completar tareas.
- Mensajes motivacionales y botón de felicitación.

---

## 13. Referencias
- Revisar los servicios en `src/services/` para obtener datos.
- Usar componentes de `src/components/` como base para nuevas tarjetas.
- Consultar `src/pages/Home.jsx` para integrar el nuevo HomeComparativo.

---

> Sigue esta guía paso a paso para asegurar una implementación robusta, visualmente atractiva y sin errores.
