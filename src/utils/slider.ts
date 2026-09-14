export function slider_init() {
  const slider = document.querySelector<HTMLElement>(".slider");
  if (!slider) return;

  const slides = [...slider.querySelectorAll<HTMLElement>(".slider_slide")];
  const indicators = [...slider.querySelectorAll<HTMLButtonElement>(".slider_indicator")];

  if (slides.length === 0) return;

  let current = 0;
  let elapsed = 0;
  let lastTime = 0;
  let isHover = false;

  const interval = 8000;

  function goTo(index: number) {
    current = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle("--current", i === current);
    });

    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("--current", i === current);
      indicator.setAttribute("aria-selected", String(i === current));
    });
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  indicators.forEach((indicator, i) => {
    indicator.addEventListener("click", () => {
      elapsed = 0;
      goTo(i);
    });
  });

  slider.addEventListener("mouseenter", () => {
    isHover = true;
  });

  slider.addEventListener("mouseleave", () => {
    isHover = false;
  });

  function raf(time: number) {
    if (!lastTime) lastTime = time;

    const delta = time - lastTime;
    lastTime = time;

    if (!isHover) {
      elapsed += delta;

      if (elapsed >= interval) {
        elapsed = 0;
        next();
      }
    }

    requestAnimationFrame(raf);
  }

  goTo(0);
  requestAnimationFrame(raf);
}
