import { Ref, useRef, useState } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import clsx from "clsx";

type Props = {
  isEnabled?: boolean;
  strokeWidth: number;
  waitInpaint: boolean;
  canvasRef: Ref<ReactSketchCanvasRef> | undefined;
  setHasInpainted: (b: boolean) => void;
  width?: number;
};

export const InpaintCanvas = ({
  isEnabled = true,
  canvasRef,
  strokeWidth,
  waitInpaint,
  setHasInpainted,
  width,
}: Props) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [show, setShow] = useState(false);
  const conatinerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      ref={conatinerRef}
      onMouseMove={(e) => {
        const { clientX: x, clientY: y } = e;
        const { x: conX, y: conY } =
          conatinerRef.current!.getBoundingClientRect();
        setX(x - conX);
        setY(y - conY);
      }}
      className={clsx(
        "absolute top-0 left-0 w-full h-full cursor-none",
        waitInpaint ? "pointer-events-none bg-slate-500" : ""
      )}
      style={{ zIndex: 100, pointerEvents: isEnabled ? "auto" : "none" }}
    >
      <div className="absolute h-full pointer-events-none">
        <div
          className={clsx(show ? "" : "hidden", "canvas-cursor")}
          style={{
            position: "relative",
            left: x,
            top: y,
            width: `${strokeWidth}px`,
            height: `${strokeWidth}px`,
          }}
        ></div>
      </div>
      <ReactSketchCanvas
        onChange={(e) => setHasInpainted(e.length > 0)}
        ref={canvasRef}
        strokeWidth={strokeWidth}
        strokeColor="#fff"
        canvasColor="transparent"
        style={{
          border: 0,
          opacity: 0.6,
          width,
        }}
      />
    </div>
  );
};
