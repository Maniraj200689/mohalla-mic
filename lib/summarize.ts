import type { ComplaintCategory, ComplaintLanguage } from "../types/complaint";

const titles: Record<ComplaintLanguage, Record<ComplaintCategory, string>> = {
  en: { garbage: "Garbage report", water: "Water report", streetlight: "Streetlight report" },
  hi: { garbage: "कचरे की शिकायत", water: "पानी की शिकायत", streetlight: "स्ट्रीट लाइट की शिकायत" },
  kn: { garbage: "ಕಸದ ದೂರು", water: "ನೀರಿನ ದೂರು", streetlight: "ಬೀದಿ ದೀಪದ ದೂರು" },
};

export function summarize(description: string, category: ComplaintCategory, language: ComplaintLanguage) {
  // Keep the resident's wording. This preserves qualifiers and avoids adding
  // details about causes, timing, or severity that were never reported.
  return { title: titles[language][category], description: description.replace(/\s+/gu, " ").trim() };
}
