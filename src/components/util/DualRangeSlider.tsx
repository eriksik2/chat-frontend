import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaAlignJustify } from "react-icons/fa6";

type DualRangeSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  knobBuilder?: (knob: "left" | "right", value: number) => React.ReactNode;
  rangeBuilder?: (value: [number, number]) => React.ReactNode;
};

export function defaultKnobBuilder(knob: "left" | "right", value: number) {
  return (
    <div className="m-[2px] h-5 w-3 bg-slate-500 p-[1px] active:bg-slate-400">
      <div className="flex h-full w-full items-center overflow-hidden bg-slate-400 active:bg-slate-500">
        <FaAlignJustify className="text-slate-600" />
      </div>
    </div>
  );
}

export function defaultRangeBuilder(value: [number, number]) {
  return <div className="h-2 w-full bg-blue-500 shadow-md" />;
}

export default function DualRangeSlider(props: DualRangeSliderProps) {
  const knobBuilder = props.knobBuilder ?? defaultKnobBuilder;
  const rangeBuilder = props.rangeBuilder ?? defaultRangeBuilder;
  const [leftOffset, setLeftOffset] = useState(0);
  const [rightOffset, setRightOffset] = useState(0);
  const [height, setHeight] = useState(4);

  return (
    <div className="flex flex-grow items-center justify-stretch gap-2">
      <div className="flex w-7 justify-center">
        {Math.round(props.value[0] * 100) / 100}
      </div>
      <div className="flex-grow overflow-hidden bg-slate-400 p-[1px]">
        <div
          className="relative flex-grow bg-slate-300 shadow-inner"
          style={{
            height: `${height}px`,
          }}
        >
          <SliderHandle
            value={props.value[0]}
            min={props.min}
            max={props.max}
            localMax={props.value[1]}
            knob={"left"}
            onChange={(value) => props.onChange([value, props.value[1]])}
            reportTranslationX={setLeftOffset}
            reportHeight={setHeight}
            knobBuilder={knobBuilder}
          />
          <div
            className="absolute left-0 top-0 z-10 flex h-full items-center justify-stretch"
            style={{
              width: `${rightOffset - leftOffset}px`,
              transform: `translateX(${leftOffset}px)`,
            }}
          >
            {rangeBuilder(props.value)}
          </div>
          <SliderHandle
            value={props.value[1]}
            min={props.min}
            max={props.max}
            localMin={props.value[0]}
            knob={"right"}
            onChange={(value) => props.onChange([props.value[0], value])}
            reportTranslationX={setRightOffset}
            reportHeight={setHeight}
            knobBuilder={knobBuilder}
          />
        </div>
      </div>
      <div className="flex w-7 justify-center">
        {Math.round(props.value[1] * 100) / 100}
      </div>
    </div>
  );
}

type SliderHandleProps = {
  value: number;
  min: number;
  max: number;
  localMin?: number;
  localMax?: number;
  knob: "left" | "right";
  onChange: (value: number) => void;
  reportTranslationX?: (tx: number) => void;
  reportHeight?: (height: number) => void;
  knobBuilder: (knob: "left" | "right", value: number) => React.ReactNode;
};

function SliderHandle(props: SliderHandleProps) {
  const [current, setCurrent] = useState<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const cbRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setCurrent(node);
      props.reportHeight?.(node.getBoundingClientRect().height);

      setTimeout(() => {
        const knobWidth = node?.getBoundingClientRect()?.width ?? 4;
        const knobOffset =
          props.knob === "left" ? -knobWidth / 4 : knobWidth / 4;
        const x = node.getBoundingClientRect().x;
        const sx = node.parentElement!.getBoundingClientRect().x;
        const tx = x - sx + knobWidth / 2 + knobOffset;
        props.reportTranslationX?.(tx);
      }, 50);
    }
  }, []);

  useEffect(() => {
    if (current === null) return;
    const knobWidth = current!.getBoundingClientRect()?.width ?? 4;
    const knobOffset = props.knob === "left" ? -knobWidth / 4 : knobWidth / 4;
    const x = current!.getBoundingClientRect().x;
    const sx = current!.parentElement!.getBoundingClientRect().x;
    const tx = x - sx + knobWidth / 2 + knobOffset;
    props.reportTranslationX?.(tx);
  }, [props.value, props.min, props.max]);

  function txFromVal(val: number) {
    const bounds = current?.getBoundingClientRect();
    const sliderBounds = current?.parentElement?.getBoundingClientRect();

    const handleWidth = bounds?.width ?? 4;
    const sliderMax = sliderBounds?.width ?? 100;

    const valFactor = (val - props.min) / (props.max - props.min);

    const tx = (sliderMax - handleWidth) * valFactor;
    return tx;
  }

  function drag(mouseX: number, cnt: HTMLDivElement) {
    const sliderBounds =
      cnt.parentElement!.parentElement!.getBoundingClientRect();
    const tx = mouseX - sliderBounds.x;
    const convFactor = (props.max - props.min) / sliderBounds.width;
    const value = Math.max(
      props.localMin ?? props.min,
      Math.min(props.localMax ?? props.max, tx * convFactor + props.min),
    );
    const knobWidth = current?.getBoundingClientRect()?.width ?? 4;
    const knobOffset = props.knob === "left" ? -knobWidth / 4 : knobWidth / 4;
    props.reportTranslationX?.(txFromVal(value) + knobWidth / 2 + knobOffset);
    props.onChange(value);
  }

  return (
    <div
      ref={cbRef}
      className="pointer-events-none absolute left-0 top-0 z-20 flex"
      style={{
        transform: `translateX(${txFromVal(props.value)}px)`,
      }}
    >
      {props.knob === "right" && (
        <div className="invisible">
          {props.knobBuilder(props.knob, props.value)}
        </div>
      )}
      <div
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setDragImage(new Image(), 0, 0);
          setIsDragging(true);
        }}
        onDragEnd={() => setIsDragging(false)}
        onDrag={(e) => {
          if (e.clientX === 0) return;
          drag(e.clientX, e.currentTarget);
        }}
        className="pointer-events-auto"
      >
        {props.knobBuilder(props.knob, props.value)}
      </div>
      {props.knob === "left" && (
        <div className="invisible">
          {props.knobBuilder(props.knob, props.value)}
        </div>
      )}
    </div>
  );
}
