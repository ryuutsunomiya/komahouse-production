export function initProgressiveImages_init() {
  const images = document.querySelectorAll<HTMLImageElement>(".progressiveImage");

  images.forEach((img) => {
    const src = img.dataset.src;

    if (!src) return;

    const highResImage = new Image();

    highResImage.onload = () => {
      img.src = src;
    };
    highResImage.src = src;
  });
}
