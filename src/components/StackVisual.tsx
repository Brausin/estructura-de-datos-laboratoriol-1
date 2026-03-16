import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatValue, type StackEntry } from '@/lib/rpn-engine';

interface StackVisualProps {
  stack: StackEntry[];
  className?: string;
  maxHeight?: string;
  label?: string;
  compact?: boolean;
  notCreated?: boolean;
  notApplicable?: boolean;
}

export function StackVisual({ stack, className, maxHeight = '300px', label = 'Pila', compact = false, notCreated = false, notApplicable = false }: StackVisualProps) {
  return (
    <div className={cn('flex flex-col items-center w-full', className)}>
      <div
        className={cn(
          'flex flex-col-reverse items-center gap-1 w-full overflow-hidden',
          (notCreated || notApplicable) && 'justify-center'
        )}
        style={{ maxHeight, minHeight: compact ? '36px' : '60px' }}
      >
        {notApplicable ? (
          <span className="text-[10px] text-muted-foreground/50 italic">N/A</span>
        ) : notCreated ? (
          <span className="text-[10px] text-muted-foreground/60 italic">no creada</span>
        ) : stack.length === 0 ? (
          <span className="text-[10px] text-muted-foreground/60 italic">vacía</span>
        ) : (
          <AnimatePresence mode="popLayout">
            {stack.map((entry, i) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, scale: 0.5, y: -30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -30 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className={cn(
                  'w-full px-2 py-1 rounded-md text-center font-mono font-semibold border shadow-sm',
                  compact ? 'text-[11px] max-w-[90px]' : 'text-xs max-w-[120px] py-1.5 px-3',
                  i === stack.length - 1
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-accent text-accent-foreground border-primary/20'
                )}
              >
                {formatValue(entry.value)}
                {i === stack.length - 1 && (
                  <span className="ml-1 text-[9px] opacity-70 font-normal">← top</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      <div className={cn(
        'w-full h-1 rounded-full mt-1.5',
        notApplicable ? 'bg-muted-foreground/10' : notCreated ? 'bg-muted-foreground/20' : 'bg-primary/30',
        compact ? 'max-w-[100px]' : 'max-w-[130px]'
      )} />
      <span className={cn(
        'text-[10px] mt-0.5 font-semibold tracking-widest uppercase',
        notApplicable || notCreated ? 'text-muted-foreground/40' : 'text-muted-foreground'
      )}>
        {label}
      </span>
    </div>
  );
}

interface TokensListVisualProps {
  tokens: string[];
  className?: string;
  notCreated?: boolean;
}

export function TokensListVisual({ tokens, className, notCreated = false }: TokensListVisualProps) {
  return (
    <div className={cn('flex flex-col items-center w-full', className)}>
      <div className="w-full border rounded-lg p-2 bg-muted/30 min-h-[32px] flex flex-wrap gap-1 items-center justify-center">
        {notCreated ? (
          <span className="text-[10px] text-muted-foreground/60 italic">no creada</span>
        ) : tokens.length === 0 ? (
          <span className="text-[10px] text-muted-foreground/60 italic">vacía</span>
        ) : (
          tokens.map((t, i) => (
            <motion.span
              key={`${i}-${t}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-1.5 py-0.5 bg-accent text-accent-foreground rounded text-[11px] font-mono font-semibold border"
            >
              "{t}"
            </motion.span>
          ))
        )}
      </div>
      <span className={cn(
        'text-[10px] mt-0.5 font-semibold tracking-widest uppercase',
        notCreated ? 'text-muted-foreground/40' : 'text-muted-foreground'
      )}>
        tokens [ ]
      </span>
    </div>
  );
}
