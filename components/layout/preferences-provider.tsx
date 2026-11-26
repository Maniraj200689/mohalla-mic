"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ComplaintLanguage } from "@/types/complaint";

type Theme = "dark" | "light";
interface Preferences { theme: Theme; largeText: boolean; language: ComplaintLanguage; ready: boolean; setTheme: (theme: Theme) => void; toggleTheme: () => void; setLargeText: (enabled: boolean) => void; setLanguage: (language: ComplaintLanguage) => void; }
const PreferencesContext = createContext<Preferences | null>(null);
const STORAGE_KEY = "mohalla-mic:preferences:v1";
const languageSet = new Set<ComplaintLanguage>(["en", "hi", "kn"]);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [largeText, setLargeText] = useState(false);
  const [language, setLanguage] = useState<ComplaintLanguage>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved: unknown = JSON.parse(raw);
          if (saved && typeof saved === "object") {
            const values = saved as Record<string, unknown>;
            if (values.theme === "light" || values.theme === "dark") setTheme(values.theme);
            if (typeof values.largeText === "boolean") setLargeText(values.largeText);
            if (typeof values.language === "string" && languageSet.has(values.language as ComplaintLanguage)) setLanguage(values.language as ComplaintLanguage);
          }
        }
      } catch { /* Keep accessible defaults when storage is unavailable or invalid. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.largeText = String(largeText);
  }, [theme, largeText]);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, largeText, language })); }
    catch { /* Preferences still work for this session if storage is unavailable. */ }
  }, [theme, largeText, language, ready]);

  const toggleTheme = useCallback(() => setTheme((current) => current === "dark" ? "light" : "dark"), []);
  const value = useMemo(() => ({ theme, largeText, language, ready, setTheme, toggleTheme, setLargeText, setLanguage }), [theme, largeText, language, ready, toggleTheme]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside PreferencesProvider");
  return value;
}
