import { createLog } from '@helpers/log';
import { ParseError } from './error';
import { isList } from './helpers';
import { LispExpr } from './types';

const log = createLog('filth/parse');

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

const parseTokens = (tokens: string[]): LispExpr => {
  if (tokens.length === 0) {
    throw new ParseError('Unexpected EOF');
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
        throw new ParseError('Missing closing parenthesis');
      }
      elements.push(parseTokens(tokens));
    }
    tokens.shift(); // Remove closing parenthesis
    return { elements, type: 'list' };
  }

  if (token === ')') {
    throw new ParseError('Unexpected )');
  }

  if (token === 'nil' || token === 'null') {
    return null;
  }

  return parseAtom(token);
};

export const parseAtom = (token: string): number | string => {
  const num = Number(token);
  return Number.isNaN(num) ? token : num;
};

export const parseLambdaParams = (params: LispExpr): string[] => {
  if (!isList(params)) {
    throw new ParseError('Lambda parameters must be a list');
  }

  return params.elements.map(param => {
    if (typeof param !== 'string') {
      throw new ParseError('Lambda parameters must be symbols');
    }
    return param;
  });
};
