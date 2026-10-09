/** A flow column on a (buffered) multi-page document. Several columns can flow independently across pages. */
class Cursor {
  constructor(doc, { x, w, top, bottom, firstTop }) {
    Object.assign(this, { doc, x, w, top, bottom });
    this.pageIdx = 0;
    this.y = firstTop ?? top;
    this.fresh = true; // nothing placed since the last page start
  }

  use() { this.doc.switchToPage(this.pageIdx); }

  newPage() {
    this.pageIdx += 1;
    if (this.pageIdx >= this.doc.bufferedPageRange().count) this.doc.addPage();
    else this.doc.switchToPage(this.pageIdx);
    this.y = this.top;
    this.fresh = true;
  }

  space(h) { if (!this.fresh) this.y = Math.min(this.y + h, this.bottom); }

  /** Draw ops {h, draw(x,y)} top-to-bottom. keep=true moves the whole block to a new page if it would be split. */
  block(ops, keep = true) {
    const list = ops.filter(Boolean);
    const total = list.reduce((s, o) => s + o.h, 0);
    if (keep && total <= this.bottom - this.top && this.y + total > this.bottom) this.newPage();
    for (const op of list) {
      if (this.y + op.h > this.bottom && !(this.fresh && op.h > this.bottom - this.top)) this.newPage();
      this.use();
      op.draw(this.x, this.y);
      this.y += op.h;
      this.fresh = false;
    }
  }
}

module.exports = Cursor;
