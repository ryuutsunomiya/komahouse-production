export let isSp = false;
export function isSp_set() {
  const matchMedia = window.matchMedia("(max-width:960px)");
  isSp = matchMedia.matches;

  function resize() {
    const matchMedia = window.matchMedia("(max-width:960px)");
    if (matchMedia.matches !== isSp) window.location.reload();
  }
  window.addEventListener("resize", resize);
}
