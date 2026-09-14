export function debounce<T extends (...args: any[]) => void>(callback: T, delay = 200) {
  let timer: number;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
