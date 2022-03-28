const MAX_DPI = 2;
const OVERAGE = 0.02; // Proportion of size to expand beyond, avoiding clipping artifacts

export type Canvas2dProps = {
  canvas: HTMLCanvasElement;
  draw: (props: Canvas2dDrawProps) => void;
  width?: number;
  height?: number;
  autoClear?: boolean;
  autoScope?: boolean;
};

export type Canvas2dUpdateProps = {
  delta: number;
  elapsed: number;
};

export type Canvas2dDrawProps = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
} & Canvas2dUpdateProps;

export type Canvas2dReturnProps = {
  resize: (newWidth: number, newHeight: number) => void;
  update: (props: Canvas2dUpdateProps) => void;
};

export const Canvas2d = ({
  canvas,
  draw,
  width,
  height,
  autoClear = true,
}: Canvas2dProps) => {
  const ctx = canvas.getContext("2d");
  let w = 0,
    h = 0,
    overW = 0,
    overH = 0;

  const resize = (newWidth: number, newHeight: number) => {
    const dpi = Math.max(
      Math.min(
        typeof window !== undefined ? window.devicePixelRatio : 1,
        MAX_DPI
      ),
      1
    );

    w = newWidth;
    h = newHeight;
    overW = w * (1 + OVERAGE);
    overH = h * (1 + OVERAGE);

    canvas.width = overW * dpi;
    canvas.height = overH * dpi;

    canvas.style.width = overW + "px";
    canvas.style.height = overH + "px";
    canvas.style.margin = `-${h * (OVERAGE / 2)}px 0 0 -${w * (OVERAGE / 2)}px`;

    ctx?.scale(dpi, dpi);
  };

  resize(width || w, height || h);

  const update = (props: Canvas2dUpdateProps) => {
    if (ctx) {
      autoClear && ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate((overW - w) / 2, (overH - h) / 2);
      draw({ ...props, ctx, width: w, height: h });
      ctx.restore();
    }
  };

  update({ delta: 0, elapsed: 0 });

  return <Canvas2dReturnProps>{
    resize,
    update,
  };
};

export default Canvas2d;
