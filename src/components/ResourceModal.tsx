"use client";

import React, { useState, useEffect } from "react";
import { X, Globe, Star, Tag, FileText, CheckCircle2 } from "lucide-react";
import ChipInput from "./ChipInput";
import { Resource } from "@/types";

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    url: string;
    category: string;
    description: string;
    mainFunctions: string[];
    isPinned: boolean;
  }) => Promise<void>;
  initialData?: Resource | null;
  existingCategories: string[];
}

const DEFAULT_CATEGORIES = [
  "Free Tools",
  "GitHub Repos",
  "Cybersecurity",
  "AI / ML",
  "Full-Stack",
  "Documentation",
  "DevOps",
];

export default function ResourceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingCategories,
}: ResourceModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Free Tools");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [description, setDescription] = useState("");
  const [mainFunctions, setMainFunctions] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combine unique categories
  const categoriesList = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories])
  ).filter(Boolean);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setDescription(initialData.description || "");
      setMainFunctions(initialData.mainFunctions || []);
      setIsPinned(initialData.isPinned);

      if (categoriesList.includes(initialData.category)) {
        setCategory(initialData.category);
        setIsCustomCategory(false);
        setCustomCategory("");
      } else {
        setIsCustomCategory(true);
        setCustomCategory(initialData.category);
      }
    } else {
      setTitle("");
      setUrl("");
      setCategory("Free Tools");
      setCustomCategory("");
      setIsCustomCategory(false);
      setDescription("");
      setMainFunctions([]);
      setIsPinned(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!url.trim()) {
      setError("Please enter a valid website or repository URL");
      return;
    }
    if (!finalCategory) {
      setError("Please select or enter a category");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: title.trim(),
        url: url.trim(),
        category: finalCategory,
        description: description.trim(),
        mainFunctions,
        isPinned,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save resource";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-[#FFA97B] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#FFA97B] flex items-center justify-between bg-[#FFECCB]">
          <h2 className="text-xl font-black text-charcoal flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E00000]"></span>
            {initialData ? "Edit Resource" : "Add New Resource"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-black/5 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FFE5E5] border border-[#E00000] text-[#E00000] rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
              Title <span className="text-[#E00000]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., PortSwigger Web Security Academy"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#FFA97B] text-charcoal text-sm focus:border-[#E00000] focus:ring-2 focus:ring-[#E00000]/20 outline-none transition"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
              Website / GitHub URL <span className="text-[#E00000]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo or portswigger.net"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-[#FFA97B] text-charcoal text-sm font-mono focus:border-[#E00000] focus:ring-2 focus:ring-[#E00000]/20 outline-none transition"
              />
              <Globe className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
            </div>
            <p className="text-[11px] text-charcoal-muted mt-1">
              `https://` will be automatically prepended if omitted.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
              Category <span className="text-[#E00000]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={isCustomCategory ? "__custom__" : category}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#FFA97B] text-charcoal text-sm bg-white focus:border-[#E00000] focus:ring-2 focus:ring-[#E00000]/20 outline-none transition"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">+ Custom Category...</option>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E00000] text-charcoal text-sm focus:ring-2 focus:ring-[#E00000]/20 outline-none transition"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Short Description
              </label>
              <span className="text-[11px] text-charcoal-muted">
                {description.length}/300
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this tool, laboratory, or repository does..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#FFA97B] text-charcoal text-sm focus:border-[#E00000] focus:ring-2 focus:ring-[#E00000]/20 outline-none transition resize-none"
            />
          </div>

          {/* Main Functions Chip Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
              Main Functions / Key Features
            </label>
            <ChipInput
              value={mainFunctions}
              onChange={setMainFunctions}
              placeholder="e.g., SQLi Labs, XSS Practice, Burp Guide"
              maxChips={10}
            />
          </div>

          {/* Pin to Top Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-[#FFA97B] bg-[#FFECCB]/40 hover:bg-[#FFECCB] cursor-pointer transition select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-[#E00000] focus:ring-[#E00000] accent-[#E00000]"
              />
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${isPinned ? "text-[#E00000] fill-current" : "text-charcoal-muted"}`} />
                <span className="text-sm font-bold text-charcoal">Pin to Top</span>
              </div>
              <span className="text-xs text-charcoal-muted ml-auto">
                Keep featured at the top of the vault
              </span>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-[#FFA97B]/40 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border-2 border-[#FFA97B] bg-white hover:bg-[#FFECCB] text-charcoal font-semibold text-sm transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#E00000] hover:bg-[#C00000] text-white font-bold text-sm shadow-vault transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Saving..." : initialData ? "Save Changes" : "Add to Vault"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
