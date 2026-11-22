"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { ToastMessage } from "@/types";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border-2 shadow-lg transition-all transform animate-in slide-in-from-bottom duration-200 ${
              toast.type === "success"
                ? "bg-white text-charcoal border-[#9FED72] shadow-[0_4px_16px_rgba(159,237,114,0.3)]"
                : toast.type === "error"
                ? "bg-white text-charcoal border-[#E00000] shadow-[0_4px_16px_rgba(224,0,0,0.25)]"
                : "bg-white text-charcoal border-[#FFA97B] shadow-[0_4px_16px_rgba(255,169,123,0.3)]"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" && (
                <div className="w-8 h-8 rounded-full bg-[#9FED72] flex items-center justify-center flex-shrink-0 text-charcoal font-bold">
                  <CheckCircle2 className="w-5 h-5 text-charcoal" />
                </div>
              )}
              {toast.type === "error" && (
                <div className="w-8 h-8 rounded-full bg-[#E00000] flex items-center justify-center flex-shrink-0 text-white font-bold">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              )}
              {toast.type === "info" && (
                <div className="w-8 h-8 rounded-full bg-[#FFA97B] flex items-center justify-center flex-shrink-0 text-charcoal font-bold">
                  <Info className="w-5 h-5 text-charcoal" />
                </div>
              )}
              <span className="text-sm font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 p-1 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-black/5 transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
