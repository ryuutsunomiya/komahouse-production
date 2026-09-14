export function rowResize(onStart: () => void, onEnd: () => void, delay = 200) {
  let isResizing = false;
  let timer: number;

  function handleResize() {
    if (!isResizing) {
      isResizing = true;
      onStart();
    }

    clearTimeout(timer);
    timer = window.setTimeout(() => {
      isResizing = false;
      onEnd();
    }, delay);
  }

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    clearTimeout(timer);
  };
}
