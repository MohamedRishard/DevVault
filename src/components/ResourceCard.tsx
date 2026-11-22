"use client";

import React, { useState } from "react";
import { ExternalLink, Copy, Check, Edit2, Trash2, Star, GitFork, Globe } from "lucide-react";
import { Resource } from "@/types";
import { useToast } from "./Toast";

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string, title: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
}

export default function ResourceCard({
  resource,
  onEdit,
  onDelete,
  onTogglePin,
}: ResourceCardProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const isGitHub = (() => {
    try {
      const u = new URL(resource.url);
      return u.hostname.includes("github.com");
    } catch {
      return resource.url.includes("github.com");
    }
  })();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(resource.url);
      setCopied(true);
      showToast("URL copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy URL", "error");
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between p-5 hover:shadow-card hover:-translate-y-0.5 ${
        resource.isPinned ? "border-[#E00000] ring-1 ring-[#E00000]/30" : "border-[#FFA97B]"
      }`}
    >
      {/* Top row: Category pill, badges, pin button */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFA97B] text-charcoal border border-[#FFA97B]">
              {resource.category}
            </span>

            {isGitHub && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-charcoal text-white">
                <GitFork className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </span>
            )}

            {resource.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FFE5E5] text-[#E00000] border border-[#E00000]/20">
                <Star className="w-3 h-3 fill-current" />
                <span>Pinned</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(resource.id, !resource.isPinned)}
                title={resource.isPinned ? "Unpin resource" : "Pin resource to top"}
                className={`p-1.5 rounded-lg transition ${
                  resource.isPinned
                    ? "text-[#E00000] hover:bg-[#FFE5E5]"
                    : "text-gray-400 hover:text-[#E00000] hover:bg-[#FFECCB]"
                }`}
              >
                <Star className={`w-4 h-4 ${resource.isPinned ? "fill-current" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Title & External Link */}
        <div className="mb-2.5">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold text-charcoal hover:text-[#E00000] transition group-hover:underline inline-flex items-center gap-1.5 line-clamp-1"
            title={resource.title}
          >
            <span>{resource.title}</span>
            <ExternalLink className="w-4 h-4 text-charcoal-muted group-hover:text-[#E00000] flex-shrink-0" />
          </a>
          <p className="text-xs text-charcoal-muted truncate font-mono mt-0.5" title={resource.url}>
            {resource.url}
          </p>
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-sm text-charcoal/80 leading-relaxed mb-4 line-clamp-3">
            {resource.description}
          </p>
        )}

        {/* Main Functions Badges */}
        {resource.mainFunctions && resource.mainFunctions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {resource.mainFunctions.map((func, i) => (
              <span
                key={i}
                className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#9FED72]/30 border border-[#9FED72] text-charcoal"
              >
                {func}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="pt-3 border-t border-[#FFA97B]/40 flex items-center justify-between gap-2 mt-2">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E00000] text-white hover:bg-[#C00000] transition active:scale-95 shadow-sm"
        >
          <span>Open Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy URL"
            className="p-1.5 rounded-lg border border-[#FFA97B] bg-white hover:bg-[#FFECCB] text-charcoal transition"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#9FED72] stroke-[3]" />
            ) : (
              <Copy className="w-4 h-4 text-charcoal" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onEdit(resource)}
            title="Edit Resource"
            className="p-1.5 rounded-lg border border-[#FFA97B] bg-white hover:bg-[#FFECCB] text-charcoal transition"
          >
            <Edit2 className="w-4 h-4 text-charcoal" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(resource.id, resource.title)}
            title="Delete Resource"
            className="p-1.5 rounded-lg border border-[#FFA97B] bg-white hover:bg-[#FFE5E5] text-[#E00000] transition"
          >
            <Trash2 className="w-4 h-4 text-[#E00000]" />
          </button>
        </div>
      </div>
    </div>
  );
}
