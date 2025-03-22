import { LispExpr, LispList } from './types';

export function parseAtom(token: string): number | string {
  const num = Number(token);
  return Number.isNaN(num) ? token : num;
}

export function isList(expr: LispExpr): expr is LispList {
  return (
    expr !== null &&
    typeof expr === 'object' &&
    'type' in expr &&
    expr.type === 'list'
  );
}

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
