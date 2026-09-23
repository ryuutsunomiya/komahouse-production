type PanZoomOptions = {
  minScale?: number;
  maxScale?: number;

  /**
   * Pan慣性
   * 大きいほど長く滑る
   */
  friction?: number;

  /**
   * マウスホイールのズーム感度
   */
  wheelSpeed?: number;

  /**
   * スマホ / タブレットの
   * 2本指ピンチ感度
   *
   * 1 = 1:1
   * 1.5 = 少し大きめ
   * 2 = 強め
   */
  pinchSensitivity?: number;

  /**
   * Macトラックパッドの
   * pinch zoom感度
   */
  trackpadPinchSpeed?: number;

  /**
   * Pan境界を超えたときの抵抗
   * 小さいほど強い
   */
  rubberBand?: number;

  /**
   * minScale / maxScaleを
   * 超えたときの抵抗
   */
  scaleRubberBand?: number;

  /**
   * 境界へ戻る時間
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
  private destroyed = false;

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

  private pinchSensitivity: number;

  private trackpadPinchSpeed: number;

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
  // TOUCH PINCH
  // ==================================================

  private pinchStartDistance = 0;

  private pinchStartScale = 1;

  private pinchLastCenter: Point | null = null;

  // ==================================================
  // RAF
  // ==================================================

  private rafId: number | null = null;

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

    this.pinchSensitivity = options.pinchSensitivity ?? 1.5;

    this.trackpadPinchSpeed = options.trackpadPinchSpeed ?? 0.01;

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
    // 1 POINTER
    // --------------------------------------------------

    if (this.pointers.size === 1) {
      this.lastX = e.clientX;

      this.lastY = e.clientY;

      this.lastTime = performance.now();

      this.velocityX = 0;
      this.velocityY = 0;
    }

    // --------------------------------------------------
    // 2 POINTERS
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
    // ONE POINTER
    // PAN
    // ==================================================

    if (this.pointers.size === 1) {
      const dx = e.clientX - this.lastX;

      const dy = e.clientY - this.lastY;

      const now = performance.now();

      const dt = Math.max(now - this.lastTime, 1);

      this.applyPan(dx, dy, true);

      /*
       * 60fps換算の速度
       */
      this.velocityX = (dx / dt) * 16.6667;

      this.velocityY = (dy / dt) * 16.6667;

      this.lastX = e.clientX;

      this.lastY = e.clientY;

      this.lastTime = now;

      this.render();

      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        this.onInteraction?.();
      }

      return;
    }

    // ==================================================
    // TWO POINTERS
    // TOUCH PINCH
    // ==================================================

    if (this.pointers.size === 2) {
      const [p1, p2] = [...this.pointers.values()];

      // --------------------------------------------------
      // DISTANCE
      // --------------------------------------------------

      const distance = this.getDistance(p1, p2);

      // --------------------------------------------------
      // CENTER
      // --------------------------------------------------

      const center = this.getCenter(p1, p2);

      // --------------------------------------------------
      // PAN WHILE PINCHING
      // --------------------------------------------------

      if (this.pinchLastCenter) {
        const dx = center.x - this.pinchLastCenter.x;

        const dy = center.y - this.pinchLastCenter.y;

        this.x += dx;
        this.y += dy;
      }

      this.pinchLastCenter = center;

      // --------------------------------------------------
      // PINCH RATIO
      // --------------------------------------------------

      const ratio = distance / this.pinchStartDistance;

      /*
       * 感度調整
       *
       * 例:
       *
       * ratio = 1.2
       *
       * sensitivity 1
       * → 1.2
       *
       * sensitivity 1.5
       * → 約1.31
       *
       * sensitivity 2
       * → 1.44
       */
      const adjustedRatio = Math.pow(ratio, this.pinchSensitivity);

      const rawScale = this.pinchStartScale * adjustedRatio;

      const nextScale = this.applyScaleResistance(rawScale);

      /*
       * 2本指の中心を基準に
       * zoom
       */
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
    // POINTER 0
    // --------------------------------------------------

    if (this.pointers.size === 0) {
      this.pinchLastCenter = null;

      /*
       * Scaleが範囲外なら
       * 正常範囲へ戻す
       */
      if (this.scale < this.minScale || this.scale > this.maxScale) {
        this.bounceToBounds();

        return;
      }

      /*
       * Pan inertia
       */
      this.startInertia();

      return;
    }

    // --------------------------------------------------
    // PINCH → ONE POINTER
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
  // WHEEL
  // ==================================================

  private onWheel = (e: WheelEvent) => {
    /*
     * barrier ON時
     *
     * preventDefaultしない
     * ↓
     * 通常のページスクロール
     */
    if (!this.enabled) {
      return;
    }

    e.preventDefault();

    this.stopAnimation();

    // --------------------------------------------------
    // TRACKPAD PINCH
    // --------------------------------------------------

    /*
     * Chrome / Safari等では
     *
     * Mac trackpad pinch
     *
     * ↓
     *
     * WheelEvent
     * ctrlKey === true
     *
     * として通知される場合がある。
     */
    const isTrackpadPinch = e.ctrlKey;

    const speed = isTrackpadPinch ? this.trackpadPinchSpeed : this.wheelSpeed;

    // --------------------------------------------------
    // SCALE
    // --------------------------------------------------

    const factor = Math.exp(-e.deltaY * speed);

    const nextScale = this.clamp(this.scale * factor, this.minScale, this.maxScale);

    /*
     * マウス位置 /
     * trackpad pinch中心
     *
     * を基準にzoom
     */
    this.zoomAt(e.clientX, e.clientY, nextScale);

    /*
     * scale後に
     * bounds内へ収める
     */
    this.clampPosition();

    this.render();

    this.onInteraction?.();
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
    // --------------------------------------------------
    // MIN
    // --------------------------------------------------

    if (scale < this.minScale) {
      const diff = this.minScale - scale;

      return this.minScale - diff * this.scaleRubberBand;
    }

    // --------------------------------------------------
    // MAX
    // --------------------------------------------------

    if (scale > this.maxScale) {
      const diff = scale - this.maxScale;

      return this.maxScale + diff * this.scaleRubberBand;
    }

    return scale;
  }

  // ==================================================
  // ZOOM AT
  // ==================================================

  private zoomAt(clientX: number, clientY: number, nextScale: number) {
    const rect = this.container.getBoundingClientRect();

    /*
     * container内の
     * pointer位置
     */
    const px = clientX - rect.left;

    const py = clientY - rect.top;

    /*
     * 現在pointerの下にある
     * target座標
     */
    const contentX = (px - this.x) / this.scale;

    const contentY = (py - this.y) / this.scale;

    // --------------------------------------------------
    // SCALE
    // --------------------------------------------------

    this.scale = nextScale;

    /*
     * Scale変更後も
     * 同じcontent位置が
     * pointer下に来るようにする
     */
    this.x = px - contentX * this.scale;

    this.y = py - contentY * this.scale;

    this.render();
  }

  // ==================================================
  // INERTIA
  // ==================================================

  private startInertia() {
    this.stopAnimation();

    const initialSpeed = Math.hypot(this.velocityX, this.velocityY);

    /*
     * ほぼ動いていない
     */
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

      // --------------------------------------------------
      // FRICTION
      // --------------------------------------------------

      const friction = Math.pow(this.friction, delta);

      this.velocityX *= friction;

      this.velocityY *= friction;

      // --------------------------------------------------
      // NEXT POSITION
      // --------------------------------------------------

      const bounds = this.getBounds();

      const nextX = this.x + this.velocityX * delta;

      const nextY = this.y + this.velocityY * delta;

      // --------------------------------------------------
      // BOUNDARY RESISTANCE
      // --------------------------------------------------

      if (nextX > bounds.maxX || nextX < bounds.minX) {
        this.velocityX *= 0.7;
      }

      if (nextY > bounds.maxY || nextY < bounds.minY) {
        this.velocityY *= 0.7;
      }

      this.x = nextX;

      this.y = nextY;

      this.render();

      // --------------------------------------------------
      // STOP
      // --------------------------------------------------

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
  // BOUNCE TO BOUNDS
  // ==================================================

  private bounceToBounds() {
    this.stopAnimation();

    const startX = this.x;

    const startY = this.y;

    const startScale = this.scale;

    // --------------------------------------------------
    // TARGET SCALE
    // --------------------------------------------------

    const targetScale = this.clamp(this.scale, this.minScale, this.maxScale);

    let targetX = this.x;

    let targetY = this.y;

    // --------------------------------------------------
    // SCALE CORRECTION
    // --------------------------------------------------

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
    // POSITION CORRECTION
    // --------------------------------------------------

    const bounds = this.getBounds(targetScale);

    targetX = this.clamp(targetX, bounds.minX, bounds.maxX);

    targetY = this.clamp(targetY, bounds.minY, bounds.maxY);

    // --------------------------------------------------
    // ALREADY CORRECT
    // --------------------------------------------------

    if (Math.abs(targetX - startX) < 0.01 && Math.abs(targetY - startY) < 0.01 && Math.abs(targetScale - startScale) < 0.001) {
      this.x = targetX;

      this.y = targetY;

      this.scale = targetScale;

      this.render();

      return;
    }

    // --------------------------------------------------
    // ANIMATION
    // --------------------------------------------------

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
     * transform前サイズ
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
       * targetがcontainerより
       * 小さい場合は中央固定
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

  // ==================================================
  // CLAMP POSITION
  // ==================================================

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
  // DISTANCE
  // ==================================================

  private getDistance(p1: PointerEvent, p2: PointerEvent) {
    return Math.hypot(
      p2.clientX - p1.clientX,

      p2.clientY - p1.clientY,
    );
  }

  // ==================================================
  // CENTER
  // ==================================================

  private getCenter(p1: PointerEvent, p2: PointerEvent): Point {
    return {
      x: (p1.clientX + p2.clientX) / 2,

      y: (p1.clientY + p2.clientY) / 2,
    };
  }

  // ==================================================
  // CLAMP
  // ==================================================

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  // ==================================================
  // LERP
  // ==================================================

  private lerp(start: number, end: number, progress: number) {
    return start + (end - start) * progress;
  }

  // ==================================================
  // EASING
  // ==================================================

  private easeOutExpo(t: number) {
    if (t >= 1) {
      return 1;
    }

    return 1 - Math.pow(2, -10 * t);
  }

  // ==================================================
  // STOP ANIMATION
  // ==================================================

  private stopAnimation() {
    if (this.rafId === null) {
      return;
    }

    cancelAnimationFrame(this.rafId);

    this.rafId = null;
  }

  // ==================================================
  // ENABLE
  // ==================================================

  public enable() {
    if (this.destroyed) {
      return;
    }

    this.enabled = true;
  }

  // ==================================================
  // DISABLE
  // ==================================================

  public disable() {
    this.enabled = false;

    // --------------------------------------------------
    // POINTER CAPTURE RELEASE
    // --------------------------------------------------

    for (const pointerId of this.pointers.keys()) {
      if (this.container.hasPointerCapture(pointerId)) {
        this.container.releasePointerCapture(pointerId);
      }
    }

    // --------------------------------------------------
    // RESET POINTER STATE
    // --------------------------------------------------

    this.pointers.clear();

    this.velocityX = 0;
    this.velocityY = 0;

    this.pinchLastCenter = null;

    // --------------------------------------------------
    // STOP INERTIA
    // --------------------------------------------------

    this.stopAnimation();
  }

  // ==================================================
  // RESET
  // ==================================================

  public reset(animate = true) {
    this.stopAnimation();

    this.velocityX = 0;
    this.velocityY = 0;

    // --------------------------------------------------
    // NO ANIMATION
    // --------------------------------------------------

    if (!animate) {
      this.scale = this.minScale;

      const bounds = this.getBounds(this.scale);

      this.x = bounds.maxX;

      this.y = bounds.maxY;

      this.render();

      return;
    }

    // --------------------------------------------------
    // ANIMATION
    // --------------------------------------------------

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
    if (this.destroyed) {
      return;
    }

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
