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
    const [internalValue, setInternalValue] = React.useState(defaultValue?.[0] ?? min);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? (value?.[0] ?? min) : internalValue;

    const percentage = max > min ? ((currentValue - min) / (max - min)) * 100 : 0;

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
          min={min}
          max={max}
          step={step}
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
