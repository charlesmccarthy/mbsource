import { drawCanvas } from "./canvas";
// @ts-ignore
import { PNG } from "pngjs/browser";

export const getMaskData = (
  maskImage: HTMLImageElement,
  canvas: HTMLCanvasElement,
  scale: number
) => {
  // draw the mask image onto the mask canvas
  const maskCtx = canvas.getContext("2d");
  if (!maskCtx) {
    return Promise.reject(new Error("Failed"));
  }
  maskCtx.scale(scale, scale);
  maskCtx.clearRect(0, 0, canvas.width, canvas.height);
  drawCanvas(maskImage, maskCtx);
  return maskCtx.getImageData(0, 0, canvas.width, canvas.height).data.buffer;
};

export const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            const err = new Error("No file");
            reject(err);
          } else {
            resolve(blob);
          }
        },
        "image/png",
        1
      );
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
};

export function applyMask(
  imageData: Uint8Array,
  maskData: Uint8Array,
  width: number,
  height: number
) {
  if (imageData.length !== maskData.length) {
    throw new Error("Image and mask dimensions do not match.");
  }
  const png = new PNG({ width: width, height: height });
  for (let i = 0; i < imageData.length; i += 4) {
    const isWhite =
      maskData[i] === 255 && maskData[i + 1] === 255 && maskData[i + 2] === 255;
    if (isWhite) {
      imageData[i + 3] = 0;
    }
    png.data[i] = imageData[i];
    png.data[i + 1] = imageData[i + 1];
    png.data[i + 2] = imageData[i + 2];
    png.data[i + 3] = imageData[i + 3];
  }

  const options = { colorType: 6 };
  const buffer = PNG.sync.write(png, options);
  const modifiedBlob = new Blob([buffer], {
    type: "image/png",
  });
  return modifiedBlob;
}
