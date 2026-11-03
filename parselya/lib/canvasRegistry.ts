/**
 * Aktif sahne canvas'ına global erişim (export akışı için).
 * Basit kasıtlı bir modül-durumu; tek canvas'lı uygulamada yeterli.
 */
let current: HTMLCanvasElement | null = null;

export const canvasRegistry = {
  set(canvas: HTMLCanvasElement | null) {
    current = canvas;
  },
  get(): HTMLCanvasElement | null {
    return current;
  },
};
