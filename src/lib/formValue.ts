import type { FormFieldValue } from '../types/form';

export function getInputValue(
  value: FormFieldValue,
  fallback: string | number = ''
): string | number {
  if (typeof value === 'string') {
    return value === '' ? fallback : value;
  }

  if (typeof value === 'number') {
    return value;
  }

  return fallback;
}
