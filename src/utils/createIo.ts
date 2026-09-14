type IntersectionCallback = (entry: IntersectionObserverEntry) => void;

export function createIo(target: Element | null, callback: IntersectionCallback, once: boolean, options?: IntersectionObserverInit): IntersectionObserver {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      callback(entry);
      if (once && entry.isIntersecting) {
        observer.unobserve(entry.target);
      }
    });
  }, options);

  if (target) observer.observe(target);
  else console.error("createIo");

  return observer;
}
