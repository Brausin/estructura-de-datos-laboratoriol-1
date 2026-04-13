import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Layers, Code, Play, CheckCircle,
  ArrowRight, ArrowDown, ChevronRight, Users
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ARRAY_STACK_CODE, NOTACION_POLACA_CODE } from '@/lib/rpn-engine';
import { CodePanel } from '@/components/CodePanel';
import { StackVisual } from '@/components/StackVisual';
import { RPNSimulator } from '@/components/RPNSimulator';
import type { StackEntry } from '@/lib/rpn-engine';

const SECTIONS = [
  { id: 'intro', label: 'Introducción', icon: BookOpen },
  { id: 'stacks', label: 'Pilas', icon: Layers },
  { id: 'algorithm', label: 'Algoritmo', icon: Code },
  { id: 'demo', label: 'Demo en Vivo', icon: Play },
  { id: 'conclusion', label: 'Conclusión', icon: CheckCircle },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Index = () => {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Mini stack demo
  const [miniStack, setMiniStack] = useState<StackEntry[]>([]);
  const [miniNextId, setMiniNextId] = useState(0);
  const miniValues = [7, 3, 9, 1, 5];
  const [miniPushIdx, setMiniPushIdx] = useState(0);

  const scrollToSection = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth' });
  };

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLElement);
            if (idx >= 0) setActiveSection(idx);
          }
        });
      },
      { threshold: 0.3 }
    );
    sectionRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' && activeSection < SECTIONS.length - 1) scrollToSection(activeSection + 1);
      else if (e.key === 'ArrowLeft' && activeSection > 0) scrollToSection(activeSection - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeSection]);

  const pushMini = () => {
    const val = miniValues[miniPushIdx % miniValues.length];
    setMiniStack(prev => [...prev, { id: miniNextId, value: val }]);
    setMiniNextId(p => p + 1);
    setMiniPushIdx(p => p + 1);
  };

  const popMini = () => {
    if (miniStack.length > 0) setMiniStack(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Presentation Bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {SECTIONS.map((section, i) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(i)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                    i === activeSection
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{section.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {activeSection + 1}/{SECTIONS.length}
          </span>
        </div>
      </nav>

      {/* ===== SECTION 1: INTRODUCCIÓN ===== */}
      <section
        ref={el => { sectionRefs.current[0] = el; }}
        className="min-h-screen flex items-center justify-center px-4 py-20"
      >
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 text-xs">Estructuras de Datos — Python</Badge>
            <p className="text-sm text-muted-foreground font-medium mb-2">Brausin Studio</p>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Notación Polaca
              <br />
              <span className="text-primary">Postfija</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              La <strong>Notación Polaca Postfija</strong> (Reverse Polish Notation) es una forma de escribir
              expresiones matemáticas <strong>sin utilizar paréntesis</strong> ni reglas de precedencia.
              Se evalúa usando una estructura de datos llamada <strong>pila (stack)</strong>.
            </p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            <Card className="p-6 text-left">
              <h3 className="font-semibold mb-2 text-muted-foreground text-xs uppercase tracking-widest">
                Notación Infija (tradicional)
              </h3>
              <code className="text-2xl md:text-3xl font-mono font-bold block mb-3">
                (5 + 2) × (8 − 3)
              </code>
              <p className="text-sm text-muted-foreground">
                Requiere paréntesis para definir el orden de las operaciones
              </p>
            </Card>
            <Card className="p-6 text-left border-primary/30 bg-accent/30">
              <h3 className="font-semibold mb-2 text-primary text-xs uppercase tracking-widest">
                Notación Postfija (RPN)
              </h3>
              <code className="text-2xl md:text-3xl font-mono font-bold block mb-3">
                5 2 + 8 3 - *
              </code>
              <p className="text-sm text-muted-foreground">
                No necesita paréntesis — se evalúa con una pila
              </p>
            </Card>
          </motion.div>

          {/* How it works - improved */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-3xl mx-auto text-left"
          >
            <h3 className="font-semibold mb-6 text-xl text-center">¿Cómo funciona el algoritmo?</h3>
            <div className="grid md:grid-cols-3 gap-5">
              <Card className="p-5 space-y-2">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                <h4 className="font-semibold text-sm">Leer la expresión</h4>
                <p className="text-sm text-muted-foreground">
                  La expresión se divide en elementos llamados <strong>tokens</strong> y se lee de izquierda a derecha.
                </p>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded block">
                  "5 2 + 8 3 - *" → [5, 2, +, 8, 3, -, *]
                </code>
              </Card>

              <Card className="p-5 space-y-2">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                <h4 className="font-semibold text-sm">Si es un número → push</h4>
                <p className="text-sm text-muted-foreground">
                  Se guarda en la pila usando <code className="font-mono bg-muted px-1 rounded text-xs">push()</code>.
                </p>
                <div className="text-xs font-mono bg-muted px-2 py-1 rounded space-y-0.5">
                  <div>push(5) → Pila: [5]</div>
                  <div>push(2) → Pila: [5, 2]</div>
                </div>
              </Card>

              <Card className="p-5 space-y-2">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                <h4 className="font-semibold text-sm">Si es un operador → pop, opera, push</h4>
                <p className="text-sm text-muted-foreground">
                  Se sacan dos números, se opera y el resultado vuelve a la pila.
                </p>
                <div className="text-xs font-mono bg-muted px-2 py-1 rounded space-y-0.5">
                  <div>b = pop() → 2</div>
                  <div>a = pop() → 5</div>
                  <div>push(5 + 2) → push(7)</div>
                </div>
              </Card>
            </div>
          </motion.div>

          <Button variant="ghost" onClick={() => scrollToSection(1)} className="animate-bounce">
            <ArrowDown className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* ===== SECTION 2: PILAS ===== */}
      <section
        ref={el => { sectionRefs.current[1] = el; }}
        className="min-h-screen flex items-center px-4 py-20"
      >
        <div className="max-w-5xl mx-auto space-y-12 w-full">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-4 text-xs">Stack / Pila</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Qué es una Pila?</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Una <strong>pila (stack)</strong> es una estructura de datos que funciona bajo el principio
              <strong> LIFO — Last In, First Out</strong>: el último elemento en entrar es el primero en salir.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-center">Prueba las operaciones</h3>
                <div className="flex justify-center mb-6">
                  <StackVisual stack={miniStack} maxHeight="220px" />
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={pushMini} size="sm">
                    push({miniValues[miniPushIdx % miniValues.length]})
                  </Button>
                  <Button onClick={popMini} variant="outline" size="sm" disabled={miniStack.length === 0}>
                    pop()
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Elementos: {miniStack.length} &nbsp;|&nbsp;
                  Top: {miniStack.length > 0 ? miniStack[miniStack.length - 1].value : '—'}
                </p>
              </Card>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-center">Operaciones principales</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { emoji: '📥', name: 'push(e)', desc: 'Agrega un elemento al tope' },
                    { emoji: '📤', name: 'pop()', desc: 'Elimina el elemento del tope' },
                    { emoji: '👀', name: 'top()', desc: 'Muestra el elemento superior' },
                  ].map((op, i) => (
                    <Card key={i} className="p-3 text-center">
                      <div className="text-xl mb-1">{op.emoji}</div>
                      <h4 className="font-semibold text-xs font-mono">{op.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{op.desc}</p>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="p-4 bg-muted/30">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Usos comunes de pilas</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Evaluación de expresiones matemáticas</li>
                  <li>• Compiladores y análisis sintáctico</li>
                  <li>• Manejo de memoria (call stack)</li>
                  <li>• Algoritmos de backtracking</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <CodePanel
                code={ARRAY_STACK_CODE}
                title="ArrayStack.py"
                maxHeight="600px"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: ALGORITMO ===== */}
      <section
        ref={el => { sectionRefs.current[2] = el; }}
        className="min-h-screen flex items-center px-4 py-20"
      >
        <div className="max-w-5xl mx-auto space-y-12 w-full">
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="outline" className="mb-4 text-xs">Algoritmo</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">Notacion_Polaca</h2>
            <p className="text-lg text-muted-foreground">
              Flujo completo del algoritmo de evaluación
            </p>
          </motion.div>

          {/* Improved flow explanation */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3"
          >
            {[
              {
                n: '1', label: 'Identificar entrada',
                desc: 'La función acepta una cadena de texto o una pila ArrayStack.',
              },
              {
                n: '2', label: 'Obtener tokens',
                desc: 'Si es cadena, se usa split() para separar en elementos.',
              },
              {
                n: '3', label: 'Crear pila',
                desc: 'Se crea una nueva pila para almacenar números durante la evaluación.',
              },
              {
                n: '4', label: 'Procesar tokens',
                desc: 'Número → push a la pila. Operador → pop dos, opera, push resultado.',
              },
              {
                n: '5', label: 'Retornar resultado',
                desc: 'El único valor en la pila es el resultado final.',
              },
            ].map((item, i) => (
              <Card key={i} className="p-4 text-center relative">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mx-auto mb-2">
                  {item.n}
                </div>
                <p className="font-semibold text-xs mb-1">{item.label}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <CodePanel
              code={NOTACION_POLACA_CODE}
              title="Notacion_Polaca.py — Código completo"
              maxHeight="600px"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 4: DEMO ===== */}
      <section
        ref={el => { sectionRefs.current[3] = el; }}
        className="min-h-screen flex items-center px-4 py-20"
      >
        <div className="max-w-5xl mx-auto space-y-8 w-full">
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="outline" className="mb-4 text-xs">Simulador Interactivo</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">Demo en Vivo</h2>
            <p className="text-lg text-muted-foreground">
              Ingresa una expresión postfija y observa la evaluación paso a paso
            </p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <RPNSimulator />
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 5: CONCLUSIÓN ===== */}
      <section
        ref={el => { sectionRefs.current[4] = el; }}
        className="min-h-screen flex items-center justify-center px-4 py-20"
      >
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 text-xs">Resumen</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Conclusiones</h2>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="grid sm:grid-cols-2 gap-4 text-left"
          >
            {[
              {
                title: '📚 Pilas como estructura clave',
                desc: 'La pila (LIFO) permite evaluar expresiones postfijas de forma simple y eficiente, sin necesidad de analizar precedencia de operadores.',
              },
              {
                title: '⚡ Algoritmo lineal O(n)',
                desc: 'Cada token se procesa una sola vez, por lo que el algoritmo tiene complejidad O(n), haciéndolo extremadamente eficiente.',
              },
              {
                title: '🔗 Sin necesidad de paréntesis',
                desc: 'La notación postfija elimina la ambigüedad del orden de operaciones. No se necesitan reglas de precedencia.',
              },
              {
                title: '🌍 Aplicaciones reales',
                desc: 'Este método se utiliza en calculadoras científicas (HP), compiladores, máquinas virtuales y lenguajes como Forth.',
              },
            ].map((item, i) => (
              <Card key={i} className="p-5">
                <h3 className="font-semibold mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <p className="text-3xl font-bold text-primary mb-2">¡Gracias!</p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <p className="text-lg font-medium">Brausin Studio</p>
            </div>
            <p className="text-muted-foreground">
              <a
                href="https://www.brausinstudio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                brausinstudio.com
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
