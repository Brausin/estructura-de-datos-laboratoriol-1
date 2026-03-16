

# Plan: Demo line-by-line con estado completo de todas las estructuras de datos

## Problema actual
- La demo solo muestra `exp`, `aux` y `tokens` durante la fase de extracción (ArrayStack), y solo `pila` durante la evaluación
- No se recorre el código linea por linea -- se saltan lineas sin explicar por que no aplican
- En modo `str`, no se muestran las estructuras auxiliares (tokens list, pila)

## Cambios

### 1. Rediseño del engine (`src/lib/rpn-engine.ts`)

Reescribir `generateSteps` para que genere un paso **por cada linea del codigo Python** (lineas 1-56 de `NOTACION_POLACA_CODE`), no solo por las lineas que se ejecutan:

- **Lineas que SI aplican**: mostrar la acción y el estado resultante de todas las estructuras
- **Lineas que NO aplican**: resaltar la linea, indicar por que no se ejecuta (ej: `isinstance(exp, str) → False, no aplica porque la entrada es ArrayStack`)
- Incluir las lineas de `elif`, `else`, `if` que se evaluan como False

Cada `SimStep` siempre incluira el estado de TODAS las estructuras activas:
- `pila` (siempre)
- `tokens` (siempre, desde que se crea)
- `exp` y `aux` (solo en modo ArrayStack)

Agregar campo `skipped?: boolean` y `skipReason?: string` al `SimStep` para lineas que no aplican.

### 2. Actualizar el panel derecho (`src/components/RPNSimulator.tsx`)

Mostrar SIEMPRE a la derecha del codigo todas las estructuras de datos relevantes, sin importar la fase:

```text
┌─────────────────────────────────────┐
│  Modo str:                          │
│  ┌─────────┐  ┌──────────────────┐  │
│  │  pila    │  │  tokens []       │  │
│  │  (stack) │  │  (lista)         │  │
│  └─────────┘  └──────────────────┘  │
│                                     │
│  Modo ArrayStack:                   │
│  ┌─────┐ ┌─────┐ ┌──────┐ ┌─────┐  │
│  │ exp │ │ aux │ │tokens│ │pila │  │
│  └─────┘ └─────┘ └──────┘ └─────┘  │
└─────────────────────────────────────┘
```

- Todas las estructuras visibles en todo momento (vacías si aun no se crean, con label "no creada aun")
- Cuando una estructura cambia, resaltarla brevemente

### 3. Mensaje de linea no aplicable

En el panel de mensajes, cuando una linea no aplica, mostrar:
- Linea resaltada en gris/tenue
- Mensaje: "Linea X: `elif isinstance(exp, ArrayStack):` -- No aplica: la entrada es de tipo str"
- Tipo visual distinto (fondo gris claro) para diferenciar de pasos activos

### Archivos a modificar
1. **`src/lib/rpn-engine.ts`** -- Agregar `skipped`/`skipReason` a SimStep, reescribir ambos modos para recorrer linea por linea incluyendo las que no aplican, y siempre pasar el estado de todas las estructuras
2. **`src/components/RPNSimulator.tsx`** -- Mostrar siempre todas las estructuras a la derecha, agregar estilo para pasos "skipped"
3. **`src/components/StackVisual.tsx`** -- Agregar estado "no creada" para pilas vacias que aun no existen

