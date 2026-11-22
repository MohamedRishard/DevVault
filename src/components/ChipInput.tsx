"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface ChipInputProps {
  value: string[];
  onChange: (chips: string[]) => void;
  placeholder?: string;
  maxChips?: number;
}

export default function ChipInput({
  value,
  onChange,
  placeholder = "Type a key function and press Enter or comma...",
  maxChips = 15,
}: ChipInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addChip = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    if (value.length >= maxChips) return;
    onChange([...value, trimmed]);
    setInputValue("");
  };

  const removeChip = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeChip(value.length - 1);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-white rounded-xl border-2 border-[#FFA97B] focus-within:border-[#E00000] focus-within:ring-2 focus-within:ring-[#E00000]/20 min-h-[48px] transition">
        {value.map((chip, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFECCB] border border-[#FFA97B] text-charcoal group"
          >
            <span>{chip}</span>
            <button
              type="button"
              onClick={() => removeChip(idx)}
              className="text-charcoal-muted hover:text-[#E00000] rounded focus:outline-none transition"
              aria-label={`Remove ${chip}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        {value.length < maxChips && (
          <div className="flex-1 flex items-center min-w-[180px]">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (inputValue.trim()) addChip(inputValue);
              }}
              placeholder={value.length === 0 ? placeholder : "Add another..."}
              className="w-full bg-transparent border-none outline-none text-sm text-charcoal placeholder:text-gray-400 focus:ring-0 p-1"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-1.5 px-1 text-xs text-charcoal-muted">
        <span>Press <kbd className="px-1.5 py-0.5 bg-[#FFECCB] border border-[#FFA97B] rounded text-[10px] font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-[#FFECCB] border border-[#FFA97B] rounded text-[10px] font-mono">,</kbd> to add</span>
        <span>{value.length}/{maxChips}</span>
      </div>
    </div>
  );
}
