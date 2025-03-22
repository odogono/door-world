/* eslint-disable no-case-declarations */

import { createLog } from '@helpers/log';
import { type Environment } from './environment';
import { EvaluationError, LambdaError } from './error';
import {
  isLispBasicValue,
  isLispFunction,
  isList,
  isString,
  isTruthy
} from './helpers';
import { parse, parseLambdaParams } from './parse';
import { LispExpr } from './types';

const log = createLog('filth');

/**
 * Evaluate a string as a Lisp expression
 * @param input - The input string to evaluate
 * @param env - The environment to evaluate the expression in
 * @returns The evaluated Lisp expression
 */
export const evalString = (env: Environment, input: string): LispExpr =>
  evaluate(env, parse(input));

/**
 * Evaluate a Lisp expression
 * @param expr - The Lisp expression to evaluate
 * @param env - The environment to evaluate the expression in
 * @returns The evaluated Lisp expression
 */
export const evaluate = (
  env: Environment,
  expr: LispExpr | string
): LispExpr => {
  if (isLispBasicValue(expr)) {
    return expr;
  }

  if (isString(expr)) {
    const value = env.lookup(expr);
    if (isString(value)) {
      // If the value is another symbol, look it up recursively
      return evaluate(env, value);
    }
    return value;
  }

  if ('type' in expr) {
    if (expr.type === 'quoted') {
      return expr.value;
    }

    if (expr.type === 'list') {
      const [operator, ...args] = expr.elements;

      if (isString(operator)) {
        switch (operator) {
          case 'define':
            const [name, value] = args;
            if (!isString(name)) {
              throw new EvaluationError(
                'First argument to define must be a symbol'
              );
            }
            const evaluatedValue = evaluate(env, value);
            env.define(name, evaluatedValue);
            return evaluatedValue;

          case 'if':
            const [condition, consequent, alternate] = args;
            const evaluatedCondition = evaluate(env, condition);

            // log.debug('[if]', { alternate, condition, consequent });
            // log.debug('[if]', { evaluatedCondition });
            // log.debug(
            //   '[if]',
            //   evaluatedCondition !== null && evaluatedCondition !== false
            // );
            // In Lisp, any non-nil value is considered true
            return isTruthy(evaluatedCondition)
              ? evaluate(env, consequent)
              : evaluate(env, alternate);

          case 'cons':
            const [car, cdr] = args.map(arg => evaluate(env, arg));
            return {
              elements: [car, ...(isList(cdr) ? cdr.elements : [cdr])],
              type: 'list'
            };

          case 'car':
            const list = evaluate(env, args[0]);
            if (!isList(list) || list.elements.length === 0) {
              throw new EvaluationError(
                'car: argument must be a non-empty list'
              );
            }
            return list.elements[0];

          case 'cdr':
            const lst = evaluate(env, args[0]);
            if (!isList(lst) || lst.elements.length === 0) {
              throw new EvaluationError(
                'cdr: argument must be a non-empty list'
              );
            }
            return {
              elements: lst.elements.slice(1),
              type: 'list'
            };

          case 'list':
            return {
              elements: args.map(arg => evaluate(env, arg)),
              type: 'list'
            };

          case 'null?':
            const val = evaluate(env, args[0]);
            return isList(val) && val.elements.length === 0;

          case 'lambda':
            if (args.length < 2) {
              throw new LambdaError('Lambda requires parameters and body');
            }
            const [params, ...body] = args;
            const parameters = parseLambdaParams(params);
            return {
              body:
                body.length === 1
                  ? body[0]
                  : { elements: ['begin', ...body], type: 'list' },
              env: env.create(),
              params: parameters,
              type: 'function'
            };

          default:
            // For non-special forms, evaluate the operator and apply it
            const fn = env.lookup(operator);
            if (typeof fn === 'function') {
              // Handle built-in functions
              return fn(...args.map(arg => evaluate(env, arg)));
            } else if (
              fn &&
              typeof fn === 'object' &&
              'type' in fn &&
              fn.type === 'function'
            ) {
              // Handle lambda function application
              const newEnv = fn.env.create();
              fn.params.forEach((param: string, i: number) => {
                newEnv.define(param, evaluate(env, args[i]));
              });
              return evaluate(newEnv, fn.body);
            } else {
              throw new EvaluationError(
                `Cannot apply ${JSON.stringify(fn)} as a function`
              );
            }
        }
      } else {
        // If the operator is not a string, evaluate it and apply it
        const fn = evaluate(env, operator);
        if (isLispFunction(fn)) {
          // Handle lambda function application
          const newEnv = fn.env.create();
          fn.params.forEach((param: string, i: number) => {
            newEnv.define(param, evaluate(env, args[i]));
          });
          return evaluate(newEnv, fn.body);
        } else if (typeof fn === 'function') {
          // Handle built-in functions
          return fn(...args.map(arg => evaluate(env, arg)));
        } else {
          throw new EvaluationError(
            `Cannot apply ${JSON.stringify(fn)} as a function`
          );
        }
      }
    }
  }

  throw new EvaluationError(
    `Cannot evaluate expression: ${JSON.stringify(expr)}`
  );
};
