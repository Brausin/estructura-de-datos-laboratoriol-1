import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CodePanelProps {
  code: string;
  highlightedLines?: number[];
  title?: string;
  className?: string;
  maxHeight?: string;
}

export function CodePanel({ code, highlightedLines = [], title, className, maxHeight = '400px' }: CodePanelProps) {
  const lines = code.split('\n');
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (highlightedLines.length > 0 && lineRefs.current[highlightedLines[0]]) {
      lineRefs.current[highlightedLines[0]]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightedLines]);

  return (
    <div className={cn('rounded-xl border bg-card overflow-hidden shadow-sm', className)}>
      {title && (
        <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <span className="text-xs font-medium text-muted-foreground ml-2">{title}</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="overflow-auto font-mono text-[13px] leading-6"
        style={{ maxHeight }}
      >
        {lines.map((line, i) => {
          const isHighlighted = highlightedLines.includes(i);
          return (
            <div
              key={i}
              ref={el => { lineRefs.current[i] = el; }}
              className={cn(
                'flex px-4 transition-all duration-300',
                isHighlighted
                  ? 'bg-primary/10 border-l-[3px] border-primary'
                  : 'border-l-[3px] border-transparent'
              )}
            >
              <span className="w-8 text-right text-muted-foreground/40 select-none mr-4 flex-shrink-0 text-xs leading-6">
                {i + 1}
              </span>
              <span
                className={cn(
                  'whitespace-pre',
                  isHighlighted && 'text-primary font-medium'
                )}
              >
                {line || ' '}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
