import React from "react";

export type FilterType = 'dropdown' | 'range';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  type: FilterType;
  label: string;
  value: string | [number, number];
  options?: FilterOption[]; // for dropdown
  onChange: (value: string | [number, number]) => void;
  className?: string;
  min?: number; // for range
  max?: number; // for range
  step?: number; // for range
  placeholder?: [string, string]; // for range
}

interface SearchFilterBarProps {
  filters?: FilterConfig[];
  rightContent?: React.ReactNode; // e.g. view switcher, add button, etc.
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters = [],
  rightContent,
}: SearchFilterBarProps) => (
  <div className="flex flex-col gap-4 justify-between mb-6 md:flex-row">
    <div className="flex flex-col gap-4 w-full md:flex-row">
      {filters.map((filter: FilterConfig, idx: number) => (
        <div className="flex gap-2 items-center" key={filter.label + idx}>
          <label className="text-sm text-secondary-700">{filter.label}</label>
          {filter.type === 'dropdown' && filter.options && (
            <select
              value={filter.value as string}
              onChange={e => filter.onChange(e.target.value)}
              className={filter.className || "min-w-[120px] px-2 py-2 rounded border border-gray-200 text-xs"}
            >
              {filter.options.map((opt: FilterOption) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {/* Range filter: move hooks to top level, render here if type === 'range' */}
          {filter.type === 'range' && <RangeSlider filter={filter} />}
          {!filter.type && filter.options && (
            <select
              value={filter.value as string}
              onChange={e => filter.onChange(e.target.value)}
              className={filter.className || "min-w-[120px] px-2 py-2 rounded border border-gray-200 text-xs"}
            >
              {filter.options.map((opt: FilterOption) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>
      ))}
      {rightContent && <div className="flex gap-2 items-center ml-auto">{rightContent}</div>}
    </div>
  </div>
);

// RangeSlider component for range filter
function RangeSlider({ filter }: { filter: FilterConfig }) {
  const min = filter.min ?? 0;
  const max = filter.max ?? 1000;
  const value = Array.isArray(filter.value) ? filter.value : [min, max];
  const [localMin, setLocalMin] = React.useState(value[0]);
  const [localMax, setLocalMax] = React.useState(value[1]);

  React.useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);
  }, [value[0], value[1]]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localMax - (filter.step ?? 1));
    setLocalMin(newMin);
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localMin + (filter.step ?? 1));
    setLocalMax(newMax);
  };
  const commitChange = () => {
    filter.onChange([localMin, localMax]);
  };
  const percent = (val: number) => ((val - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col w-56">
      <div className="flex relative items-center h-8">
        {/* Track background */}
        <div className="absolute right-0 left-0 h-1 bg-gray-200 rounded" />
        {/* Track fill */}
        <div
          className="absolute h-1 bg-indigo-500 rounded"
          style={{
            left: `${percent(localMin)}%`,
            right: `${100 - Math.min(percent(localMax), 100)}%`,
          }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={filter.step ?? 1}
          value={localMin}
          onChange={handleMinChange}
          onMouseUp={commitChange}
          onMouseLeave={commitChange}
          className="absolute w-full h-1 bg-transparent appearance-none pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-indigo-500
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:cursor-pointer
            focus:outline-none"
          style={{ zIndex: localMin === localMax ? 3 : 2 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={filter.step ?? 1}
          value={localMax}
          onChange={handleMaxChange}
          onMouseUp={commitChange}
          onMouseLeave={commitChange}
          className="absolute w-full h-1 bg-transparent appearance-none pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-indigo-500
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:cursor-pointer
            focus:outline-none"
          style={{ zIndex: 3 }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>${localMin}</span>
        <span>${localMax}</span>
      </div>
    </div>
  );
}

export default SearchFilterBar;