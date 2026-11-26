"use client";

import type { ComplaintLanguage } from "@/types/complaint";
import { usePreferences } from "./preferences-provider";
import { Chip } from "@/components/ui";

const languages: { code: ComplaintLanguage; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

export function LanguageSelector({ label = "Choose language" }: { label?: string }) {
  const { language, setLanguage, ready } = usePreferences();
  return <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
    <legend className="sr-only">{label}</legend>
    <div className="utility-row" role="group" aria-label={label}>
      {languages.map((item) => <Chip key={item.code} selected={language === item.code} disabled={!ready} aria-label={item.label} aria-pressed={language === item.code} onClick={() => setLanguage(item.code)}>{item.native}</Chip>)}
    </div>
  </fieldset>;
}
