// Honorifics can introduce several name tokens, especially in unpunctuated
// speech. Redact conservatively through the next clause boundary.
const honorificAndName = /(^|[^\p{L}\p{M}\p{N}])(?:mr|mrs|ms|miss|dr|prof|shri|sri|smt|श्रीमान|श्रीमती|श्री|सुश्री|डॉ|ಶ್ರೀಮತಿ|ಶ್ರೀ|ಸುಶ್ರೀ|ಡಾ)\.?\s+\p{L}[^,;!?।\n]*(?=$|[,;!?।\n])/giu;

export function sanitize(text: string): string {
  return text.normalize("NFC")
    .replace(honorificAndName, "$1[redacted]")
    .replace(/\p{Nd}{4,}/gu, "[redacted]")
    .trim();
}
