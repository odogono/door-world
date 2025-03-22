import { describe, expect, it } from 'bun:test';
import { create } from '../create';
import { Environment } from '../environment';

describe('Lisp Interpreter', () => {
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
    const env = create();

    it('should evaluate basic arithmetic', () => {
      expect(env.eval('(+ 1 2 3)')).toBe(6);
      expect(env.eval('(- 10 3 2)')).toBe(5);
      expect(env.eval('(* 2 3 4)')).toBe(24);
      expect(env.eval('(/ 24 2 3)')).toBe(4);
    });

    it('should evaluate list operations', () => {
      expect(env.eval("(car '(1 2 3))")).toBe(1);
      expect(env.eval("(cdr '(1 2 3))")).toEqual({
        elements: [2, 3],
        type: 'list'
      });
      expect(env.eval("(cons 1 '(2 3))")).toEqual({
        elements: [1, 2, 3],
        type: 'list'
      });
    });

    it('should evaluate conditional expressions', () => {
      expect(env.eval('(if true 1 2)')).toBe(1);
      expect(env.eval('(if false 1 2)')).toBe(2);
    });

    it('should evaluate variable definitions', () => {
      const testEnv = create();
      testEnv.eval('(define x 42)');
      expect(testEnv.eval('x')).toBe(42);
    });

    it('should evaluate lambda expressions', () => {
      const testEnv = create();
      testEnv.eval('(define double (lambda (x) (* x 2)))');
      expect(testEnv.eval('(double 21)')).toBe(42);
    });

    it('should evaluate list predicates', () => {
      expect(env.eval("(list? '(1 2 3))")).toBe(true);
      expect(env.eval("(null? '())")).toBe(true);
      expect(env.eval("(null? '(1 2 3))")).toBe(false);
    });

    it('should evaluate equality checks', () => {
      expect(env.eval("(equal? '(1 2 3) '(1 2 3))")).toBe(true);
      expect(env.eval("(equal? '(1 2) '(1 2 3))")).toBe(false);
    });
  });
});
