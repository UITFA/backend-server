import { Transform } from 'class-transformer';

export function ToArrayTransformer() {
  return Transform(({ value }) => {
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',');
    }
    if (value && !Array.isArray(value)) {
      return [value];
    }
    return value;
  });
}
