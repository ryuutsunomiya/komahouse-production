import MapController from "./mapController";

let mapController: MapController | null = null;

export function map_Init() {
  const map = document.querySelector<HTMLElement>(".map");

  const target = document.querySelector<HTMLElement>(".map_inner");

  const barrier = document.querySelector<HTMLElement>(".map_barrier");

  if (!map || !target || !barrier) {
    return;
  }

  mapController = new MapController(map, target, barrier, {
    /*
     * 5秒間操作なしで
     * barrier復活
     */
    inactivityTimeout: 5000,
  });

  window.addEventListener("resize", onResize);
}

function onResize() {
  mapController?.resize();
}

export function mapDestroy() {
  window.removeEventListener("resize", onResize);

  mapController?.destroy();

  mapController = null;
}
