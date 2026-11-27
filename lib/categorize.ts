import type { ComplaintCategory } from "../types/complaint";

const keywords: Record<ComplaintCategory, string[]> = {
  garbage: ["garbage", "trash", "rubbish", "waste", "कचरा", "कूड़ा", "कूड़े", "ಕಸ", "ತ್ಯಾಜ್ಯ"],
  water: ["water", "पानी", "जल", "ನೀರು", "ನೀರಿನ"],
  streetlight: ["streetlight", "streetlights", "street light", "street lights", "street-light", "स्ट्रीट लाइट", "सड़क की बत्ती", "ಬೀದಿ ದೀಪ", "ಬೀದಿ ದೀಪಗಳು"],
};

export function categorize(text: string): ComplaintCategory | null {
  const normalized = text.normalize("NFC").toLowerCase().replace(/\s+/g, " ");
  const matches = (Object.keys(keywords) as ComplaintCategory[]).filter((category) =>
    keywords[category].some((keyword) => {
      const pattern = keyword.normalize("NFC");
      return new RegExp(`(?:^|[^\\p{L}\\p{M}\\p{N}])${pattern}(?=$|[^\\p{L}\\p{M}\\p{N}])`, "u").test(normalized);
    }),
  );
  return matches.length === 1 ? matches[0] : null;
}
