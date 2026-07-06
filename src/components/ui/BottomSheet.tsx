"use client";

import { useEffect } from "react";
import clsx from "clsx";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close with ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        onPointerDown={(e) => {
          try {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
          } catch (err) {}
        }}
        className={clsx(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        )}
      />

      {/* Sheet */}
      <div
        className={clsx(
          "fixed bottom-0 left-1/2 z-[99] w-full max-w-4xl -translate-x-1/2 rounded-t-3xl bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-14 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            onPointerDown={(e) => {
              try {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
              } catch (err) {}
            }}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto p-5 pb-8">
          {children}
        </div>
      </div>
    </>
  );
}