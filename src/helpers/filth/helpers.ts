import {
  LispBasicValue,
  LispBuiltinFunction,
  LispExpr,
  LispFunction,
  LispList,
  LispValue,
  QuotedExpr
} from './types';

export function parseAtom(token: string): number | string {
  const num = Number(token);
  return Number.isNaN(num) ? token : num;
}

export const isString = (expr: LispExpr): expr is string =>
  typeof expr === 'string';

export function isList(expr: LispExpr): expr is LispList {
  return (
    expr !== null &&
    typeof expr === 'object' &&
    'type' in expr &&
    expr.type === 'list'
  );
}

export const isLispFunction = (expr: LispExpr): expr is LispFunction =>
  expr !== null &&
  typeof expr === 'object' &&
  'type' in expr &&
  expr.type === 'function';

export const isQuotedExpr = (expr: LispExpr): expr is QuotedExpr =>
  expr !== null &&
  typeof expr === 'object' &&
  'type' in expr &&
  expr.type === 'quoted';

export const isLispBasicValue = (expr: LispExpr): expr is LispBasicValue =>
  expr === null || typeof expr === 'number' || typeof expr === 'boolean';

export const isLispValue = (expr: LispExpr): expr is LispValue =>
  typeof expr === 'number' ||
  typeof expr === 'string' ||
  typeof expr === 'boolean';

export const isLispBuiltinFunction = (
  expr: LispExpr
): expr is LispBuiltinFunction =>
  typeof expr === 'function' && 'type' in expr && expr.type === 'builtin';

export const isTruthy = (value: null | false | undefined | string | LispExpr) =>
  value !== null &&
  value !== false &&
  value !== undefined &&
  isLispValue(value) &&
  value !== 'false';

export const isFalsey = (value: null | false | undefined | string | LispExpr) =>
  value === null || value === false || value === undefined || value === 'false';

export function parseLambdaParams(params: LispExpr): string[] {
  if (!isList(params)) {
    throw new Error('Lambda parameters must be a list');
  }

  return params.elements.map(param => {
    if (typeof param !== 'string') {
      throw new Error('Lambda parameters must be symbols');
    }
    return param;
  });
}
