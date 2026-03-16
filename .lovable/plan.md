

# Plan: Tres correcciones puntuales

## 1. Agregar nombres al inicio
En la sección de Introducción (Index.tsx ~línea 123-134), agregar "Juan Vargas & Eloy Quintero" debajo del badge "Estructuras de Datos — Python", antes del título.

## 2. Corregir línea resaltada (off-by-one bug)
**Bug encontrado**: El engine genera líneas 1-based (línea 1 = `def Notacion_Polaca`), pero `CodePanel.tsx` compara con `i` (0-based index). Resultado: se resalta la línea equivocada (una línea abajo).

**Fix**: En `CodePanel.tsx` línea 137, cambiar `highlightedLines.includes(i)` → `highlightedLines.includes(i + 1)`. Esto alinea los números del engine con los índices del array.

También ajustar el scrollIntoView (línea 96-97) para usar `highlightedLines[0] - 1` como índice del ref.

## 3. Evitar que la página se suba al avanzar/retroceder pasos
**Bug**: `CodePanel` usa `scrollIntoView({ block: 'center' })` que mueve toda la página, no solo el contenedor del código.

**Fix**: Reemplazar `scrollIntoView` por scroll manual dentro del contenedor usando `containerRef.current.scrollTop`. Calcular la posición del elemento relativa al contenedor y hacer scroll solo dentro del div overflow.

## Archivos a modificar
1. **`src/pages/Index.tsx`** — Agregar nombres de presentadores al inicio
2. **`src/components/CodePanel.tsx`** — Fix off-by-one en highlighting + fix scroll contenido

