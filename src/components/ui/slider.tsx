import * as React from "react";

import { cn } from "@/lib/utils";

type SliderProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange"
> & {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
};

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      ...props
    },
    ref
  ) => {
    const numericMin = typeof min === "number" ? min : Number(min ?? 0);
    const numericMax = typeof max === "number" ? max : Number(max ?? 100);
    const numericStep = typeof step === "number" ? step : Number(step ?? 1);

    const [internalValue, setInternalValue] = React.useState(defaultValue?.[0] ?? numericMin);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? (value?.[0] ?? numericMin) : internalValue;

    const percentage = numericMax > numericMin
      ? ((currentValue - numericMin) / (numericMax - numericMin)) * 100
      : 0;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = Number(event.target.value);
      if (!isControlled) setInternalValue(nextValue);
      onValueChange?.([nextValue]);
    };

    const commitChange = () => {
      onValueCommit?.([currentValue]);
    };

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="absolute h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }} />
        </div>
        <input
          ref={ref}
          type="range"
          min={numericMin}
          max={numericMax}
          step={numericStep}
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          onMouseUp={commitChange}
          onTouchEnd={commitChange}
          onKeyUp={commitChange}
          className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent accent-primary disabled:pointer-events-none disabled:opacity-50"
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
