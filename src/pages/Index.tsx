import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Layers, Code, Play, CheckCircle,
  ArrowRight, ArrowDown, ChevronRight
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
            const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
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
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
              Notación Polaca
              <br />
              <span className="text-primary">Postfija</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Evaluación de expresiones matemáticas usando pilas
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
                Requiere paréntesis para definir el orden
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

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <h3 className="font-semibold mb-6 text-lg">¿Cómo funciona?</h3>
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
              {[
                { n: '1', text: 'Lee tokens de izquierda a derecha' },
                { n: '2', text: 'Número → push a la pila' },
                { n: '3', text: 'Operador → pop dos, opera, push resultado' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.n}
                  </div>
                  <span className="text-sm text-left">{item.text}</span>
                  {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground hidden md:block flex-shrink-0" />}
                </div>
              ))}
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
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="outline" className="mb-4 text-xs">Stack / Pila</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">¿Qué es una Pila?</h2>
            <p className="text-lg text-muted-foreground">
              <strong>LIFO</strong>: Last In, First Out — El último en entrar es el primero en salir
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

              <div className="grid grid-cols-3 gap-3">
                {[
                  { emoji: '📥', name: 'push(e)', desc: 'Añade al tope' },
                  { emoji: '📤', name: 'pop()', desc: 'Remueve del tope' },
                  { emoji: '👀', name: 'top()', desc: 'Ver el tope' },
                ].map((op, i) => (
                  <Card key={i} className="p-3 text-center">
                    <div className="text-xl mb-1">{op.emoji}</div>
                    <h4 className="font-semibold text-xs font-mono">{op.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{op.desc}</p>
                  </Card>
                ))}
              </div>
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
                maxHeight="520px"
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

          {/* Flow */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 items-center"
          >
            {[
              { label: 'Identificar entrada', desc: 'str o ArrayStack' },
              { label: 'Obtener tokens', desc: 'split() o extraer' },
              { label: 'Crear pila', desc: 'pila = ArrayStack()' },
              { label: 'Procesar tokens', desc: 'push / pop+op+push' },
              { label: 'Retornar resultado', desc: 'pila.pop()' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Card className="p-3 text-center min-w-[120px]">
                  <p className="font-semibold text-xs">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </Card>
                {i < 4 && <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />}
              </div>
            ))}
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <CodePanel
              code={NOTACION_POLACA_CODE}
              title="Notacion_Polaca.py — Código completo"
              maxHeight="520px"
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
                desc: 'La pila (LIFO) es fundamental para evaluar expresiones postfijas de forma eficiente.',
              },
              {
                title: '⚡ Algoritmo lineal O(n)',
                desc: 'Se recorre cada token una sola vez, haciendo el algoritmo extremadamente eficiente.',
              },
              {
                title: '🔗 Sin paréntesis',
                desc: 'La notación postfija elimina la ambigüedad y la necesidad de reglas de precedencia.',
              },
              {
                title: '🌍 Aplicaciones reales',
                desc: 'Usado en calculadoras HP, compiladores, máquinas virtuales y lenguajes como Forth.',
              },
            ].map((item, i) => (
              <Card key={i} className="p-5">
                <h3 className="font-semibold mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <p className="text-3xl font-bold text-primary mb-2">¡Gracias!</p>
            <p className="text-muted-foreground text-lg">¿Preguntas?</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
