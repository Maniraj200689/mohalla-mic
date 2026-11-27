import type { ComplaintLanguage } from "../types/complaint";

export const speechLocales: Record<ComplaintLanguage, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
};

export const sampleComplaints: Record<ComplaintLanguage, string> = {
  en: "Garbage has piled up near the bus stop.",
  hi: "सरकारी स्कूल के पास पानी की पाइप से पानी लीक हो रहा है।",
  kn: "ಬಸ್ ನಿಲ್ದಾಣದ ಬಳಿಯ ಬೀದಿ ದೀಪ ಬೆಳಗುತ್ತಿಲ್ಲ.",
};
