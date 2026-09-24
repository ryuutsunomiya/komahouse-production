import { hamburger_close } from "../scripts/header";

const DURATION = 700;
const OFFSET = 0; // 固定headerがあるなら高さを指定

function smoothScrollTo(target: Element, duration = DURATION) {
  const startY = window.scrollY;
  const targetY = target.getBoundingClientRect().top + window.scrollY - OFFSET;

  const distance = targetY - startY;
  const startTime = performance.now();

  const ease = (t: number) => 1 - Math.pow(1 - t, 3);

  function update(time: number) {
    const progress = Math.min((time - startTime) / duration, 1);
    const y = startY + distance * ease(progress);

    window.scrollTo(0, y);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function clickHandlar() {
  document.addEventListener("click", (e: any) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;

    const url = new URL(link.href, window.location.href);

    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) {
      return;
    }

    if (!url.hash) return;

    const target = document.getElementById(url.hash.replace("#", ""));
    if (!target) return;

    e.preventDefault();

    hamburger_close();

    history.pushState(null, "", url.hash);

    smoothScrollTo(target);
  });
}

function scrollToCurrentHash() {
  const hash = window.location.hash;
  if (!hash) return;

  console.log(hash);

  const target = document.getElementById(hash.replace("#", ""));
  if (!target) return;

  requestAnimationFrame(() => {
    smoothScrollTo(target);
  });
}

export function smoothScroll_init() {
  clickHandlar();
  scrollToCurrentHash();
}
