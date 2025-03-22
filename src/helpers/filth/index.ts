/* eslint-disable no-case-declarations */

import { createLog } from '@helpers/log';
import { Environment as EnvironmentImpl } from './environment';
import {
  isLispBasicValue,
  isLispFunction,
  isList,
  isString,
  isTruthy,
  parseAtom,
  parseLambdaParams
} from './helpers';
import { LispExpr } from './types';

const log = createLog('filth');

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
export function evaluate(expr: LispExpr, env: EnvironmentImpl): LispExpr {
  if (isLispBasicValue(expr)) {
    return expr;
  }

  if (isString(expr)) {
    const value = env.lookup(expr);
    if (isString(value)) {
      // If the value is another symbol, look it up recursively
      return evaluate(value, env);
    }
    return value;
  }

  if ('type' in expr) {
    if (expr.type === 'quoted') {
      return expr.value;
    }

    if (expr.type === 'list') {
      const [operator, ...args] = expr.elements;

      if (typeof operator === 'string') {
        switch (operator) {
          case 'define':
            const [name, value] = args;
            if (typeof name !== 'string') {
              throw new Error('First argument to define must be a symbol');
            }
            const evaluatedValue = evaluate(value, env);
            env.define(name, evaluatedValue);
            return evaluatedValue;

          case 'if':
            const [condition, consequent, alternate] = args;
            const evaluatedCondition = evaluate(condition, env);

            // log.debug('[if]', { alternate, condition, consequent });
            // log.debug('[if]', { evaluatedCondition });
            // log.debug(
            //   '[if]',
            //   evaluatedCondition !== null && evaluatedCondition !== false
            // );
            // In Lisp, any non-nil value is considered true
            return isTruthy(evaluatedCondition)
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
              env: new EnvironmentImpl(env),
              params: parameters,
              type: 'function'
            };

          default:
            // For non-special forms, evaluate the operator and apply it
            const fn = env.lookup(operator);
            if (typeof fn === 'function') {
              // Handle built-in functions
              return fn(...args.map(arg => evaluate(arg, env)));
            } else if (
              fn &&
              typeof fn === 'object' &&
              'type' in fn &&
              fn.type === 'function'
            ) {
              // Handle lambda function application
              const newEnv = new EnvironmentImpl(fn.env);
              fn.params.forEach((param: string, i: number) => {
                newEnv.define(param, evaluate(args[i], env));
              });
              return evaluate(fn.body, newEnv);
            } else {
              throw new Error(
                `Cannot apply ${JSON.stringify(fn)} as a function`
              );
            }
        }
      } else {
        // If the operator is not a string, evaluate it and apply it
        const fn = evaluate(operator, env);
        if (isLispFunction(fn)) {
          // Handle lambda function application
          const newEnv = new EnvironmentImpl(fn.env);
          fn.params.forEach((param: string, i: number) => {
            newEnv.define(param, evaluate(args[i], newEnv));
          });
          return evaluate(fn.body, newEnv);
        } else if (typeof fn === 'function') {
          // Handle built-in functions
          return fn(...args.map(arg => evaluate(arg, env)));
        } else {
          throw new Error(`Cannot apply ${JSON.stringify(fn)} as a function`);
        }
      }
    }
  }

  throw new Error(`Cannot evaluate expression: ${JSON.stringify(expr)}`);
}

// Enhanced environment setup with list operations
export function setupEnvironment(): EnvironmentImpl {
  const env = new EnvironmentImpl();

  // Boolean literals
  env.define('true', true);
  env.define('false', false);

  // Basic arithmetic operations
  env.define('+', (...args: LispExpr[]) =>
    args.reduce((a, b) => (a as number) + (b as number), 0)
  );
  env.define('-', (...args: LispExpr[]) => {
    if (args.length === 0) {
      return 0;
    }
    if (args.length === 1) {
      return -(args[0] as number);
    }
    return args.reduce((a, b) => (a as number) - (b as number));
  });
  env.define('*', (...args: LispExpr[]) =>
    args.reduce((a, b) => (a as number) * (b as number), 1)
  );
  env.define('/', (...args: LispExpr[]) => {
    if (args.length === 0) {
      return 1;
    }
    if (args.length === 1) {
      return 1 / (args[0] as number);
    }
    return args.reduce((a, b) => (a as number) / (b as number));
  });

  // List predicates
  env.define('list?', (x: LispExpr) => isList(x));
  env.define(
    'equal?',
    (a: LispExpr, b: LispExpr) => JSON.stringify(a) === JSON.stringify(b)
  );

  return env;
}

// REPL function
export const evalString = (input: string, env: EnvironmentImpl): LispExpr =>
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
