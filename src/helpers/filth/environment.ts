import { UndefinedSymbolError } from './error';
import { LispExpr } from './types';

export class Environment {
  private bindings: Map<string, LispExpr> = new Map();
  private parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  define(name: string, value: LispExpr): void {
    this.bindings.set(name, value);
  }

  lookup(name: string): LispExpr {
    const value = this.bindings.get(name);
    if (value !== undefined) {
      return value;
    }
    if (this.parent) {
      return this.parent.lookup(name);
    }
    throw new UndefinedSymbolError(name);
  }

  create(): Environment {
    return new Environment(this);
  }
}
