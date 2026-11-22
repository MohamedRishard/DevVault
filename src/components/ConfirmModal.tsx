"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-[#FFA97B] shadow-2xl max-w-md w-full p-6 transform transition-all animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${isDestructive ? "bg-[#FFE5E5] text-[#E00000] border border-[#E00000]/20" : "bg-[#FFECCB] text-charcoal"}`}>
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-charcoal">{title}</h3>
            <p className="text-sm text-charcoal-muted mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border-2 border-[#FFA97B] bg-white hover:bg-[#FFECCB] text-charcoal font-semibold text-sm transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl font-bold text-sm text-white shadow-md transition disabled:opacity-50 ${
              isDestructive
                ? "bg-[#E00000] hover:bg-[#C00000] focus:ring-2 focus:ring-[#E00000]"
                : "bg-charcoal hover:bg-black"
            }`}
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
