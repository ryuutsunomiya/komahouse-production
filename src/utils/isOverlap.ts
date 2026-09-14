export function isOverlapY(rect1: DOMRect, rect2: DOMRect): boolean {
  return rect1.bottom > rect2.top && rect1.top < rect2.bottom;
}
