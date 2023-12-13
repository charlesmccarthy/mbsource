import { useRef, useState } from "react";
import { ReactSketchCanvasRef } from "react-sketch-canvas";
import { DownloadIcon, ImageIcon } from "./Icons";
import { InpaintCanvas } from "./InpaintCanvas";
import { Button } from "./Button";
import { drawCanvas } from "@/client/canvas";
import { downloadFile } from "@/client/file";
import { getMaskData, getCanvasBlob, applyMask } from "@/client/Image";
import clsx from "clsx";

const MaskedImageInput = () => {
  // external or local data url pointing to the image
  const [imageURL, setImageURL] = useState("");
  const [filename, setFilename] = useState("");

  const inpaintingRef = useRef<ReactSketchCanvasRef>(null);
  const selectedImg = useRef<HTMLImageElement>(null);
  const hiddenCanvas = useRef<HTMLCanvasElement>(null);
  const [inpaintWidth, setInpaintWidth] = useState(30);

  const onSelectFile = (e: any, callback: (dataUrl: string) => void) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultData = reader.result as string;
      callback(resultData);
    };
    if (files[0]) {
      setFilename(files[0].name);
      reader.readAsDataURL(files[0]);
    }
  };

  const downloadMask = async () => {
    const hasPaths = await didPaint();
    const imgBlob = await getMaskedImgBlob(hasPaths);
    document.createElement("a");
    const url = URL.createObjectURL(new Blob([imgBlob], { type: "image/png" }));
    downloadFile("masked-image.png", url);
  };

  async function getMaskedImgBlob(hasPaths: boolean) {
    const canvas = hiddenCanvas.current!;
    const image = selectedImg.current!;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    drawCanvas(image, ctx);
    let imgBlob = await getCanvasBlob(canvas);
    if (hasPaths) {
      const imgData = new Uint8Array(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer.slice(0)
      );
      const maskData = new Uint8Array(await getMaskScaledData());
      imgBlob = applyMask(imgData, maskData, canvas.width, canvas.height);
    }
    return imgBlob;
  }

  const getMaskScaledData = async (): Promise<ArrayBuffer> => {
    const bgCanvasEl = document.getElementById(
      "react-sketch-canvas__canvas-background"
    );
    bgCanvasEl?.setAttribute("fill", "#000");
    const maskUrl = await inpaintingRef.current?.exportImage("png");
    bgCanvasEl?.setAttribute("fill", "transparent");

    // convert the data url to image, use mask, return canvas blob
    return new Promise((resolve, reject) => {
      const canvas = hiddenCanvas.current!;
      const img = selectedImg.current!;
      const scale = canvas.width / img.width;
      const mask = new Image();
      mask.src = maskUrl || "";
      mask.onload = async () => {
        try {
          const data = await getMaskData(mask, canvas, scale);
          resolve(data);
        } catch (e) {
          reject(e);
        }
      };
    });
  };

  async function didPaint() {
    const paths = await inpaintingRef.current?.exportPaths();
    const hasPaths = !!paths && paths.length > 0;
    return hasPaths;
  }

  return (
    <div
      className="container  flex flex-col w-full"
      style={{ alignItems: imageURL ? "center" : "auto" }}
    >
      <div
        className="border border-slate cursor-pointer py-1.5 px-1 rounded shadow-sm focus:outline-none flex flex-col items-center"
        style={{
          height: imageURL ? "45px" : "80%",
          maxWidth: imageURL ? "600px" : "100%",
        }}
      >
        <label
          className="relative h-full shadow-sm bg-slate-100 cursor-pointer w-full flex justify-center pl-1"
          htmlFor="file"
        >
          <div
            className={clsx(
              "h-full text-slate-500 flex p-1 gap-3 items-center",
              imageURL ? "block text-sm" : "py-[20%] flex-col text-lg"
            )}
          >
            <ImageIcon size={imageURL ? 6 : 60} />
            <div className="w-full text-center">
              {filename || "Select Image to Transform"}
            </div>
            <span className="sr-only">Select Image</span>
          </div>
        </label>
        <input
          id="file"
          accept="image/png, image/jpeg"
          onChange={(e) => onSelectFile(e, setImageURL)}
          type="file"
          className="hidden w-full text-lg text-slate-500
              file:rounded-full file:border-0 file:text-lg
              file:font-semibold file:bg-transparent file:text-gray-700"
        />
      </div>
      {imageURL && (
        <div className="flex flex-col items-center gap-6 my-3">
          <div id="image-container" className="relative shadow-sm">
            <InpaintCanvas
              canvasRef={inpaintingRef}
              strokeWidth={inpaintWidth}
              waitInpaint={false}
              setHasInpainted={() => {}}
              width={selectedImg.current?.width}
            />
            <img
              crossOrigin="anonymous"
              ref={selectedImg}
              onLoad={() => inpaintingRef.current?.clearCanvas()}
              src={imageURL}
              className="pointer-events-none max-h-[90vh] lg:max-h-[70vh]"
            />
          </div>
          <span className="hidden zinc-100 bg-slate-600" />
          <div id="action-btns" className="flex flex-col items-center gap-3 text-white">
            <div>
              Paint over the parts of the image that you want to animate
            </div>
            <div className="flex items-center flex-1 p-1">
              <div className="pl-1 pr-3 text-sm">Brush Width</div>
              <input
                type="range"
                min="3"
                max="100"
                value={inpaintWidth}
                onChange={(e) => setInpaintWidth(parseInt(e.target.value))}
              ></input>
              <div className="pr-3 pl-1 text-sm w-3">{inpaintWidth}px</div>
            </div>

            <div className="flex">
              <button
                className="p-1 bg-sky-100 m-1 text-sm rounded"
                onClick={() => inpaintingRef.current?.undo()}
              >
                Undo
              </button>
              <button
                className="p-1 bg-sky-100 m-1 text-sm rounded"
                onClick={() => inpaintingRef.current?.redo()}
              >
                Redo
              </button>
              <button
                className="p-1 bg-sky-100 m-1 text-sm rounded"
                onClick={() => inpaintingRef.current?.clearCanvas()}
              >
                Clear
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <Button
                onClick={downloadMask}
                className="w-40 max-h-10 flex gap-3"
              >
                <DownloadIcon />
                <span>Masked Image</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={hiddenCanvas} className="hidden"></canvas>
    </div>
  );
};

export default MaskedImageInput;
