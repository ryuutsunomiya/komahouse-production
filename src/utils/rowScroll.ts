import { createIo } from "./createIo";

export class RowScroll {
  reqId: null | number;
  onScroll;
  wrapper;
  constructor(props: { wrapper: Element | null; onScroll: () => void }) {
    const { wrapper, onScroll } = props;
    this.reqId = null;
    this.onScroll = onScroll;
    if (!wrapper) console.error("RowScroll");
    this.wrapper = wrapper as Element;
    this.init();
  }
  toggle(entry: IntersectionObserverEntry) {
    if (entry.isIntersecting && !this.reqId) {
      this.reqId = requestAnimationFrame(this.loop.bind(this));
    } else if (!entry.isIntersecting && this.reqId) {
      this.reqId = null;
    }
  }
  init() {
    createIo(this.wrapper, this.toggle.bind(this), false);
    this.onScroll();
  }
  loop() {
    this.onScroll();
    if (this.reqId) requestAnimationFrame(this.loop.bind(this));
  }
}
