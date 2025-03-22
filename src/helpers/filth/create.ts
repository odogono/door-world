import { Environment } from './environment';
import { isList } from './helpers';
import { evaluate } from './index';
import { parse } from './parse';
import { LispExpr } from './types';

class EvalEnvironment extends Environment {
  constructor(parent: Environment | null = null) {
    super(parent);
  }

  create(): EvalEnvironment {
    return new EvalEnvironment(this);
  }

  eval(expr: string): LispExpr {
    return evaluate(this, parse(expr));
  }
}

export const create = (): EvalEnvironment => {
  const env = new EvalEnvironment();

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
};
