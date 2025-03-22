import { describe, expect, it } from 'bun:test';
import { parse } from '../parse';

describe('Lisp Interpreter', () => {
  describe('Parser', () => {
    it('should parse atoms', () => {
      expect(parse('123')).toBe(123);
      expect(parse('-10')).toBe(-10);
      expect(parse('+10')).toBe(10);
      expect(parse('15.234')).toBe(15.234);
      expect(parse('abc')).toBe('abc');
      expect(parse('nil')).toBe(null);
      expect(parse('true')).toBe(true);
      expect(parse('false')).toBe(false);
      expect(parse('"Hello, world!"')).toBe('Hello, world!');
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

    it('should parse multiple top level expressions', () => {
      const result = parse('(1 2 3) (4 5 6)');
      expect(result).toEqual({
        elements: [
          { elements: [1, 2, 3], type: 'list' },
          { elements: [4, 5, 6], type: 'list' }
        ],
        type: 'list'
      });
    });
  });
});
