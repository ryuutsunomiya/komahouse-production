export function customEase(p1x: number, p1y: number, p2x: number, p2y: number) {
  return function (t: number) {
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;

    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;

    let x = t;

    for (let i = 0; i < 5; i++) {
      const f = ((ax * x + bx) * x + cx) * x - t;
      const df = (3 * ax * x + 2 * bx) * x + cx;
      x -= f / df;
    }

    return ((ay * x + by) * x + cy) * x;
  };
}

export function power1In(t: number) {
  return t ** 2;
}
export function power1Out(t: number) {
  return 1 - (1 - t) ** 2;
}
export function power1InOut(t: number) {
  return t < 0.5 ? 2 * t ** 2 : 1 - (-2 * t + 2) ** 2 / 2;
}

export function power3In(t: number) {
  return t ** 3;
}
export function power3Out(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
export function power3InOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function backIn(t: number, s = 1.70158) {
  return (s + 1) * t ** 3 - s * t ** 2;
}
export function backOut(t: number, s = 1.70158) {
  return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
}
export function backInOut(t: number, s = 1.70158) {
  s *= 1.525;
  return t < 0.5 ? ((2 * t) ** 2 * ((s + 1) * 2 * t - s)) / 2 : ((2 * t - 2) ** 2 * ((s + 1) * (2 * t - 2) + s) + 2) / 2;
}
