// Extended types to support lists and quoted expressions
export type LispExpr =
  | number
  | string
  | LispList
  | QuotedExpr
  | null
  | LispFunction;

export type LispFunction = {
  body: LispExpr;
  env: Environment;
  params: string[];
  type: 'function';
};

export type LispList = {
  elements: LispExpr[];
  type: 'list';
};

export type QuotedExpr = {
  type: 'quoted';
  value: LispExpr;
};
