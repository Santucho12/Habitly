# 📐 Rediseño Arquitectónico: Usuarios Vinculados en Parejas (Habitly)

---

## 1. Análisis del Sistema Actual

- **Modelo actual:**  
  - Cada usuario tiene su propio documento en la colección `users`.
  - Datos individuales: hábitos, comidas, progreso, métricas.
  - No existe relación entre usuarios.
  - Acceso y escritura: solo el usuario propietario.

---

## 2. Propuesta de Rediseño Arquitectónico

### 2.1. Nuevas Entidades y Estructuras

#### 2.1.1. Entidad Relación de Pareja

- **Colección:** `pairs`
- **Documento:**  
  - `pairId` (autogenerado, único)
  - `userAId` (uid Firebase)
  - `userBId` (uid Firebase)
  - `createdAt`
  - `active: true|false`
  - `sharedStatsEnabled: true|false`
  - `breakReason` (opcional, si se desvincula)

#### 2.1.2. Cambios en Usuarios

- **Campo nuevo en `users`:**
  - `pairId` (null si no está vinculado)
  - `companionId` (uid del compañero, null si no está vinculado)

#### 2.1.3. Datos Individuales

- **Colecciones:**  
  - `habits` (por usuario, campo `ownerId`)
  - `meals` (por usuario, campo `ownerId`)
  - `progress` (por usuario, campo `ownerId`)
  - `stats` (por usuario, campo `ownerId`)
- **Regla:**  
  - Cada documento tiene `ownerId` = uid del usuario propietario.

---

### 2.2. Relaciones y Acceso

- **Vinculación:**  
  - Solo dos usuarios por relación.
  - Relación bidireccional y exclusiva.
  - Cada usuario puede leer datos del compañero SOLO si existe la relación y está activa.
  - Nadie puede escribir datos del otro.

- **Aislamiento:**  
  - Cada pareja tiene su propio `pairId`.
  - No existe acceso cruzado entre diferentes `pairId`.
  - El acceso comparativo se habilita solo por la relación.

---

## 3. Flujos Detallados

### 3.1. Registro de Usuario

1. Usuario se registra normalmente.
2. Se crea documento en `users` con datos individuales.
3. Campos `pairId` y `companionId` = null.

---

### 3.2. Vinculación de Usuarios

1. Usuario A genera un código/QR desde su perfil.
2. Usuario B escanea el QR o ingresa el código.
3. Backend verifica que ambos no tengan `pairId` asignado.
4. Se crea documento en `pairs`:
    - `userAId` = uid A
    - `userBId` = uid B
    - `active` = true
5. Se actualizan ambos documentos en `users`:
    - `pairId` = nuevo `pairId`
    - `companionId` = uid del otro usuario

---

### 3.3. Uso Comparativo (Home Comparativo)

1. Usuario accede a la vista comparativa.
2. Frontend consulta:
    - Sus propios datos (`ownerId` = uid propio)
    - Datos del compañero (`ownerId` = `companionId`)
3. Backend/Firestore verifica:
    - Existe documento en `pairs` con ambos uids y `active` = true.
    - Si no existe, no se permite acceso.
4. Se muestran estadísticas de ambos, sin mezclar datos.

---

### 3.4. Seguridad y Control de Acceso

#### 3.4.1. Reglas de Firestore

- **Lectura:**
    - Usuario puede leer sus propios datos.
    - Usuario puede leer datos del compañero SOLO si:
        - Existe documento en `pairs` con ambos uids y `active` = true.
        - El dato consultado tiene `ownerId` = `companionId`.
- **Escritura:**
    - Usuario solo puede escribir en documentos con `ownerId` = uid propio.
    - Nadie puede modificar datos del otro.

#### 3.4.2. Sin Vinculación

- Si `pairId` = null, solo acceso a datos propios.
- No existe acceso a datos de otros usuarios.

---

### 3.5. Desvinculación

1. Usuario inicia flujo de desvinculación.
2. Backend actualiza documento en `pairs`:
    - `active` = false
    - `breakReason` = motivo (opcional)
3. Se actualizan ambos documentos en `users`:
    - `pairId` = null
    - `companionId` = null
4. Acceso a datos del compañero se elimina inmediatamente.
5. Datos individuales permanecen intactos.
6. Otras parejas no se ven afectadas.

---

## 4. Escenario Múltiple y Escalabilidad

- N parejas pueden coexistir.
- Cada pareja tiene su propio `pairId` y entorno lógico aislado.
- No existe acceso cruzado entre parejas.
- El sistema escala sin conflictos ni duplicación de datos.

---

## 5. Resumen de Cambios Técnicos

- **Nuevas colecciones:** `pairs`
- **Nuevos campos en `users`:** `pairId`, `companionId`
- **Reglas de acceso:**  
  - Lectura cruzada solo si existe relación activa.
  - Escritura solo en datos propios.
- **Flujos:**  
  - Registro, vinculación, uso comparativo, desvinculación.
- **Aislamiento total:**  
  - Cada pareja es un entorno lógico exclusivo.

---

## 6. Implementación Paso a Paso

1. Crear colección `pairs` y definir estructura.
2. Agregar campos `pairId` y `companionId` en `users`.
3. Actualizar lógica de registro y vinculación.
4. Modificar queries para Home Comparativo.
5. Implementar reglas de seguridad en Firestore.
6. Desarrollar flujo de desvinculación.
7. Testear escenarios de múltiples parejas y aislamiento.

---

## 7. Consideraciones Finales

- No duplicar datos.
- No mezclar datos individuales.
- No permitir acceso cruzado entre parejas.
- Mantener la escalabilidad y seguridad como prioridad.

---

Este documento está diseñado para ser seguido paso a paso por una IA o desarrollador, sin ambigüedades ni supuestos implícitos.
