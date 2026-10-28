
"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const updateValue = (clientX: number) => {
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      onValueChange(Math.max(min, Math.min(max, steppedValue)));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault(); // Prevent text selection while dragging
        updateValue(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative flex items-center w-full h-6 cursor-pointer touch-none select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Track */}
      <div className="relative flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        {/* Range Fill */}
        <div
          className="absolute h-full bg-cyan-600 dark:bg-cyan-500 rounded-full transition-all duration-75 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Thumb */}
      <div
        className={cn(
            "absolute w-5 h-5 bg-white dark:bg-slate-800 border-2 border-cyan-600 dark:border-cyan-500 rounded-full shadow-sm outline-none transition-transform duration-75 ease-out z-10",
            isDragging && "scale-110 ring-4 ring-cyan-500/20"
        )}
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
};
