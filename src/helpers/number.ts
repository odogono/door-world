export const roundNumberToDecimalPlaces = (
  number: number,
  places: number = 3
): number => {
  const h = Math.pow(10, places);
  return Math.round(number * h) / h;
};

export const safeParseInt = (
  value: string | undefined,
  defaultTo: number = -1
): number => {
  if (!value) {
    return defaultTo;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultTo : parsed;
};

export const safeParseFloat = (
  value: string,
  defaultTo: number = 0
): number => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? defaultTo : parsed;
};

export const integerToString = (value: number = 0) => {
  return Math.round(value).toString();
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !Number.isNaN(value);
};
