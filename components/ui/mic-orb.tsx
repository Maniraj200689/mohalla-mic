"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

interface MicOrbProps { listening?: boolean; disabled?: boolean; onClick?: () => void; label?: string; }

export function MicOrb({ listening = false, disabled = false, onClick, label }: MicOrbProps) {
  const reduceMotion = useReducedMotion();
  const text = label ?? (listening ? "Listening" : "Microphone preview");
  return <div>
    <motion.button type="button" className="mic-orb" aria-label={text} aria-pressed={listening} disabled={disabled} onClick={onClick}
      animate={listening && !reduceMotion ? { scale: [1, 1.06, 1], boxShadow: ["0 0 0 10px rgba(217,183,126,.08), 0 0 32px rgba(217,183,126,.22)", "0 0 0 16px rgba(217,183,126,.05), 0 0 48px rgba(217,183,126,.32)", "0 0 0 10px rgba(217,183,126,.08), 0 0 32px rgba(217,183,126,.22)"] } : { scale: 1 }}
      transition={listening && !reduceMotion ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}>
      {listening ? <Mic size={30} aria-hidden="true" /> : <MicOff size={28} aria-hidden="true" />}
    </motion.button>
    <div className="mic-orb-label" aria-live="polite">{text}</div>
  </div>;
}
