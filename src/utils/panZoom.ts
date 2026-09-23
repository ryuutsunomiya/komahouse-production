type PanZoomOptions = {
  minScale?: number;
  maxScale?: number;

  /**
   * 慣性の減衰率
   * 0.9〜0.97程度
   */
  friction?: number;

  /**
   * wheel zoomの感度
   */
  wheelSpeed?: number;

  /**
   * panが境界を超えたときの抵抗
   * 小さいほど抵抗が強い
   */
  rubberBand?: number;

  /**
   * scaleがmin/maxを超えたときの抵抗
   */
  scaleRubberBand?: number;

  /**
   * 境界へ戻るアニメーション時間
   */
  bounceDuration?: number;

  /**
   * 実際にユーザー操作が発生したとき
   */
  onInteraction?: () => void;
};

type Point = {
  x: number;
  y: number;
};

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export default class PanZoom {
  private container: HTMLElement;
  private target: HTMLElement;

  // ==================================================
  // STATE
  // ==================================================

  private enabled = false;

  private scale = 1;

  private x = 0;
  private y = 0;

  // ==================================================
  // OPTIONS
  // ==================================================

  private minScale: number;
  private maxScale: number;

  private friction: number;
  private wheelSpeed: number;

  private rubberBand: number;
  private scaleRubberBand: number;

  private bounceDuration: number;

  private onInteraction?: () => void;

  // ==================================================
  // POINTER
  // ==================================================

  private pointers = new Map<number, PointerEvent>();

  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;

  // ==================================================
  // VELOCITY
  // ==================================================

  private velocityX = 0;
  private velocityY = 0;

  // ==================================================
  // PINCH
  // ==================================================

  private pinchStartDistance = 0;
  private pinchStartScale = 1;

  private pinchLastCenter: Point | null = null;

  // ==================================================
  // RAF
  // ==================================================

  private rafId: number | null = null;

  private destroyed = false;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(container: HTMLElement, target: HTMLElement, options: PanZoomOptions = {}) {
    this.container = container;
    this.target = target;

    this.minScale = options.minScale ?? 1;

    this.maxScale = options.maxScale ?? 5;

    this.friction = options.friction ?? 0.92;

    this.wheelSpeed = options.wheelSpeed ?? 0.002;

    this.rubberBand = options.rubberBand ?? 0.35;

    this.scaleRubberBand = options.scaleRubberBand ?? 0.2;

    this.bounceDuration = options.bounceDuration ?? 500;

    this.onInteraction = options.onInteraction;

    this.init();
  }

  // ==================================================
  // INIT
  // ==================================================

  private init() {
    this.container.addEventListener("pointerdown", this.onPointerDown);

    this.container.addEventListener("pointermove", this.onPointerMove);

    this.container.addEventListener("pointerup", this.onPointerUp);

    this.container.addEventListener("pointercancel", this.onPointerUp);

    this.container.addEventListener("wheel", this.onWheel, {
      passive: false,
    });

    this.render();
  }

  // ==================================================
  // POINTER DOWN
  // ==================================================

  private onPointerDown = (e: PointerEvent) => {
    if (!this.enabled) {
      return;
    }

    this.stopAnimation();

    this.container.setPointerCapture(e.pointerId);

    this.pointers.set(e.pointerId, e);

    // --------------------------------------------------
    // 1 pointer
    // --------------------------------------------------

    if (this.pointers.size === 1) {
      this.lastX = e.clientX;

      this.lastY = e.clientY;

      this.lastTime = performance.now();

      this.velocityX = 0;
      this.velocityY = 0;
    }

    // --------------------------------------------------
    // 2 pointers
    // --------------------------------------------------

    if (this.pointers.size === 2) {
      const [p1, p2] = [...this.pointers.values()];

      this.pinchStartDistance = this.getDistance(p1, p2);

      this.pinchStartScale = this.scale;

      this.pinchLastCenter = this.getCenter(p1, p2);

      this.velocityX = 0;
      this.velocityY = 0;
    }
  };

  // ==================================================
  // POINTER MOVE
  // ==================================================

  private onPointerMove = (e: PointerEvent) => {
    if (!this.enabled) {
      return;
    }

    if (!this.pointers.has(e.pointerId)) {
      return;
    }

    this.pointers.set(e.pointerId, e);

    // ==================================================
    // PAN
    // ==================================================

    if (this.pointers.size === 1) {
      const dx = e.clientX - this.lastX;

      const dy = e.clientY - this.lastY;

      const now = performance.now();

      const dt = Math.max(now - this.lastTime, 1);

      this.applyPan(dx, dy, true);

      /*
       * px / 60fps frame 相当
       */
      this.velocityX = (dx / dt) * 16.6667;

      this.velocityY = (dy / dt) * 16.6667;

      this.lastX = e.clientX;

      this.lastY = e.clientY;

      this.lastTime = now;

      this.render();

      /*
       * 実際に移動したときだけ
       * interactionとして通知
       */
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        this.onInteraction?.();
      }

      return;
    }

    // ==================================================
    // PINCH
    // ==================================================

    if (this.pointers.size === 2) {
      const [p1, p2] = [...this.pointers.values()];

      const distance = this.getDistance(p1, p2);

      const center = this.getCenter(p1, p2);

      // --------------------------------------------------
      // pinchしながらpan
      // --------------------------------------------------

      if (this.pinchLastCenter) {
        const dx = center.x - this.pinchLastCenter.x;

        const dy = center.y - this.pinchLastCenter.y;

        this.x += dx;
        this.y += dy;
      }

      this.pinchLastCenter = center;

      // --------------------------------------------------
      // SCALE
      // --------------------------------------------------

      const rawScale = this.pinchStartScale * (distance / this.pinchStartDistance);

      const nextScale = this.applyScaleResistance(rawScale);

      this.zoomAt(center.x, center.y, nextScale);

      this.onInteraction?.();

      return;
    }
  };

  // ==================================================
  // POINTER UP
  // ==================================================

  private onPointerUp = (e: PointerEvent) => {
    if (!this.enabled) {
      return;
    }

    this.pointers.delete(e.pointerId);

    // --------------------------------------------------
    // 全pointerが離れた
    // --------------------------------------------------

    if (this.pointers.size === 0) {
      this.pinchLastCenter = null;

      /*
       * scaleが範囲外なら
       * まず正常範囲へ戻す
       */
      if (this.scale < this.minScale || this.scale > this.maxScale) {
        this.bounceToBounds();

        return;
      }

      /*
       * 通常のpanなら慣性開始
       */
      this.startInertia();

      return;
    }

    // --------------------------------------------------
    // pinch → 1 pointer
    // --------------------------------------------------

    if (this.pointers.size === 1) {
      const pointer = [...this.pointers.values()][0];

      this.lastX = pointer.clientX;

      this.lastY = pointer.clientY;

      this.lastTime = performance.now();

      this.velocityX = 0;
      this.velocityY = 0;

      this.pinchLastCenter = null;
    }
  };

  // ==================================================
  // PAN
  // ==================================================

  private applyPan(dx: number, dy: number, resistance: boolean) {
    if (!resistance) {
      this.x += dx;
      this.y += dy;

      return;
    }

    const bounds = this.getBounds();

    // --------------------------------------------------
    // X
    // --------------------------------------------------

    if (this.x > bounds.maxX && dx > 0) {
      dx *= this.rubberBand;
    }

    if (this.x < bounds.minX && dx < 0) {
      dx *= this.rubberBand;
    }

    // --------------------------------------------------
    // Y
    // --------------------------------------------------

    if (this.y > bounds.maxY && dy > 0) {
      dy *= this.rubberBand;
    }

    if (this.y < bounds.minY && dy < 0) {
      dy *= this.rubberBand;
    }

    this.x += dx;
    this.y += dy;
  }

  // ==================================================
  // SCALE RESISTANCE
  // ==================================================

  private applyScaleResistance(scale: number) {
    if (scale < this.minScale) {
      const diff = this.minScale - scale;

      return this.minScale - diff * this.scaleRubberBand;
    }

    if (scale > this.maxScale) {
      const diff = scale - this.maxScale;

      return this.maxScale + diff * this.scaleRubberBand;
    }

    return scale;
  }

  // ==================================================
  // ZOOM
  // ==================================================

  private zoomAt(clientX: number, clientY: number, nextScale: number) {
    const rect = this.container.getBoundingClientRect();

    /*
     * viewport内のpointer座標
     */
    const px = clientX - rect.left;

    const py = clientY - rect.top;

    /*
     * 現在pointer下にある
     * target内の座標
     */
    const contentX = (px - this.x) / this.scale;

    const contentY = (py - this.y) / this.scale;

    this.scale = nextScale;

    /*
     * scale変更後も
     * 同じ場所をpointer下へ配置
     */
    this.x = px - contentX * this.scale;

    this.y = py - contentY * this.scale;

    this.render();
  }

  // ==================================================
  // WHEEL
  // ==================================================

  private onWheel = (e: WheelEvent) => {
    /*
     * barrier中
     *
     * preventDefaultしないので
     * 普通のページスクロールになる
     */
    if (!this.enabled) {
      return;
    }

    e.preventDefault();

    this.stopAnimation();

    const factor = Math.exp(-e.deltaY * this.wheelSpeed);

    const nextScale = this.clamp(this.scale * factor, this.minScale, this.maxScale);

    this.zoomAt(e.clientX, e.clientY, nextScale);

    this.clampPosition();

    this.render();

    this.onInteraction?.();
  };

  // ==================================================
  // INERTIA
  // ==================================================

  private startInertia() {
    this.stopAnimation();

    /*
     * ほぼ動いていなければ
     * inertia不要
     */
    const initialSpeed = Math.hypot(this.velocityX, this.velocityY);

    if (initialSpeed < 0.05) {
      this.bounceToBounds();

      return;
    }

    let lastTime = performance.now();

    const loop = (time: number) => {
      if (this.destroyed || !this.enabled) {
        return;
      }

      const delta = Math.min((time - lastTime) / 16.6667, 2);

      lastTime = time;

      /*
       * refresh rate非依存のfriction
       */
      const friction = Math.pow(this.friction, delta);

      this.velocityX *= friction;

      this.velocityY *= friction;

      const bounds = this.getBounds();

      const nextX = this.x + this.velocityX * delta;

      const nextY = this.y + this.velocityY * delta;

      /*
       * 境界外へ進んだ場合は
       * 速度を強く減衰
       */
      if (nextX > bounds.maxX || nextX < bounds.minX) {
        this.velocityX *= 0.7;
      }

      if (nextY > bounds.maxY || nextY < bounds.minY) {
        this.velocityY *= 0.7;
      }

      this.x = nextX;

      this.y = nextY;

      this.render();

      const speed = Math.hypot(this.velocityX, this.velocityY);

      if (speed < 0.05) {
        this.stopAnimation();

        this.bounceToBounds();

        return;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  // ==================================================
  // BOUNCE
  // ==================================================

  private bounceToBounds() {
    this.stopAnimation();

    const startX = this.x;

    const startY = this.y;

    const startScale = this.scale;

    // --------------------------------------------------
    // SCALE
    // --------------------------------------------------

    const targetScale = this.clamp(this.scale, this.minScale, this.maxScale);

    let targetX = this.x;

    let targetY = this.y;

    /*
     * scaleが範囲外の場合
     * viewport中央を基準に戻す
     */
    if (targetScale !== this.scale) {
      const rect = this.container.getBoundingClientRect();

      const cx = rect.width / 2;

      const cy = rect.height / 2;

      const contentX = (cx - this.x) / this.scale;

      const contentY = (cy - this.y) / this.scale;

      targetX = cx - contentX * targetScale;

      targetY = cy - contentY * targetScale;
    }

    // --------------------------------------------------
    // POSITION
    // --------------------------------------------------

    const bounds = this.getBounds(targetScale);

    targetX = this.clamp(targetX, bounds.minX, bounds.maxX);

    targetY = this.clamp(targetY, bounds.minY, bounds.maxY);

    /*
     * すでに正常範囲なら
     * animation不要
     */
    if (Math.abs(targetX - startX) < 0.01 && Math.abs(targetY - startY) < 0.01 && Math.abs(targetScale - startScale) < 0.001) {
      this.x = targetX;

      this.y = targetY;

      this.scale = targetScale;

      this.render();

      return;
    }

    const startTime = performance.now();

    const loop = (time: number) => {
      if (this.destroyed) {
        return;
      }

      const progress = this.clamp((time - startTime) / this.bounceDuration, 0, 1);

      const eased = this.easeOutExpo(progress);

      this.x = this.lerp(startX, targetX, eased);

      this.y = this.lerp(startY, targetY, eased);

      this.scale = this.lerp(startScale, targetScale, eased);

      this.render();

      if (progress >= 1) {
        this.x = targetX;

        this.y = targetY;

        this.scale = targetScale;

        this.render();

        this.stopAnimation();

        return;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  // ==================================================
  // BOUNDS
  // ==================================================

  private getBounds(scale = this.scale): Bounds {
    const containerRect = this.container.getBoundingClientRect();

    /*
     * transform前のtargetサイズ × scale
     */
    const width = this.target.offsetWidth * scale;

    const height = this.target.offsetHeight * scale;

    let minX: number;
    let maxX: number;

    let minY: number;
    let maxY: number;

    // --------------------------------------------------
    // X
    // --------------------------------------------------

    if (width <= containerRect.width) {
      /*
       * targetの方が小さい場合は中央固定
       */
      const centerX = (containerRect.width - width) / 2;

      minX = centerX;

      maxX = centerX;
    } else {
      minX = containerRect.width - width;

      maxX = 0;
    }

    // --------------------------------------------------
    // Y
    // --------------------------------------------------

    if (height <= containerRect.height) {
      const centerY = (containerRect.height - height) / 2;

      minY = centerY;

      maxY = centerY;
    } else {
      minY = containerRect.height - height;

      maxY = 0;
    }

    return {
      minX,
      maxX,
      minY,
      maxY,
    };
  }

  private clampPosition() {
    const bounds = this.getBounds();

    this.x = this.clamp(this.x, bounds.minX, bounds.maxX);

    this.y = this.clamp(this.y, bounds.minY, bounds.maxY);
  }

  // ==================================================
  // RENDER
  // ==================================================

  private render() {
    this.target.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale(${this.scale})`;
  }

  // ==================================================
  // UTILS
  // ==================================================

  private getDistance(p1: PointerEvent, p2: PointerEvent) {
    return Math.hypot(
      p2.clientX - p1.clientX,

      p2.clientY - p1.clientY,
    );
  }

  private getCenter(p1: PointerEvent, p2: PointerEvent): Point {
    return {
      x: (p1.clientX + p2.clientX) / 2,

      y: (p1.clientY + p2.clientY) / 2,
    };
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  private lerp(start: number, end: number, progress: number) {
    return start + (end - start) * progress;
  }

  private easeOutExpo(t: number) {
    if (t >= 1) {
      return 1;
    }

    return 1 - Math.pow(2, -10 * t);
  }

  // ==================================================
  // ANIMATION
  // ==================================================

  private stopAnimation() {
    if (this.rafId === null) {
      return;
    }

    cancelAnimationFrame(this.rafId);

    this.rafId = null;
  }

  // ==================================================
  // ENABLE / DISABLE
  // ==================================================

  public enable() {
    if (this.destroyed) {
      return;
    }

    this.enabled = true;
  }

  public disable() {
    this.enabled = false;

    /*
     * 操作途中でdisableされた場合も
     * pointer状態を完全に破棄
     */
    for (const pointerId of this.pointers.keys()) {
      if (this.container.hasPointerCapture(pointerId)) {
        this.container.releasePointerCapture(pointerId);
      }
    }

    this.pointers.clear();

    this.velocityX = 0;
    this.velocityY = 0;

    this.pinchLastCenter = null;

    /*
     * 慣性等も停止
     */
    this.stopAnimation();
  }

  // ==================================================
  // RESET
  // ==================================================

  public reset(animate = true) {
    this.stopAnimation();

    this.velocityX = 0;
    this.velocityY = 0;

    if (!animate) {
      this.scale = this.minScale;

      const bounds = this.getBounds(this.scale);

      this.x = bounds.maxX;

      this.y = bounds.maxY;

      this.render();

      return;
    }

    /*
     * bounceToBoundsを利用するため
     * 一旦scaleをminScaleへ
     */
    const startX = this.x;

    const startY = this.y;

    const startScale = this.scale;

    const targetScale = this.minScale;

    const bounds = this.getBounds(targetScale);

    const targetX = bounds.maxX;

    const targetY = bounds.maxY;

    const startTime = performance.now();

    const loop = (time: number) => {
      if (this.destroyed) {
        return;
      }

      const progress = this.clamp((time - startTime) / this.bounceDuration, 0, 1);

      const eased = this.easeOutExpo(progress);

      this.x = this.lerp(startX, targetX, eased);

      this.y = this.lerp(startY, targetY, eased);

      this.scale = this.lerp(startScale, targetScale, eased);

      this.render();

      if (progress >= 1) {
        this.x = targetX;

        this.y = targetY;

        this.scale = targetScale;

        this.render();

        this.stopAnimation();

        return;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  // ==================================================
  // RESIZE
  // ==================================================

  public resize() {
    this.stopAnimation();

    this.clampPosition();

    this.render();
  }

  // ==================================================
  // DESTROY
  // ==================================================

  public destroy() {
    this.destroyed = true;

    this.disable();

    this.container.removeEventListener("pointerdown", this.onPointerDown);

    this.container.removeEventListener("pointermove", this.onPointerMove);

    this.container.removeEventListener("pointerup", this.onPointerUp);

    this.container.removeEventListener("pointercancel", this.onPointerUp);

    this.container.removeEventListener("wheel", this.onWheel);

    this.target.style.transform = "";

    this.target.style.willChange = "";
  }
}
