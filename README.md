# Notación Polaca Postfija — Laboratorio Interactivo

> Laboratorio 1 · Estructuras de Datos · Brausin Studio

Una aplicación web educativa e interactiva para aprender el algoritmo de evaluación de expresiones en **Notación Polaca Postfija (RPN)** utilizando **pilas (stacks)** implementadas en Python.

---

## ¿Qué es este proyecto?

Este laboratorio cubre dos conceptos fundamentales de estructuras de datos:

- **La pila (stack)** como estructura LIFO, sus operaciones `push`, `pop` y `top`, y su implementación en Python mediante una clase `ArrayStack`.
- **El algoritmo Notacion_Polaca**, que evalúa expresiones matemáticas en notación postfija recorriendo tokens de izquierda a derecha: los números se apilan, los operadores extraen dos operandos, operan y devuelven el resultado a la pila.

La aplicación incluye un **simulador interactivo** que muestra la ejecución paso a paso, con visualización de la pila en tiempo real y resaltado de la línea de código Python que se está ejecutando en cada momento.

---

## Estructura del laboratorio

El contenido se divide en cinco secciones navegables:

| # | Sección | Descripción |
|---|---------|-------------|
| 1 | **Introducción** | Comparativa entre notación infija y postfija |
| 2 | **Pilas** | Concepto LIFO, operaciones y demo interactiva de push/pop |
| 3 | **Algoritmo** | Flujo completo del algoritmo con código Python resaltado |
| 4 | **Demo en Vivo** | Simulador paso a paso con entrada personalizada |
| 5 | **Conclusión** | Resumen de conceptos y complejidad O(n) |

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework UI | [React](https://react.dev) 18 + [TypeScript](https://www.typescriptlang.org) 5 |
| Build tool | [Vite](https://vitejs.dev) 5 |
| Estilos | [Tailwind CSS](https://tailwindcss.com) 3 |
| Componentes | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) |
| Animaciones | [Framer Motion](https://www.framer-motion.com) |
| Routing | [React Router](https://reactrouter.com) v6 |
| Iconos | [Lucide React](https://lucide.dev) |
| Testing | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) |

---

## Estructura del repositorio

```
estructura/
├── src/
│   ├── components/
│   │   ├── CodePanel.tsx        # Renderizador de código con syntax highlighting
│   │   ├── RPNSimulator.tsx     # Simulador interactivo paso a paso
│   │   ├── StackVisual.tsx      # Visualización animada de la pila
│   │   └── ui/                  # Componentes base (shadcn/ui)
│   ├── lib/
│   │   ├── rpn-engine.ts        # Motor de evaluación RPN y generador de pasos
│   │   └── utils.ts             # Utilidades (cn)
│   ├── pages/
│   │   ├── Index.tsx            # Página principal con las 5 secciones
│   │   └── NotFound.tsx         # Página 404
│   └── hooks/                   # Hooks personalizados
├── public/
│   └── robots.txt
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Cómo ejecutar el proyecto

### Requisitos

- [Node.js](https://nodejs.org) v18 o superior
- npm v9 o superior (o [Bun](https://bun.sh))

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Brausin/estructura-de-datos-laboratoriol-1.git
cd estructura-de-datos-laboratoriol-1

# Instalar dependencias
npm install
```

### Desarrollo

```bash
npm run dev
```

El servidor de desarrollo queda disponible en `http://localhost:8080` con hot-reload activado.

### Producción

```bash
# Compilar para producción
npm run build

# Previsualizar el build
npm run preview
```

### Tests

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Tests E2E (requiere el servidor corriendo)
npx playwright test
```

---

## Algoritmo implementado

El motor central (`src/lib/rpn-engine.ts`) implementa el algoritmo de evaluación en dos modos de entrada:

- **Modo string** — la expresión llega como cadena de texto y se divide con `split()`
- **Modo ArrayStack** — la expresión llega ya tokenizada como una pila propia

En ambos casos, la función itera token por token: si es número lo apila; si es operador extrae dos operandos, aplica la operación y devuelve el resultado a la pila. Al finalizar, el único elemento restante es el resultado.

El simulador genera una traza de pasos (`SimStep[]`) que la UI consume para animar la ejecución de forma didáctica.

---

## Autor

**Brausin Studio**
[brausinstudio.com](https://www.brausinstudio.com)

---

<sub>Laboratorio 1 · Estructuras de Datos · Python</sub>
