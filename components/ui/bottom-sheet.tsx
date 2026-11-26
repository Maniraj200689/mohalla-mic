"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";

export interface BottomSheetProps { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; }

export function BottomSheet({ open, onClose, title, description, children }: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className="bottom-sheet-backdrop" aria-labelledby="bottom-sheet-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <section className="bottom-sheet">
      <div className="bottom-sheet-handle" aria-hidden="true" />
      <header className="bottom-sheet-header">
        <div><h2 id="bottom-sheet-title">{title}</h2>{description && <p className="quiet-note">{description}</p>}</div>
        <Button variant="ghost" iconOnly aria-label="Close panel" onClick={onClose}><X size={20} aria-hidden="true" /></Button>
      </header>
      <div>{children}</div>
    </section>
  </dialog>;
}
