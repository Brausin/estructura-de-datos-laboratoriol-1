import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';

interface CodePanelProps {
  code: string;
  highlightedLines?: number[];
  title?: string;
  className?: string;
  maxHeight?: string;
}

// Simple Python syntax highlighting
function highlightPython(line: string): JSX.Element[] {
  const elements: JSX.Element[] = [];
  
  // Patterns for Python syntax
  const patterns: [RegExp, string][] = [
    [/^(\s*#.*)$/, 'text-slate-500 italic'], // full-line comments
    [/(#[^\n]*)/, 'text-slate-500 italic'], // inline comments
    [/"""[^"]*"""/, 'text-emerald-400'], // docstrings
    [/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/, 'text-emerald-400'], // strings
    [/\b(def|class|return|if|elif|else|for|while|try|except|raise|not|and|or|in|is|True|False|None|pass|self|import|from|as)\b/, 'text-purple-400 font-semibold'], // keywords
    [/\b(isinstance|len|float|int|str|print|append|pop|push|split|is_empty|is_integer|TypeError|ValueError|Exception)\b/, 'text-sky-400'], // builtins/functions
    [/\b(\d+\.?\d*)\b/, 'text-amber-400'], // numbers
    [/([+\-*/^=<>!]+)/, 'text-pink-400'], // operators
    [/(\[|\]|\(|\)|{|})/, 'text-yellow-300'], // brackets
  ];

  // Simple tokenizer - split and colorize
  let remaining = line;
  let key = 0;

  if (!remaining.length) {
    return [<span key={0}> </span>];
  }

  // Handle full-line comments
  const commentMatch = remaining.match(/^(\s*)(#.*)$/);
  if (commentMatch) {
    if (commentMatch[1]) elements.push(<span key={key++}>{commentMatch[1]}</span>);
    elements.push(<span key={key++} className="text-slate-500 italic">{commentMatch[2]}</span>);
    return elements;
  }

  // Handle docstrings
  const docMatch = remaining.match(/^(\s*)(""".*""")(.*)$/);
  if (docMatch) {
    if (docMatch[1]) elements.push(<span key={key++}>{docMatch[1]}</span>);
    elements.push(<span key={key++} className="text-emerald-400">{docMatch[2]}</span>);
    if (docMatch[3]) elements.push(<span key={key++}>{docMatch[3]}</span>);
    return elements;
  }

  // Simple word-by-word highlighting
  const keywords = new Set(['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'raise', 'not', 'and', 'or', 'in', 'is', 'True', 'False', 'None', 'pass', 'self', 'import', 'from', 'as']);
  const builtins = new Set(['isinstance', 'len', 'float', 'int', 'str', 'print', 'append', 'pop', 'push', 'split', 'is_empty', 'is_integer', 'TypeError', 'ValueError', 'Exception', 'Empty', 'ArrayStack', 'IndexError']);

  // Split preserving whitespace and special chars
  const tokens = remaining.match(/(\s+|""".*?"""|'[^']*'|"[^"]*"|#.*$|[a-zA-Z_]\w*|\d+\.?\d*|[^\s])/g) || [remaining];
  
  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      elements.push(<span key={key++}>{token}</span>);
    } else if (token.startsWith('#')) {
      elements.push(<span key={key++} className="text-slate-500 italic">{token}</span>);
    } else if (token.startsWith('"""') || token.startsWith("'") || token.startsWith('"')) {
      elements.push(<span key={key++} className="text-emerald-400">{token}</span>);
    } else if (keywords.has(token)) {
      elements.push(<span key={key++} className="text-purple-400 font-semibold">{token}</span>);
    } else if (builtins.has(token)) {
      elements.push(<span key={key++} className="text-sky-400">{token}</span>);
    } else if (/^\d+\.?\d*$/.test(token)) {
      elements.push(<span key={key++} className="text-amber-400">{token}</span>);
    } else if (/^[+\-*/^=<>!]+$/.test(token)) {
      elements.push(<span key={key++} className="text-pink-400">{token}</span>);
    } else if (/^[[\](){}:,]+$/.test(token)) {
      elements.push(<span key={key++} className="text-yellow-300/80">{token}</span>);
    } else if (token === '__init__' || token === '__len__' || token === '__str__' || token === '__repr__') {
      elements.push(<span key={key++} className="text-purple-400 font-semibold">{token}</span>);
    } else {
      elements.push(<span key={key++} className="text-slate-200">{token}</span>);
    }
  }

  return elements;
}

export function CodePanel({ code, highlightedLines = [], title, className, maxHeight = '500px' }: CodePanelProps) {
  const lines = code.split('\n');
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (highlightedLines.length > 0 && containerRef.current) {
      const lineIndex = highlightedLines[0] - 1;
      const el = lineRefs.current[lineIndex];
      if (el) {
        const container = containerRef.current;
        const elTop = el.offsetTop;
        const elHeight = el.offsetHeight;
        const containerHeight = container.clientHeight;
        const targetScroll = elTop - containerHeight / 2 + elHeight / 2;
        container.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, [highlightedLines]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-xl border border-slate-700/50 overflow-hidden shadow-lg', className)}>
      {title && (
        <div className="px-4 py-2.5 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs font-medium text-slate-400 ml-2 font-mono">{title}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      )}
      <div
        ref={containerRef}
        className="overflow-auto font-mono text-[14px] leading-7 bg-slate-900 scroll-smooth"
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
                  ? 'bg-sky-500/15 border-l-[3px] border-sky-400'
                  : 'border-l-[3px] border-transparent'
              )}
            >
              <span className="w-10 text-right text-slate-600 select-none mr-4 flex-shrink-0 text-xs leading-7">
                {i + 1}
              </span>
              <span className={cn('whitespace-pre', isHighlighted && 'brightness-125')}>
                {highlightPython(line)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
