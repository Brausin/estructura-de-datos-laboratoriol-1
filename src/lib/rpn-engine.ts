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
  type: 'init' | 'push' | 'pop' | 'compute' | 'result' | 'error' | 'extract';
  // For ArrayStack mode: show intermediate data structures
  inputMode: 'str' | 'arraystack';
  expStack?: StackEntry[];    // exp (original input stack)
  auxStack?: StackEntry[];    // aux (auxiliary stack)
  tokensList?: string[];      // tokens list being built
}

let _nextId = 0;
function nextId() { return _nextId++; }

export function formatValue(v: number | string): string {
  if (typeof v === 'string') return v;
  if (Number.isInteger(v)) return v.toString();
  return parseFloat(v.toFixed(6)).toString();
}

// Keep backward compat
export function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(6)).toString();
}

function makeBaseStep(inputMode: 'str' | 'arraystack'): Pick<SimStep, 'inputMode' | 'expStack' | 'auxStack' | 'tokensList'> {
  return { inputMode, expStack: undefined, auxStack: undefined, tokensList: undefined };
}

export function generateSteps(expression: string, mode: 'str' | 'arraystack' = 'str'): SimStep[] {
  _nextId = 0;
  const rawTokens = expression.trim().split(/\s+/);
  const steps: SimStep[] = [];
  const stack: StackEntry[] = [];
  const ops = ['+', '-', '*', '/', '^'];

  if (mode === 'arraystack') {
    // Simulate: exp is an ArrayStack already containing the tokens
    // We show the extraction process with aux stack
    const expStack: StackEntry[] = rawTokens.map(t => ({ id: nextId(), value: isNaN(parseFloat(t)) ? t : parseFloat(t) }));
    const auxStack: StackEntry[] = [];
    const tokensList: string[] = [];

    // Step: isinstance check
    steps.push({
      tokenIndex: -1, token: '',
      action: 'Verificar tipo de entrada',
      detail: 'isinstance(exp, ArrayStack) → True',
      stack: [],
      highlightLines: [5, 6],
      type: 'init',
      inputMode: 'arraystack',
      expStack: [...expStack],
      auxStack: [...auxStack],
      tokensList: [...tokensList],
    });

    // Step: create aux and tokens
    steps.push({
      tokenIndex: -1, token: '',
      action: 'Crear auxiliares',
      detail: 'aux = ArrayStack()   tokens = []',
      stack: [],
      highlightLines: [6, 7],
      type: 'init',
      inputMode: 'arraystack',
      expStack: [...expStack],
      auxStack: [...auxStack],
      tokensList: [...tokensList],
    });

    // First while: pop from exp, push to aux (reverses order)
    steps.push({
      tokenIndex: -1, token: '',
      action: 'Bucle 1: Vaciar exp → aux',
      detail: 'while not exp.is_empty(): aux.push(exp.pop())',
      stack: [],
      highlightLines: [9, 10],
      type: 'extract',
      inputMode: 'arraystack',
      expStack: [...expStack],
      auxStack: [...auxStack],
      tokensList: [...tokensList],
    });

    while (expStack.length > 0) {
      const popped = expStack.pop()!;
      auxStack.push(popped);
      steps.push({
        tokenIndex: -1, token: '',
        action: `exp.pop() → "${formatValue(popped.value)}" → aux.push()`,
        detail: `aux.push(exp.pop())`,
        stack: [],
        highlightLines: [10],
        type: 'extract',
        inputMode: 'arraystack',
        expStack: [...expStack],
        auxStack: [...auxStack],
        tokensList: [...tokensList],
      });
    }

    // Second while: pop from aux, append to tokens, push back to exp
    steps.push({
      tokenIndex: -1, token: '',
      action: 'Bucle 2: aux → tokens + exp',
      detail: 'while not aux.is_empty(): t = aux.pop(); tokens.append(t); exp.push(t)',
      stack: [],
      highlightLines: [12, 13, 14, 15],
      type: 'extract',
      inputMode: 'arraystack',
      expStack: [...expStack],
      auxStack: [...auxStack],
      tokensList: [...tokensList],
    });

    while (auxStack.length > 0) {
      const popped = auxStack.pop()!;
      tokensList.push(String(formatValue(popped.value)));
      expStack.push({ id: nextId(), value: popped.value });
      steps.push({
        tokenIndex: -1, token: '',
        action: `t = aux.pop() → "${formatValue(popped.value)}"`,
        detail: `tokens.append("${formatValue(popped.value)}") + exp.push("${formatValue(popped.value)}")`,
        stack: [],
        highlightLines: [13, 14, 15],
        type: 'extract',
        inputMode: 'arraystack',
        expStack: [...expStack],
        auxStack: [...auxStack],
        tokensList: [...tokensList],
      });
    }

    // Now tokens are ready, continue with normal evaluation
    steps.push({
      tokenIndex: -1, token: '',
      action: 'Tokens extraídos ✓',
      detail: `tokens = [${tokensList.map(t => `"${t}"`).join(', ')}]`,
      stack: [],
      highlightLines: [20],
      type: 'init',
      inputMode: 'arraystack',
      expStack: [...expStack],
      auxStack: [...auxStack],
      tokensList: [...tokensList],
    });

    // Create pila
    steps.push({
      tokenIndex: -1, token: '',
      action: 'Crear pila vacía',
      detail: 'pila = ArrayStack()',
      stack: [...stack],
      highlightLines: [20],
      type: 'init',
      inputMode: 'arraystack',
      expStack: [...expStack],
      auxStack: [...auxStack],
      tokensList: [...tokensList],
    });

    // Process tokens (same logic as str mode but with arraystack metadata)
    const tokens = tokensList;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (ops.includes(token)) {
        steps.push({
          tokenIndex: i, token,
          action: `Token: "${token}" (operador)`,
          detail: `token in ["+", "-", "*", "/", "^"] → True`,
          stack: [...stack],
          highlightLines: [22, 24],
          type: 'init',
          inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
        });

        if (stack.length < 2) {
          steps.push({
            tokenIndex: i, token,
            action: '❌ Error: faltan operandos',
            detail: `len(pila) = ${stack.length} < 2`,
            stack: [...stack],
            highlightLines: [26, 27],
            type: 'error',
            inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
          });
          return steps;
        }

        const bEntry = stack.pop()!;
        steps.push({
          tokenIndex: i, token,
          action: `pop() → ${formatValue(bEntry.value)}`,
          detail: `b = pila.pop() → ${formatValue(bEntry.value)}`,
          stack: [...stack],
          highlightLines: [29],
          type: 'pop',
          inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
        });

        const aEntry = stack.pop()!;
        steps.push({
          tokenIndex: i, token,
          action: `pop() → ${formatValue(aEntry.value)}`,
          detail: `a = pila.pop() → ${formatValue(aEntry.value)}`,
          stack: [...stack],
          highlightLines: [30],
          type: 'pop',
          inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
        });

        const a = aEntry.value as number, b = bEntry.value as number;
        let result: number;
        let opLines: number[];

        switch (token) {
          case '+': result = a + b; opLines = [32, 33]; break;
          case '-': result = a - b; opLines = [34, 35]; break;
          case '*': result = a * b; opLines = [36, 37]; break;
          case '/': result = a / b; opLines = [38, 39]; break;
          case '^': result = Math.pow(a, b); opLines = [40, 41]; break;
          default: result = 0; opLines = [32, 33];
        }

        const resultEntry = { id: nextId(), value: result };
        stack.push(resultEntry);

        steps.push({
          tokenIndex: i, token,
          action: `${formatNumber(a)} ${token === '^' ? '**' : token} ${formatNumber(b)} = ${formatNumber(result)}`,
          detail: `pila.push(${formatNumber(result)})`,
          stack: [...stack],
          highlightLines: opLines,
          type: 'compute',
          inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
        });

      } else {
        const num = parseFloat(token);

        if (isNaN(num)) {
          steps.push({
            tokenIndex: i, token,
            action: `Token: "${token}"`,
            detail: 'No es número ni operador válido',
            stack: [...stack],
            highlightLines: [22, 43, 44, 45],
            type: 'init',
            inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
          });
          steps.push({
            tokenIndex: i, token,
            action: `❌ Error: operador inválido`,
            detail: `"${token}" no es un token válido`,
            stack: [...stack],
            highlightLines: [47, 48],
            type: 'error',
            inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
          });
          return steps;
        }

        steps.push({
          tokenIndex: i, token,
          action: `Token: "${token}" (número)`,
          detail: `numero = float("${token}") → ${formatNumber(num)}`,
          stack: [...stack],
          highlightLines: [22, 43, 44, 45],
          type: 'init',
          inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
        });

        const entry = { id: nextId(), value: num };
        stack.push(entry);

        steps.push({
          tokenIndex: i, token,
          action: `push(${formatNumber(num)})`,
          detail: `pila.push(${formatNumber(num)})`,
          stack: [...stack],
          highlightLines: [46],
          type: 'push',
          inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
        });
      }
    }

    if (stack.length > 1) {
      steps.push({
        tokenIndex: tokens.length, token: '',
        action: '❌ Error: demasiados operandos',
        detail: `len(pila) = ${stack.length} > 1`,
        stack: [...stack],
        highlightLines: [50, 51],
        type: 'error',
        inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
      });
      return steps;
    }

    if (stack.length === 1) {
      const resultado = stack[0].value as number;
      steps.push({
        tokenIndex: tokens.length, token: '',
        action: `✅ Resultado: ${formatNumber(resultado)}`,
        detail: `resultado = pila.pop() → ${formatNumber(resultado)}`,
        stack: [],
        highlightLines: [53, 55, 56],
        type: 'result',
        inputMode: 'arraystack', expStack: [...expStack], auxStack: [], tokensList: [...tokensList],
      });
    }

    return steps;
  }

  // === STR MODE (original) ===
  const tokens = rawTokens;
  const base = makeBaseStep('str');

  steps.push({
    tokenIndex: -1, token: '',
    action: 'Verificar tipo de entrada',
    detail: `isinstance(exp, str) → True`,
    stack: [...stack],
    highlightLines: [2],
    type: 'init',
    ...base,
  });

  steps.push({
    tokenIndex: -1, token: '',
    action: 'Obtener tokens',
    detail: `tokens = "${expression}".split() → [${tokens.map(t => `"${t}"`).join(', ')}]`,
    stack: [...stack],
    highlightLines: [3],
    type: 'init',
    ...base,
  });

  steps.push({
    tokenIndex: -1, token: '',
    action: 'Crear pila vacía',
    detail: 'pila = ArrayStack()',
    stack: [...stack],
    highlightLines: [20],
    type: 'init',
    ...base,
  });

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (ops.includes(token)) {
      steps.push({
        tokenIndex: i, token,
        action: `Token: "${token}" (operador)`,
        detail: `token in ["+", "-", "*", "/", "^"] → True`,
        stack: [...stack],
        highlightLines: [22, 24],
        type: 'init',
        ...base,
      });

      if (stack.length < 2) {
        steps.push({
          tokenIndex: i, token,
          action: '❌ Error: faltan operandos',
          detail: `len(pila) = ${stack.length} < 2`,
          stack: [...stack],
          highlightLines: [26, 27],
          type: 'error',
          ...base,
        });
        return steps;
      }

      const bEntry = stack.pop()!;
      steps.push({
        tokenIndex: i, token,
        action: `pop() → ${formatValue(bEntry.value)}`,
        detail: `b = pila.pop() → ${formatValue(bEntry.value)}`,
        stack: [...stack],
        highlightLines: [29],
        type: 'pop',
        ...base,
      });

      const aEntry = stack.pop()!;
      steps.push({
        tokenIndex: i, token,
        action: `pop() → ${formatValue(aEntry.value)}`,
        detail: `a = pila.pop() → ${formatValue(aEntry.value)}`,
        stack: [...stack],
        highlightLines: [30],
        type: 'pop',
        ...base,
      });

      const a = aEntry.value as number, b = bEntry.value as number;
      let result: number;
      let opLines: number[];

      switch (token) {
        case '+': result = a + b; opLines = [32, 33]; break;
        case '-': result = a - b; opLines = [34, 35]; break;
        case '*': result = a * b; opLines = [36, 37]; break;
        case '/': result = a / b; opLines = [38, 39]; break;
        case '^': result = Math.pow(a, b); opLines = [40, 41]; break;
        default: result = 0; opLines = [32, 33];
      }

      const resultEntry = { id: nextId(), value: result };
      stack.push(resultEntry);

      steps.push({
        tokenIndex: i, token,
        action: `${formatNumber(a)} ${token === '^' ? '**' : token} ${formatNumber(b)} = ${formatNumber(result)}`,
        detail: `pila.push(${formatNumber(result)})`,
        stack: [...stack],
        highlightLines: opLines,
        type: 'compute',
        ...base,
      });

    } else {
      const num = parseFloat(token);

      if (isNaN(num)) {
        steps.push({
          tokenIndex: i, token,
          action: `Token: "${token}"`,
          detail: 'No es número ni operador válido',
          stack: [...stack],
          highlightLines: [22, 43, 44, 45],
          type: 'init',
          ...base,
        });
        steps.push({
          tokenIndex: i, token,
          action: `❌ Error: operador inválido`,
          detail: `"${token}" no es un token válido`,
          stack: [...stack],
          highlightLines: [47, 48],
          type: 'error',
          ...base,
        });
        return steps;
      }

      steps.push({
        tokenIndex: i, token,
        action: `Token: "${token}" (número)`,
        detail: `numero = float("${token}") → ${formatNumber(num)}`,
        stack: [...stack],
        highlightLines: [22, 43, 44, 45],
        type: 'init',
        ...base,
      });

      const entry = { id: nextId(), value: num };
      stack.push(entry);

      steps.push({
        tokenIndex: i, token,
        action: `push(${formatNumber(num)})`,
        detail: `pila.push(${formatNumber(num)})`,
        stack: [...stack],
        highlightLines: [46],
        type: 'push',
        ...base,
      });
    }
  }

  if (stack.length > 1) {
    steps.push({
      tokenIndex: tokens.length, token: '',
      action: '❌ Error: demasiados operandos',
      detail: `len(pila) = ${stack.length} > 1`,
      stack: [...stack],
      highlightLines: [50, 51],
      type: 'error',
      ...base,
    });
    return steps;
  }

  if (stack.length === 1) {
    const resultado = stack[0].value as number;
    steps.push({
      tokenIndex: tokens.length, token: '',
      action: `✅ Resultado: ${formatNumber(resultado)}`,
      detail: `resultado = pila.pop() → ${formatNumber(resultado)}`,
      stack: [],
      highlightLines: [53, 55, 56],
      type: 'result',
      ...base,
    });
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
