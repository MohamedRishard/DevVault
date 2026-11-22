"use client";

import React from "react";
import { Search, X, Layers, Filter } from "lucide-react";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  totalCount: number;
  filteredCount: number;
}

export default function SearchAndFilter({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  totalCount,
  filteredCount,
}: SearchAndFilterProps) {
  const allCategories = ["All", ...categories.filter((c) => c !== "All")];

  return (
    <div className="space-y-4 mb-8">
      {/* Search Input Bar */}
      <div className="relative max-w-3xl mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search resources by title, description, URL, or key feature..."
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl border-2 border-[#FFA97B] bg-white text-charcoal text-base font-medium shadow-sm focus:border-[#E00000] focus:ring-4 focus:ring-[#E00000]/15 outline-none transition"
        />
        <Search className="w-5 h-5 text-[#FFA97B] absolute left-4 top-4" />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-3.5 p-1 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-black/5 transition"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-muted uppercase tracking-wider mr-1 flex-shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#E00000]" />
          <span>Category:</span>
        </div>

        {allCategories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-150 border-2 select-none ${
                isActive
                  ? "bg-[#E00000] text-white border-[#E00000] shadow-sm transform scale-105"
                  : "bg-white text-charcoal border-[#FFA97B] hover:bg-[#FFECCB]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results Count bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted px-1">
        <span>
          Showing <strong className="text-charcoal">{filteredCount}</strong> of{" "}
          <strong className="text-charcoal">{totalCount}</strong> resources
        </span>
        {searchQuery && (
          <span>
            Filtering by: &ldquo;<span className="text-[#E00000]">{searchQuery}</span>&rdquo;
          </span>
        )}
      </div>
    </div>
  );
}
