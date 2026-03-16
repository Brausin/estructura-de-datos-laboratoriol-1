import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatNumber, type StackEntry } from '@/lib/rpn-engine';

interface StackVisualProps {
  stack: StackEntry[];
  className?: string;
  maxHeight?: string;
}

export function StackVisual({ stack, className, maxHeight = '300px' }: StackVisualProps) {
  return (
    <div className={cn('flex flex-col items-center w-full', className)}>
      <div
        className="flex flex-col-reverse items-center gap-1.5 w-full overflow-hidden"
        style={{ maxHeight, minHeight: '80px' }}
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
                'w-full max-w-[140px] px-4 py-2.5 rounded-lg text-center font-mono font-semibold text-sm border shadow-sm',
                i === stack.length - 1
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-accent text-accent-foreground border-primary/20'
              )}
            >
              {formatNumber(entry.value)}
              {i === stack.length - 1 && (
                <span className="ml-2 text-[10px] opacity-70 font-normal">← top</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="w-full max-w-[160px] h-1.5 bg-primary/30 rounded-full mt-3" />
      <span className="text-xs text-muted-foreground mt-1.5 font-semibold tracking-widest uppercase">
        Pila
      </span>
    </div>
  );
}
