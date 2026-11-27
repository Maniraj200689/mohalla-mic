import type { ComplaintLanguage } from "../types/complaint";

const landmarkPatterns: Record<ComplaintLanguage, RegExp> = {
  en: /\b(?:near|next to|opposite|in front of|beside)\s+(?:the\s+)?([^,.!?;]+?)(?=\s+(?:is|are|has|have|was|were|and|but|with|since|today|yesterday)\b|[,.!?;]|$)/iu,
  hi: /([^,.!?;।]+?)\s+(?:के पास|के सामने|के बगल में|के नज़दीक|के नजदीक)(?=\s|[,.!?;।]|$)/u,
  kn: /([^,.!?;]+?)\s+(?:ಬಳಿಯ|ಬಳಿ|ಹತ್ತಿರ|ಎದುರು|ಪಕ್ಕದಲ್ಲಿ)(?=\s|[,.!?;]|$)/u,
};

export function extractLandmark(text: string, language: ComplaintLanguage): string {
  const matches = [...text.normalize("NFC").matchAll(new RegExp(landmarkPatterns[language], "gu" + (language === "en" ? "i" : "")))];
  return matches.length === 1 ? matches[0][1].trim() : "";
}
