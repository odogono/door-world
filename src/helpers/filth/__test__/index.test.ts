import { describe, expect, it } from 'bun:test';
import { Environment, evaluate, parse, setupEnvironment } from '../index';

describe('Lisp Interpreter', () => {
  describe('Parser', () => {
    it('should parse atoms', () => {
      expect(parse('123')).toBe(123);
      expect(parse('abc')).toBe('abc');
      expect(parse('nil')).toBe(null);
    });

    it('should parse lists', () => {
      expect(parse('(1 2 3)')).toEqual({
        elements: [1, 2, 3],
        type: 'list'
      });
    });

    it('should parse quoted expressions', () => {
      expect(parse("'(1 2 3)")).toEqual({
        type: 'quoted',
        value: {
          elements: [1, 2, 3],
          type: 'list'
        }
      });
    });

    it('should parse nested structures', () => {
      expect(parse('(1 (2 3) 4)')).toEqual({
        elements: [1, { elements: [2, 3], type: 'list' }, 4],
        type: 'list'
      });
    });
  });

  describe('Environment', () => {
    it('should define and lookup variables', () => {
      const env = new Environment();
      env.define('x', 42);
      expect(env.lookup('x')).toBe(42);
    });

    it('should handle nested environments', () => {
      const parent = new Environment();
      parent.define('x', 42);
      const child = new Environment(parent);
      expect(child.lookup('x')).toBe(42);
    });

    it('should throw on undefined variables', () => {
      const env = new Environment();
      expect(() => env.lookup('x')).toThrow('Undefined symbol: x');
    });
  });

  describe('Evaluator', () => {
    const env = setupEnvironment();

    it('should evaluate basic arithmetic', () => {
      expect(evaluate(parse('(+ 1 2 3)'), env)).toBe(6);
      expect(evaluate(parse('(- 10 3 2)'), env)).toBe(5);
      expect(evaluate(parse('(* 2 3 4)'), env)).toBe(24);
      expect(evaluate(parse('(/ 24 2 3)'), env)).toBe(4);
    });

    it('should evaluate list operations', () => {
      expect(evaluate(parse("(car '(1 2 3))"), env)).toBe(1);
      expect(evaluate(parse("(cdr '(1 2 3))"), env)).toEqual({
        elements: [2, 3],
        type: 'list'
      });
      expect(evaluate(parse("(cons 1 '(2 3))"), env)).toEqual({
        elements: [1, 2, 3],
        type: 'list'
      });
    });

    it('should evaluate conditional expressions', () => {
      expect(evaluate(parse('(if true 1 2)'), env)).toBe(1);
      expect(evaluate(parse('(if false 1 2)'), env)).toBe(2);
    });

    it('should evaluate variable definitions', () => {
      const testEnv = new Environment();
      evaluate(parse('(define x 42)'), testEnv);
      expect(evaluate(parse('x'), testEnv)).toBe(42);
    });

    it('should evaluate lambda expressions', () => {
      const testEnv = setupEnvironment();
      evaluate(parse('(define double (lambda (x) (* x 2)))'), testEnv);
      expect(evaluate(parse('(double 21)'), testEnv)).toBe(42);
    });

    it('should evaluate list predicates', () => {
      expect(evaluate(parse("(list? '(1 2 3))"), env)).toBe(true);
      expect(evaluate(parse("(null? '())"), env)).toBe(true);
      expect(evaluate(parse("(null? '(1 2 3))"), env)).toBe(false);
    });

    it('should evaluate equality checks', () => {
      expect(evaluate(parse("(equal? '(1 2 3) '(1 2 3))"), env)).toBe(true);
      expect(evaluate(parse("(equal? '(1 2) '(1 2 3))"), env)).toBe(false);
    });
  });
});
