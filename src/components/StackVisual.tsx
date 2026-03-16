import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatValue, type StackEntry } from '@/lib/rpn-engine';

interface StackVisualProps {
  stack: StackEntry[];
  className?: string;
  maxHeight?: string;
  label?: string;
  compact?: boolean;
}

export function StackVisual({ stack, className, maxHeight = '300px', label = 'Pila', compact = false }: StackVisualProps) {
  return (
    <div className={cn('flex flex-col items-center w-full', className)}>
      <div
        className="flex flex-col-reverse items-center gap-1.5 w-full overflow-hidden"
        style={{ maxHeight, minHeight: compact ? '40px' : '80px' }}
      >
        <AnimatePresence mode="popLayout">
          {stack.map((entry, i) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, scale: 0.5, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -40 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className={cn(
                'w-full px-3 py-1.5 rounded-lg text-center font-mono font-semibold border shadow-sm',
                compact ? 'text-xs max-w-[100px]' : 'text-sm max-w-[140px] py-2.5 px-4',
                i === stack.length - 1
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-accent text-accent-foreground border-primary/20'
              )}
            >
              {formatValue(entry.value)}
              {i === stack.length - 1 && (
                <span className="ml-1 text-[10px] opacity-70 font-normal">← top</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className={cn('w-full h-1.5 bg-primary/30 rounded-full mt-2', compact ? 'max-w-[110px]' : 'max-w-[160px]')} />
      <span className="text-xs text-muted-foreground mt-1 font-semibold tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}

// Simple list visualization for tokens[]
interface TokensListVisualProps {
  tokens: string[];
  className?: string;
}

export function TokensListVisual({ tokens, className }: TokensListVisualProps) {
  return (
    <div className={cn('flex flex-col items-center w-full', className)}>
      <div className="w-full border rounded-lg p-2 bg-muted/30 min-h-[40px] flex flex-wrap gap-1 items-center justify-center">
        {tokens.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">vacía</span>
        ) : (
          tokens.map((t, i) => (
            <motion.span
              key={`${i}-${t}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs font-mono font-semibold border"
            >
              "{t}"
            </motion.span>
          ))
        )}
      </div>
      <span className="text-xs text-muted-foreground mt-1 font-semibold tracking-widest uppercase">
        tokens [ ]
      </span>
    </div>
  );
}
