import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, AlertTriangle, Type, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { generateSteps, NOTACION_POLACA_CODE, type SimStep } from '@/lib/rpn-engine';
import { StackVisual, TokensListVisual } from '@/components/StackVisual';
import { CodePanel } from '@/components/CodePanel';

const EXAMPLES = [
  { expr: '5 2 +', label: '5 2 +' },
  { expr: '5 2 + 8 3 - *', label: '5 2 + 8 3 − *' },
  { expr: '2 3 ^', label: '2 3 ^' },
  { expr: '10 3 /', label: '10 3 /' },
];

const ERROR_EXAMPLES = [
  { expr: '5 +', label: '5 +', error: 'Faltan operandos' },
  { expr: '5 2 hola', label: '5 2 hola', error: 'Operador inválido' },
  { expr: '5 2 3 +', label: '5 2 3 +', error: 'Demasiados operandos' },
];

interface RPNSimulatorProps {
  showCode?: boolean;
  showErrors?: boolean;
  initialExpression?: string;
}

export function RPNSimulator({
  showCode = true,
  showErrors = true,
  initialExpression = '5 2 + 8 3 - *'
}: RPNSimulatorProps) {
  const [expression, setExpression] = useState(initialExpression);
  const [inputMode, setInputMode] = useState<'str' | 'arraystack'>('str');
  const [steps, setSteps] = useState<SimStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const tokens = expression.trim().split(/\s+/).filter(Boolean);
  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  const evaluate = useCallback((expr?: string, mode?: 'str' | 'arraystack') => {
    const e = (expr || expression).trim();
    const m = mode ?? inputMode;
    if (!e) return;
    const newSteps = generateSteps(e, m);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
    setHasError(false);
  }, [expression, inputMode]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (steps[next].type === 'error') {
        setHasError(true);
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, steps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setHasError(false);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setSteps([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    setHasError(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(nextStep, 1200);
    return () => clearInterval(timer);
  }, [isPlaying, nextStep]);

  const selectExample = (expr: string) => {
    setExpression(expr);
    const newSteps = generateSteps(expr, inputMode);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
    setHasError(false);
  };

  const toggleMode = (mode: 'str' | 'arraystack') => {
    setInputMode(mode);
    reset();
  };

  const isArrayStackMode = step?.inputMode === 'arraystack';
  const isExtractionPhase = isArrayStackMode && (step?.type === 'extract' || (step?.type === 'init' && step.auxStack !== undefined && step.tokensList !== undefined && step.highlightLines.some(l => l <= 20)));

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex items-center gap-2 justify-center">
        <span className="text-sm text-muted-foreground font-medium">Tipo de entrada:</span>
        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => toggleMode('str')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all',
              inputMode === 'str'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <Type className="w-4 h-4" />
            str (cadena)
          </button>
          <button
            onClick={() => toggleMode('arraystack')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all border-l',
              inputMode === 'arraystack'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <Layers className="w-4 h-4" />
            ArrayStack
          </button>
        </div>
      </div>

      {/* Input */}
      <Card className="p-4">
        <div className="flex gap-2 mb-3">
          <Input
            value={expression}
            onChange={e => setExpression(e.target.value)}
            placeholder={inputMode === 'str' ? 'Ej: 5 2 + 8 3 - *' : 'Ej: 5 2 + (elementos de la pila)'}
            className="font-mono"
            onKeyDown={e => e.key === 'Enter' && evaluate()}
          />
          <Button onClick={() => evaluate()} className="px-6">
            Evaluar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium">Ejemplos:</span>
          {EXAMPLES.map(ex => (
            <Button
              key={ex.expr}
              variant="outline"
              size="sm"
              className="font-mono text-xs h-7"
              onClick={() => selectExample(ex.expr)}
            >
              {ex.label}
            </Button>
          ))}
        </div>
        {inputMode === 'arraystack' && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            Los elementos se cargarán en un ArrayStack. Se mostrará el proceso de extracción con la pila auxiliar.
          </p>
        )}
      </Card>

      {/* Token Ribbon */}
      {steps.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap px-1">
          <span className="text-sm font-medium text-muted-foreground">Tokens:</span>
          {tokens.map((t, i) => (
            <Badge
              key={i}
              variant={step && step.tokenIndex === i ? 'default' : 'outline'}
              className={cn(
                'font-mono text-sm transition-all duration-300',
                step && step.tokenIndex === i && 'scale-110 shadow-md',
                step && i < (step.tokenIndex ?? -1) && 'opacity-40'
              )}
            >
              {t}
            </Badge>
          ))}
        </div>
      )}

      {/* Main panel */}
      {steps.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Code */}
          {showCode && (
            <div className="lg:col-span-3">
              <CodePanel
                code={NOTACION_POLACA_CODE}
                highlightedLines={step?.highlightLines || []}
                title="Notacion_Polaca.py"
                maxHeight="400px"
              />
            </div>
          )}

          {/* Right: Data structures */}
          <div className={cn(
            showCode ? 'lg:col-span-2' : '',
            'space-y-4'
          )}>
            {/* ArrayStack mode: show exp, aux, tokens during extraction */}
            {isArrayStackMode && isExtractionPhase && (
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3">
                  <StackVisual
                    stack={step?.expStack || []}
                    maxHeight="160px"
                    label="exp"
                    compact
                  />
                </Card>
                <Card className="p-3">
                  <StackVisual
                    stack={step?.auxStack || []}
                    maxHeight="160px"
                    label="aux"
                    compact
                  />
                </Card>
                <Card className="p-3 col-span-2">
                  <TokensListVisual tokens={step?.tokensList || []} />
                </Card>
              </div>
            )}

            {/* Main pila - always visible */}
            <div className={cn(
              'transition-all duration-300',
              hasError && 'animate-shake'
            )}>
              <Card className="p-4">
                <StackVisual
                  stack={step?.stack || []}
                  maxHeight={isExtractionPhase ? '150px' : '280px'}
                  label="pila (cálculo)"
                />
              </Card>
            </div>

            {/* In ArrayStack mode after extraction: show that exp was restored */}
            {isArrayStackMode && !isExtractionPhase && step?.expStack && step.expStack.length > 0 && (
              <Card className="p-3 bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">exp (restaurada)</span>
                  <Badge variant="outline" className="text-[10px] h-4">intacta</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {step.expStack.map((e, i) => (
                    <span key={e.id} className="px-2 py-0.5 bg-accent rounded text-xs font-mono border">
                      {typeof e.value === 'number' ? e.value : `"${e.value}"`}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Message */}
      {step && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'rounded-xl border p-4',
              step.type === 'error'
                ? 'bg-destructive/5 border-destructive/20'
                : step.type === 'result'
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                  : step.type === 'extract'
                    ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                    : 'bg-muted/50'
            )}
          >
            <div className="flex items-center gap-2">
              {step.type === 'error' && <AlertTriangle className="w-4 h-4 text-destructive" />}
              {step.type === 'extract' && <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              <span className="font-semibold text-sm">{step.action}</span>
              {step.type === 'extract' && (
                <Badge variant="outline" className="text-[10px] h-5 ml-auto">Extracción ArrayStack</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{step.detail}</p>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Controls */}
      {steps.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline" size="icon"
            onClick={prevStep}
            disabled={currentStep <= 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant={isPlaying ? 'default' : 'outline'}
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={currentStep >= steps.length - 1}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline" size="icon"
            onClick={nextStep}
            disabled={currentStep >= steps.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-3 font-mono">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
      )}

      {/* Error Examples */}
      {showErrors && (
        <div className="space-y-3 pt-4">
          <h3 className="text-lg font-semibold">Manejo de Errores</h3>
          <p className="text-sm text-muted-foreground">
            Prueba estos ejemplos para ver cómo el algoritmo detecta errores:
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {ERROR_EXAMPLES.map(ex => (
              <Card
                key={ex.expr}
                className="p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                onClick={() => selectExample(ex.expr)}
              >
                <code className="font-mono text-sm font-semibold">{ex.label}</code>
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {ex.error}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
