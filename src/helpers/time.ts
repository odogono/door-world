export type TimeoutId = ReturnType<typeof setTimeout>;

/**
 * Waits for a given number of milliseconds
 * @param time Number of milliseconds to wait
 * @returns Promise that resolves after the given time
 */
export const waitMs = async (time: number = 1000): Promise<void> =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });

/**
 * Runs a function after a given number of milliseconds
 * @param time Number of milliseconds to wait
 * @param fn Function to run
 */
export const runAfterMs = (time: number, fn: () => void): TimeoutId =>
  setTimeout(() => fn(), time);

export const clearRunAfterMs = (timeoutId: TimeoutId | null | undefined) => {
  if (!timeoutId) {
    return undefined;
  }
  clearTimeout(timeoutId);
  return undefined;
};

/**
 * Creates a debounced version of a function that delays its execution
 * until after `wait` milliseconds have elapsed since the last time it was called.
 *
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param immediate Whether to execute the function on the leading edge instead of the trailing edge
 * @returns A debounced version of the function
 */
export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timeout: TimeoutId | undefined = undefined;

  return function (this: T, ...args: Parameters<T>): void {
    const later = () => {
      timeout = undefined;
      if (!immediate) {
        func.apply(this, args);
      }
    };

    const callNow = immediate && !timeout;

    timeout = clearRunAfterMs(timeout);

    timeout = runAfterMs(wait, later);

    if (callNow) {
      func.apply(this, args);
    }
  };
};

export const timeoutPromise = <T>(promise: Promise<T>, timeoutMs: number) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]);
