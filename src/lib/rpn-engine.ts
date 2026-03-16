export interface StackEntry {
  id: number;
  value: number | string;
}

export interface SimStep {
  tokenIndex: number;
  token: string;
  action: string;
  detail: string;
  stack: StackEntry[];
  highlightLines: number[];
  type: 'init' | 'push' | 'pop' | 'compute' | 'result' | 'error' | 'extract' | 'skip';
  inputMode: 'str' | 'arraystack';
  expStack?: StackEntry[];
  auxStack?: StackEntry[];
  tokensList?: string[];
  skipped?: boolean;
  skipReason?: string;
  // Track creation state
  pilaCreated?: boolean;
  tokensCreated?: boolean;
  auxCreated?: boolean;
}

let _nextId = 0;
function nextId() { return _nextId++; }

export function formatValue(v: number | string): string {
  if (typeof v === 'string') return v;
  if (Number.isInteger(v)) return v.toString();
  return parseFloat(v.toFixed(6)).toString();
}

export function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(6)).toString();
}

export function generateSteps(expression: string, mode: 'str' | 'arraystack' = 'str'): SimStep[] {
  _nextId = 0;
  const rawTokens = expression.trim().split(/\s+/);
  const steps: SimStep[] = [];
  const ops = ['+', '-', '*', '/', '^'];

  // Mutable state
  const pila: StackEntry[] = [];
  let pilaCreated = false;
  let tokensCreated = false;
  const tokensList: string[] = [];
  let auxCreated = false;

  const expStack: StackEntry[] = mode === 'arraystack'
    ? rawTokens.map(t => ({ id: nextId(), value: isNaN(parseFloat(t)) ? t : parseFloat(t) }))
    : [];
  const auxStack: StackEntry[] = [];

  function snap(): Pick<SimStep, 'stack' | 'inputMode' | 'expStack' | 'auxStack' | 'tokensList' | 'pilaCreated' | 'tokensCreated' | 'auxCreated'> {
    return {
      stack: [...pila],
      inputMode: mode,
      expStack: mode === 'arraystack' ? [...expStack] : undefined,
      auxStack: mode === 'arraystack' ? (auxCreated ? [...auxStack] : undefined) : undefined,
      tokensList: tokensCreated ? [...tokensList] : undefined,
      pilaCreated,
      tokensCreated,
      auxCreated: mode === 'arraystack' ? auxCreated : undefined,
    };
  }

  function addStep(p: {
    line: number | number[];
    action: string;
    detail: string;
    type: SimStep['type'];
    tokenIndex?: number;
    token?: string;
    skipped?: boolean;
    skipReason?: string;
  }) {
    const lines = Array.isArray(p.line) ? p.line : [p.line];
    steps.push({
      tokenIndex: p.tokenIndex ?? -1,
      token: p.token ?? '',
      action: p.action,
      detail: p.detail,
      highlightLines: lines,
      type: p.skipped ? 'skip' : p.type,
      skipped: p.skipped,
      skipReason: p.skipReason,
      ...snap(),
    });
  }

  // ═══ LINE 1: def Notacion_Polaca(exp): ═══
  addStep({
    line: 1,
    action: 'Llamada a función',
    detail: mode === 'str'
      ? `Notacion_Polaca("${expression}")`
      : `Notacion_Polaca(exp)  # exp es un ArrayStack con [${rawTokens.join(', ')}]`,
    type: 'init',
  });

  // ═══ TYPE CHECKING: Lines 3-19 ═══
  if (mode === 'str') {
    // Line 3: True
    addStep({ line: 3, action: 'isinstance(exp, str) → True', detail: 'La entrada es una cadena de texto', type: 'init' });

    // Line 4: tokens = exp.split()
    tokensCreated = true;
    tokensList.push(...rawTokens);
    addStep({ line: 4, action: 'tokens = exp.split()', detail: `tokens = [${rawTokens.map(t => `"${t}"`).join(', ')}]`, type: 'init' });

    // Line 6: skipped
    addStep({ line: 6, action: 'elif isinstance(exp, ArrayStack):', detail: 'No se evalúa', type: 'init', skipped: true, skipReason: 'Ya se entró en el bloque if (línea 3)' });

    // Line 18-19: skipped
    addStep({ line: [18, 19], action: 'else: raise TypeError(...)', detail: 'No se evalúa', type: 'init', skipped: true, skipReason: 'Ya se entró en el bloque if (línea 3)' });

  } else {
    // Line 3: False
    addStep({ line: 3, action: 'isinstance(exp, str) → False', detail: 'La entrada no es str', type: 'init', skipped: true, skipReason: 'exp es un ArrayStack, no str' });

    // Line 4: skipped
    addStep({ line: 4, action: 'tokens = exp.split()', detail: 'No se ejecuta', type: 'init', skipped: true, skipReason: 'La condición de línea 3 fue False' });

    // Line 6: True
    addStep({ line: 6, action: 'isinstance(exp, ArrayStack) → True', detail: 'La entrada es un ArrayStack', type: 'init' });

    // Line 7: aux = ArrayStack()
    auxCreated = true;
    addStep({ line: 7, action: 'aux = ArrayStack()', detail: 'Se crea la pila auxiliar vacía', type: 'extract' });

    // Line 8: tokens = []
    tokensCreated = true;
    addStep({ line: 8, action: 'tokens = []', detail: 'Se crea la lista de tokens vacía', type: 'extract' });

    // ── First while loop: exp → aux ──
    addStep({
      line: 10,
      action: 'while not exp.is_empty():',
      detail: `exp tiene ${expStack.length} elementos → True`,
      type: 'extract',
    });

    while (expStack.length > 0) {
      const popped = expStack.pop()!;
      auxStack.push(popped);
      addStep({ line: 11, action: 'aux.push(exp.pop())', detail: `Sacó "${formatValue(popped.value)}" de exp → push a aux`, type: 'extract' });

      addStep({
        line: 10,
        action: 'while not exp.is_empty():',
        detail: expStack.length > 0 ? `exp tiene ${expStack.length} elemento(s) → True` : 'exp vacía → False → sale del bucle',
        type: 'extract',
        skipped: expStack.length === 0,
        skipReason: expStack.length === 0 ? 'exp está vacía, la condición es False' : undefined,
      });
    }

    // ── Second while loop: aux → tokens + exp ──
    addStep({
      line: 13,
      action: 'while not aux.is_empty():',
      detail: `aux tiene ${auxStack.length} elementos → True`,
      type: 'extract',
    });

    while (auxStack.length > 0) {
      const popped = auxStack.pop()!;
      const val = formatValue(popped.value);

      addStep({ line: 14, action: `t = aux.pop()`, detail: `t = "${val}"`, type: 'extract' });

      tokensList.push(String(val));
      addStep({ line: 15, action: `tokens.append(t)`, detail: `tokens = [${tokensList.map(t => `"${t}"`).join(', ')}]`, type: 'extract' });

      expStack.push({ id: nextId(), value: popped.value });
      addStep({ line: 16, action: `exp.push(t)`, detail: `exp.push("${val}") → exp tiene ${expStack.length} elemento(s)`, type: 'extract' });

      addStep({
        line: 13,
        action: 'while not aux.is_empty():',
        detail: auxStack.length > 0 ? `aux tiene ${auxStack.length} elemento(s) → True` : 'aux vacía → False → sale del bucle',
        type: 'extract',
        skipped: auxStack.length === 0,
        skipReason: auxStack.length === 0 ? 'aux está vacía, la condición es False' : undefined,
      });
    }

    // Line 18-19: skipped
    addStep({ line: [18, 19], action: 'else: raise TypeError(...)', detail: 'No se evalúa', type: 'init', skipped: true, skipReason: 'Ya se ejecutó el bloque elif (línea 6)' });
  }

  // ═══ LINE 21: pila = ArrayStack() ═══
  pilaCreated = true;
  addStep({ line: 21, action: 'pila = ArrayStack()', detail: 'Se crea la pila de evaluación vacía', type: 'init' });

  // ═══ TOKEN LOOP: Lines 23-49 ═══
  const tokens = [...tokensList];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Line 23: for token in tokens
    addStep({ line: 23, action: 'for token in tokens:', detail: `token = "${token}" (${i + 1} de ${tokens.length})`, type: 'init', tokenIndex: i, token });

    if (ops.includes(token)) {
      // Line 25: operator check → True
      addStep({ line: 25, action: `token in ["+", "-", "*", "/", "^"] → True`, detail: `"${token}" es un operador`, type: 'init', tokenIndex: i, token });

      // Line 27: len check
      if (pila.length < 2) {
        addStep({ line: 27, action: `len(pila) < 2 → True`, detail: `len(pila) = ${pila.length}`, type: 'error', tokenIndex: i, token });
        addStep({ line: 28, action: '❌ raise ValueError("Error: faltan operandos")', detail: `No hay suficientes operandos en la pila`, type: 'error', tokenIndex: i, token });
        return steps;
      }

      addStep({ line: 27, action: `len(pila) < 2 → False`, detail: `len(pila) = ${pila.length} ≥ 2 ✓`, type: 'init', tokenIndex: i, token });

      // Line 30: b = pila.pop()
      const bEntry = pila.pop()!;
      addStep({ line: 30, action: `b = pila.pop()`, detail: `b = ${formatValue(bEntry.value)}`, type: 'pop', tokenIndex: i, token });

      // Line 31: a = pila.pop()
      const aEntry = pila.pop()!;
      addStep({ line: 31, action: `a = pila.pop()`, detail: `a = ${formatValue(aEntry.value)}`, type: 'pop', tokenIndex: i, token });

      const a = aEntry.value as number;
      const b = bEntry.value as number;
      let result!: number;

      // Operator matching: lines 33-42
      const opInfo: { op: string; checkLine: number; execLine: number; sym: string }[] = [
        { op: '+', checkLine: 33, execLine: 34, sym: '+' },
        { op: '-', checkLine: 35, execLine: 36, sym: '-' },
        { op: '*', checkLine: 37, execLine: 38, sym: '*' },
        { op: '/', checkLine: 39, execLine: 40, sym: '/' },
        { op: '^', checkLine: 41, execLine: 42, sym: '**' },
      ];

      let matched = false;
      for (const info of opInfo) {
        if (matched) {
          // After match: skip
          addStep({
            line: info.checkLine, action: `elif token == "${info.op}":`,
            detail: 'No se evalúa', type: 'init', skipped: true,
            skipReason: `Ya se encontró coincidencia`, tokenIndex: i, token,
          });
        } else if (info.op === token) {
          // Match!
          addStep({
            line: info.checkLine,
            action: `${info.op === '+' ? 'if' : 'elif'} token == "${info.op}" → True`,
            detail: `Coincide: operación ${info.sym}`,
            type: 'init', tokenIndex: i, token,
          });

          switch (token) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': result = a / b; break;
            case '^': result = Math.pow(a, b); break;
          }

          pila.push({ id: nextId(), value: result });
          addStep({
            line: info.execLine,
            action: `pila.push(${formatNumber(a)} ${info.sym} ${formatNumber(b)})`,
            detail: `pila.push(${formatNumber(result)})`,
            type: 'compute', tokenIndex: i, token,
          });

          matched = true;
        } else {
          // Before match: doesn't match
          addStep({
            line: info.checkLine,
            action: `${info.op === '+' ? 'if' : 'elif'} token == "${info.op}" → False`,
            detail: `"${token}" ≠ "${info.op}"`,
            type: 'init', skipped: true,
            skipReason: `El operador es "${token}", no "${info.op}"`,
            tokenIndex: i, token,
          });
        }
      }

      // Line 44: else → skipped
      addStep({ line: 44, action: 'else:', detail: 'No aplica: token es operador', type: 'init', skipped: true, skipReason: 'Se entró en el bloque if (línea 25)', tokenIndex: i, token });

    } else {
      // Number or invalid token
      // Line 25: False
      addStep({ line: 25, action: `token in ["+", "-", "*", "/", "^"] → False`, detail: `"${token}" no es un operador`, type: 'init', tokenIndex: i, token });

      // Line 44: else
      addStep({ line: 44, action: 'else:', detail: 'Se entra en el bloque else', type: 'init', tokenIndex: i, token });

      // Line 45: try
      addStep({ line: 45, action: 'try:', detail: 'Intentar convertir a número', type: 'init', tokenIndex: i, token });

      const num = parseFloat(token);

      if (isNaN(num)) {
        // Line 46: float fails
        addStep({ line: 46, action: `float("${token}") → Error`, detail: 'No es un número válido', type: 'error', tokenIndex: i, token });
        addStep({ line: 48, action: 'except:', detail: 'Se captura la excepción', type: 'error', tokenIndex: i, token });
        addStep({ line: 49, action: '❌ raise ValueError("Error: operador inválido")', detail: `"${token}" no es válido`, type: 'error', tokenIndex: i, token });
        return steps;
      }

      // Line 46: float succeeds
      addStep({ line: 46, action: `numero = float("${token}")`, detail: `numero = ${formatNumber(num)}`, type: 'init', tokenIndex: i, token });

      // Line 47: push
      pila.push({ id: nextId(), value: num });
      addStep({ line: 47, action: `pila.push(${formatNumber(num)})`, detail: `Se agrega ${formatNumber(num)} a la pila`, type: 'push', tokenIndex: i, token });

      // Line 48: except → skipped
      addStep({ line: [48, 49], action: 'except: raise ValueError(...)', detail: 'No hubo excepción', type: 'init', skipped: true, skipReason: 'float() se ejecutó correctamente', tokenIndex: i, token });
    }
  }

  // ═══ FINAL: Lines 51-59 ═══
  if (pila.length > 1) {
    addStep({ line: 51, action: `len(pila) > 1 → True`, detail: `len(pila) = ${pila.length}`, type: 'error' });
    addStep({ line: 52, action: '❌ raise ValueError("Error: demasiados operandos")', detail: `Quedan ${pila.length} valores en la pila`, type: 'error' });
    return steps;
  }

  addStep({ line: 51, action: `len(pila) > 1 → False`, detail: `len(pila) = ${pila.length} ✓`, type: 'init' });

  if (pila.length === 1) {
    const resultado = pila.pop()!.value as number;
    addStep({ line: 54, action: `resultado = pila.pop()`, detail: `resultado = ${formatNumber(resultado)}`, type: 'result' });

    if (Number.isInteger(resultado)) {
      addStep({ line: 56, action: `resultado.is_integer() → True`, detail: `${formatNumber(resultado)} es entero`, type: 'result' });
      addStep({ line: 57, action: `✅ return int(resultado)`, detail: `Resultado final: ${Math.floor(resultado)}`, type: 'result' });
    } else {
      addStep({ line: 56, action: `resultado.is_integer() → False`, detail: `${formatNumber(resultado)} tiene decimales`, type: 'result' });
      addStep({ line: 59, action: `✅ return resultado`, detail: `Resultado final: ${formatNumber(resultado)}`, type: 'result' });
    }
  }

  return steps;
}

export const ARRAY_STACK_CODE = `class Empty(Exception):
    """Error attempting to access an element from an empty container."""
    pass


class ArrayStack:
    """LIFO Stack implementation using a Python list as underlying storage."""

    def __init__(self):             # __ Dunder (double under = método mágico)
        """Create an empty stack."""
        self._data = []  # nonpublic list instance

    def __len__(self):
        """Return the number of elements in the stack."""
        return len(self._data)

    def is_empty(self):
        """Return True if the stack is empty."""
        return len(self._data) == 0

    def push(self, e):
        """Add element e to the top of the stack."""
        self._data.append(e)

    def top(self):
        """
        Return (but do not remove) the element at the top of the stack.

        Raise Empty exception if the stack is empty.
        """
        if self.is_empty():
            raise Empty('Stack is empty')   # Diferente al IndexError de una lista vacía. La definición de Pilas no tienen "índices".
        return self._data[-1]

    def pop(self):
        """
        Remove and return the element from the top of the stack (i.e., LIFO).

        Raise Empty exception if the stack is empty.
        """
        if self.is_empty():
            raise Empty('Stack is empty')
        return self._data.pop()

#------------------------------------------------------
    #def __str__(self):
      #return str(self._data)


    #def __repr__(self):
      #return self._data`;

export const NOTACION_POLACA_CODE = `def Notacion_Polaca(exp):

    if isinstance(exp, str):
        tokens = exp.split()

    elif isinstance(exp, ArrayStack):
        aux = ArrayStack()
        tokens = []

        while not exp.is_empty():
            aux.push(exp.pop())

        while not aux.is_empty():
            t = aux.pop()
            tokens.append(t)
            exp.push(t)

    else:
        raise TypeError("Tipo de entrada inválido")

    pila = ArrayStack()

    for token in tokens:

        if token in ["+", "-", "*", "/", "^"]:

            if len(pila) < 2:
                raise ValueError("Error: faltan operandos")

            b = pila.pop()
            a = pila.pop()

            if token == "+":
                pila.push(a + b)
            elif token == "-":
                pila.push(a - b)
            elif token == "*":
                pila.push(a * b)
            elif token == "/":
                pila.push(a / b)
            elif token == "^":
                pila.push(a ** b)

        else:
            try:
                numero = float(token)
                pila.push(numero)
            except:
                raise ValueError("Error: operador inválido")

    if len(pila) > 1:
        raise ValueError("Error: demasiados operandos")

    resultado = pila.pop()

    if resultado.is_integer():
        return int(resultado)

    return resultado`;
