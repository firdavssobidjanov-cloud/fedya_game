/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

interface CanvasRenderingContext2D {
  roundRect(x: number, y: number, w: number, h: number, radii?: number | number[]): void;
}

declare module 'canvas-confetti' {
  export default function confetti(options?: any): Promise<null> | null;
}
