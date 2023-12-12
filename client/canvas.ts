export async function drawCanvas(
  image: HTMLImageElement,
  ctx: CanvasRenderingContext2D
) {
  if (!ctx) {
    throw new Error("No 2d context");
  }
  ctx.imageSmoothingQuality = "high";
  ctx.save();

  // if (blur) {
  //   const radius = 5;
  //   ctx.filter = `blur(${radius}px)`;
  // }
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );
  // ctx.scale(scale, scale);
  ctx.restore();
}
