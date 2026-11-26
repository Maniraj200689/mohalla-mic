"use client";

import { Moon, Sun, Type } from "lucide-react";
import { Button } from "@/components/ui";
import { usePreferences } from "./preferences-provider";

export function PreferenceControls() {
  const { theme, toggleTheme, largeText, setLargeText, ready } = usePreferences();
  return <div className="header-actions">
    <Button variant="ghost" iconOnly disabled={!ready} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme}>{theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}</Button>
    <Button variant={largeText ? "secondary" : "ghost"} iconOnly disabled={!ready} aria-label={largeText ? "Turn off large text" : "Turn on large text"} aria-pressed={largeText} onClick={() => setLargeText(!largeText)}><Type size={19} aria-hidden="true" /></Button>
  </div>;
}
