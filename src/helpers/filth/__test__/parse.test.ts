import { describe, expect, it } from 'bun:test';
import { parse } from '../parse';

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
});
