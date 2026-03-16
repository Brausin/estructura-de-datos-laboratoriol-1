

# Laboratorio Interactivo: Notación Polaca Postfija

## Visión General
Una aplicación web educativa de una sola página, diseñada para una exposición universitaria de 8 minutos. Estilo limpio y académico inspirado en Observable/Notion, optimizado para proyector.

## Tipografía y Colores
- **Inter** para texto, **JetBrains Mono** para código
- Fondo blanco papel (#FDFDFD), azul primario (#3B82F6), grises slate, bloques de pila en azul claro (#EFF6FF)

## Estructura Principal

### 1. Barra de Progreso de Presentación (Top)
5 segmentos clickeables: Introducción → Teoría de Pilas → Algoritmo → Demo en Vivo → Conclusión. Cada segmento navega a su sección correspondiente.

### 2. Sección: Introducción
- Explicación breve de Notación Postfija
- Comparación visual animada: `(5 + 2) * (8 − 3)` → `5 2 + 8 3 - *`
- Mini-animación mostrando cómo se leen tokens y se apilan

### 3. Sección: Teoría de Pilas
- Visualización de operaciones LIFO (push/pop)
- Código de `ArrayStack` mostrado con syntax highlighting (solo visualización, sin explicación detallada)

### 4. Sección: Algoritmo (Layout Split-Pane)
- **Panel Izquierdo:** Código completo de `Notacion_Polaca` con highlighting de línea activa
- **Panel Derecho:** 
  - **Token Ribbon** (cinta de tokens) mostrando progreso de lectura
  - **Stack Visual** con bloques animados (slide-in/slide-out con bounce)
  - **Panel de mensajes** mostrando acciones: "Token leído: 5", "Acción: push(5)", etc.

### 5. Sección: Simulador Interactivo
- Campo de entrada para expresiones personalizadas (ej: `5 2 +`, `2 3 ^`)
- Expresiones de ejemplo pre-cargadas como botones clickeables
- **Controles flotantes:** ⏮ Paso Atrás | ▶ Play/Pausa | ⏭ Siguiente Paso | 🔄 Reiniciar
- Cada paso sincroniza: línea de código resaltada ↔ animación de pila ↔ mensaje descriptivo

### 6. Sección: Manejo de Errores
- 3 ejemplos interactivos pre-cargados:
  - `5 +` → "Error: faltan operandos"
  - `5 2 hola` → "Error: operador inválido"  
  - `5 2 3 +` → "Error: demasiados operandos"
- Animación de shake + toast rojo cuando ocurre error

### 7. Sección: Conclusión
- Resumen visual del flujo del algoritmo
- Puntos clave para recordar

## Animaciones
- Push: elemento desliza desde arriba con fade-in y ligero bounce (300ms)
- Pop: elemento se eleva y desvanece (300ms)
- Línea de código activa: glow azul suave
- Errores: shake del contenedor + toast rojo
- Transiciones entre secciones suaves

## Interactividad
- Todo funciona en el frontend, sin backend
- La simulación es paso a paso por defecto (no auto-play)
- Navegación por teclado (flechas) para modo presentación

