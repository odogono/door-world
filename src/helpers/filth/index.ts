/* eslint-disable no-case-declarations */

import { LispExpr, LispList } from './types';

// Environment to store variables and functions
export class Environment {
  private parent: Environment | null;
  private bindings: Map<string, LispExpr>;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
    this.bindings = new Map();
  }

  define(name: string, value: LispExpr): void {
    this.bindings.set(name, value);
  }

  lookup(name: string): LispExpr {
    if (this.bindings.has(name)) {
      return this.bindings.get(name)!;
    }
    if (this.parent) {
      return this.parent.lookup(name);
    }
    throw new Error(`Undefined symbol: ${name}`);
  }
}

// Enhanced parser with quote support
export function parse(input: string): LispExpr {
  input = input
    .replaceAll('(', ' ( ')
    .replaceAll(')', ' ) ')
    .replaceAll("'", " ' ")
    .trim();
  const tokens = input.split(/\s+/);
  return parseTokens(tokens);
}

function parseAtom(token: string): number | string {
  const num = Number(token);
  return Number.isNaN(num) ? token : num;
}

function parseTokens(tokens: string[]): LispExpr {
  if (tokens.length === 0) {
    throw new Error('Unexpected EOF');
  }

  const token = tokens.shift()!;

  if (token === "'") {
    return {
      type: 'quoted',
      value: parseTokens(tokens)
    };
  }

  if (token === '(') {
    const elements: LispExpr[] = [];
    while (tokens[0] !== ')') {
      if (tokens.length === 0) {
        throw new Error('Missing closing parenthesis');
      }
      elements.push(parseTokens(tokens));
    }
    tokens.shift(); // Remove closing parenthesis
    return { elements, type: 'list' };
  }

  if (token === ')') {
    throw new Error('Unexpected )');
  }

  if (token === 'nil' || token === 'null') {
    return null;
  }

  return parseAtom(token);
}

// Enhanced evaluator with quote and list support
export function evaluate(expr: LispExpr, env: Environment): any {
  if (expr === null) {
    return null;
  }

  if (typeof expr === 'number') {
    return expr;
  }

  if (typeof expr === 'string') {
    return env.lookup(expr);
  }

  if ('type' in expr) {
    if (expr.type === 'quoted') {
      return expr.value;
    }

    if (expr.type === 'list') {
      const [operator, ...args] = expr.elements;

      if (operator === 'quote') {
        return args[0];
      }

      if (typeof operator === 'string') {
        switch (operator) {
          case 'define':
            const [name, value] = args;
            if (typeof name !== 'string') {
              throw new Error('First argument to define must be a symbol');
            }
            env.define(name, evaluate(value, env));
            return null;

          case 'if':
            const [condition, consequent, alternate] = args;
            return evaluate(condition, env)
              ? evaluate(consequent, env)
              : evaluate(alternate, env);

          case 'cons':
            const [car, cdr] = args.map(arg => evaluate(arg, env));
            return {
              elements: [car, ...(isList(cdr) ? cdr.elements : [cdr])],
              type: 'list'
            };

          case 'car':
            const list = evaluate(args[0], env);
            if (!isList(list) || list.elements.length === 0) {
              throw new Error('car: argument must be a non-empty list');
            }
            return list.elements[0];

          case 'cdr':
            const lst = evaluate(args[0], env);
            if (!isList(lst) || lst.elements.length === 0) {
              throw new Error('cdr: argument must be a non-empty list');
            }
            return {
              elements: lst.elements.slice(1),
              type: 'list'
            };

          case 'list':
            return {
              elements: args.map(arg => evaluate(arg, env)),
              type: 'list'
            };

          case 'null?':
            const val = evaluate(args[0], env);
            return isList(val) && val.elements.length === 0;

          case 'lambda':
            if (args.length < 2) {
              throw new Error('Lambda requires parameters and body');
            }
            const [params, ...body] = args;
            const parameters = parseLambdaParams(params);
            return {
              body:
                body.length === 1
                  ? body[0]
                  : { elements: ['begin', ...body], type: 'list' },
              env,
              params: parameters,
              type: 'function'
            };

          default:
            const fn = evaluate(operator, env);
            const evaluatedArgs = args.map(arg => evaluate(arg, env));
            if (
              fn &&
              typeof fn === 'object' &&
              'type' in fn &&
              fn.type === 'function'
            ) {
              // Handle lambda function application
              const newEnv = new Environment(fn.env); // Use the closure environment as parent
              fn.params.forEach((param: string, i: number) => {
                newEnv.define(param, evaluatedArgs[i]);
              });
              return evaluate(fn.body, newEnv);
            }
            return fn(...evaluatedArgs);
        }
      }
    }
  }

  throw new Error(`Cannot evaluate expression: ${JSON.stringify(expr)}`);
}

// Helper function to check if something is a list
const isList = (expr: any): expr is LispList =>
  expr && typeof expr === 'object' && 'type' in expr && expr.type === 'list';

const parseLambdaParams = (params: LispExpr): string[] => {
  if (!isList(params)) {
    throw new Error('Lambda parameters must be a list');
  }

  return params.elements.map(param => {
    if (typeof param !== 'string') {
      throw new Error('Lambda parameters must be symbols');
    }
    return param;
  });
};

// Enhanced environment setup with list operations
export function setupEnvironment(): Environment {
  const env = new Environment();

  // Boolean literals
  env.define('true', true);
  env.define('false', false);

  // Basic arithmetic operations
  env.define('+', (...args: number[]) => args.reduce((a, b) => a + b, 0));
  env.define('-', (...args: number[]) => {
    if (args.length === 0) {
      return 0;
    }
    if (args.length === 1) {
      return -args[0];
    }
    return args.reduce((a, b) => a - b);
  });
  env.define('*', (...args: number[]) => args.reduce((a, b) => a * b, 1));
  env.define('/', (...args: number[]) => {
    if (args.length === 0) {
      return 1;
    }
    if (args.length === 1) {
      return 1 / args[0];
    }
    return args.reduce((a, b) => a / b);
  });

  // List predicates
  env.define('list?', (x: any) => isList(x));
  env.define(
    'equal?',
    (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)
  );

  return env;
}

// REPL function
export const evalString = (input: string, env: Environment): any =>
  evaluate(parse(input), env);

// // Example usage
// const env = setupEnvironment();

// const examples = [
//   // Quote examples
//   "'(1 2 3)",
//   '(quote (a b c))',

//   // List operations
//   '(list 1 2 3)',
//   "(cons 1 '(2 3))",
//   "(car '(1 2 3))",
//   "(cdr '(1 2 3))",

//   // Nested structures
//   "'(1 (2 3) 4)",
//   "(car (cdr '(1 2 3)))",

//   // List predicates
//   "(null? '())",
//   "(null? '(1 2 3))",
//   "(list? '(1 2 3))",

//   // Complex examples
//   "(define x '(1 2 3))",
//   '(car (cdr x))'
// ];

// examples.forEach(example => {
//   console.log(`Input: ${example}`);
//   console.log(`Output:`, evalString(example, env));
//   console.log('---');
// });
