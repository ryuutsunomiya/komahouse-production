export function mix(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

export function normalize(n: number, a: number, b: number): number {
  return (n - a) / (b - a);
}

export function clamp(n: number, min?: number, max?: number): number {
  return Math.max((min = 0), Math.min((max = 1), n));
}

export function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function zeroPad(value: number | string, length: number): string {
  return String(value).padStart(length, "0");
}
