"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";

export interface CustomDropdownOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface CustomDropdownProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: (string | CustomDropdownOption)[];
  placeholder?: string;
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const normalizedOptions: CustomDropdownOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedOption =
    normalizedOptions.find((opt) => opt.value === value) ||
    normalizedOptions.find((opt) => opt.label === value);

  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="text-[11px] font-bold text-slate-700 block mb-1">
          {label} {required && <span className="text-blue-600">*</span>}
        </label>
      )}

      {/* Main Trigger Box: Compact, Sleek & Non-Jumping */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-9.5 px-3 bg-white rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs select-none ${
          isOpen
            ? "border-2 border-slate-900 ring-2 ring-slate-900/10"
            : "border border-slate-300 hover:border-slate-400"
        }`}
      >
        <span className="truncate pr-2 font-bold text-slate-800 text-xs">
          {displayLabel}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-slate-900" : ""
          }`}
        />
      </button>

      {/* Floating Popover List */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[200px] bg-white rounded-xl shadow-xl border border-slate-200 p-1 space-y-0.5 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 font-medium text-center">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt, idx) => {
              const isSelected = selectedOption?.value === opt.value;
              return (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isSelected ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    />
                    <span className="truncate">{opt.label}</span>
                    {opt.subLabel && (
                      <span className="text-[10px] text-slate-400 font-normal truncate">
                        ({opt.subLabel})
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
