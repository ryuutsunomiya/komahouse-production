import PanZoom from "./panZoom";

type MapControllerOptions = {
  /**
   * 最後の実操作から
   * barrierが復活するまでの時間
   */
  inactivityTimeout?: number;
};

export default class MapController {
  private map: HTMLElement;
  private target: HTMLElement;
  private barrier: HTMLElement;

  private panZoom: PanZoom;

  private inactivityTimeout: number;

  private inactivityTimer: number | null = null;

  private observer: IntersectionObserver | null = null;

  private isActive = false;

  private destroyed = false;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(map: HTMLElement, target: HTMLElement, barrier: HTMLElement, options: MapControllerOptions = {}) {
    this.map = map;

    this.target = target;

    this.barrier = barrier;

    this.inactivityTimeout = options.inactivityTimeout ?? 5000;

    // ==================================================
    // PAN ZOOM
    // ==================================================

    this.panZoom = new PanZoom(this.map, this.target, {
      minScale: 1,
      maxScale: 5,

      friction: 0.92,

      wheelSpeed: 0.002,

      rubberBand: 0.35,

      scaleRubberBand: 0.2,

      bounceDuration: 500,

      /*
       * 実際にMap操作が発生した時だけ
       * タイマーをリセット
       */
      onInteraction: this.onMapInteraction,
    });

    this.init();
  }

  // ==================================================
  // INIT
  // ==================================================

  private init() {
    /*
     * 初期状態
     *
     * barrier ON
     * PanZoom OFF
     */
    this.deactivate();

    // --------------------------------------------------
    // barrier
    // --------------------------------------------------

    this.barrier.addEventListener("click", this.onBarrierClick);

    // --------------------------------------------------
    // IntersectionObserver
    // --------------------------------------------------

    this.observer = new IntersectionObserver(this.onIntersection, {
      threshold: 0,
    });

    this.observer.observe(this.map);
  }

  // ==================================================
  // BARRIER CLICK
  // ==================================================

  private onBarrierClick = () => {
    this.activate();
  };

  // ==================================================
  // MAP INTERACTION
  // ==================================================

  private onMapInteraction = () => {
    if (!this.isActive) {
      return;
    }

    /*
     * drag / pinch / wheelが
     * 実際に発生した場合だけ
     * タイマー更新
     */
    this.startInactivityTimer();
  };

  // ==================================================
  // ACTIVATE
  // ==================================================

  private activate() {
    if (this.destroyed || this.isActive) {
      return;
    }

    this.isActive = true;

    // --------------------------------------------------
    // CSS
    // --------------------------------------------------

    this.map.classList.add("is-active");

    this.barrier.classList.add("is-hidden");

    this.barrier.setAttribute("aria-hidden", "true");

    // --------------------------------------------------
    // PanZoom
    // --------------------------------------------------

    this.panZoom.enable();

    // --------------------------------------------------
    // inactivity
    // --------------------------------------------------

    this.startInactivityTimer();
  }

  // ==================================================
  // DEACTIVATE
  // ==================================================

  private deactivate() {
    this.isActive = false;

    // --------------------------------------------------
    // PanZoom
    // --------------------------------------------------

    this.panZoom.disable();

    // --------------------------------------------------
    // CSS
    // --------------------------------------------------

    this.map.classList.remove("is-active");

    this.barrier.classList.remove("is-hidden");

    this.barrier.removeAttribute("aria-hidden");

    // --------------------------------------------------
    // timer
    // --------------------------------------------------

    this.clearInactivityTimer();
  }

  // ==================================================
  // TIMER
  // ==================================================

  private startInactivityTimer() {
    this.clearInactivityTimer();

    // this.inactivityTimer = window.setTimeout(() => {
    //   this.deactivate();
    // }, this.inactivityTimeout);
  }

  private clearInactivityTimer() {
    if (this.inactivityTimer === null) {
      return;
    }

    window.clearTimeout(this.inactivityTimer);

    this.inactivityTimer = null;
  }

  // ==================================================
  // INTERSECTION
  // ==================================================

  private onIntersection: IntersectionObserverCallback = (entries) => {
    const entry = entries[0];

    if (!entry) {
      return;
    }

    /*
     * Mapが完全にviewport外へ出た
     */
    if (!entry.isIntersecting) {
      this.deactivate();
    }
  };

  // ==================================================
  // RESIZE
  // ==================================================

  public resize() {
    if (this.destroyed) {
      return;
    }

    this.panZoom.resize();
  }

  // ==================================================
  // DESTROY
  // ==================================================

  public destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    this.clearInactivityTimer();

    this.observer?.disconnect();

    this.observer = null;

    this.barrier.removeEventListener("click", this.onBarrierClick);

    this.panZoom.destroy();

    this.map.classList.remove("is-active");

    this.barrier.classList.remove("is-hidden");

    this.barrier.removeAttribute("aria-hidden");
  }
}
