import { useEffect, useRef, useState } from "react";

export function useSpeechSynthesis() {
  const active = useRef<SpeechSynthesisUtterance | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (!active.current) return;
    active.current = null;
    window.speechSynthesis.cancel();
  }, []);

  function stop() {
    if (active.current) {
      active.current = null;
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setError("");
  }

  function speak(text: string, locale: string) {
    stop();
    const engine = window.speechSynthesis;
    if (!engine || typeof window.SpeechSynthesisUtterance !== "function") {
      setError("Read-back is unavailable. You can review the written summary.");
      return;
    }
    try {
      const language = locale.toLowerCase().split("-")[0];
      const voices = engine.getVoices();
      const voice = voices.find((item) => item.lang.toLowerCase() === locale.toLowerCase())
        ?? voices.find((item) => item.lang.toLowerCase().split(/[-_]/)[0] === language);
      if (!voice) {
        setError("No voice is available for this language. You can review the written summary.");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice.lang;
      utterance.voice = voice;
      const finish = (message: string) => {
        if (active.current !== utterance) return;
        active.current = null;
        setSpeaking(false);
        setError(message);
      };
      utterance.onend = () => finish("");
      utterance.onerror = () => finish("Read-back could not finish. You can review the written summary.");
      active.current = utterance;
      setSpeaking(true);
      engine.speak(utterance);
    } catch {
      stop();
      setError("Read-back could not start. You can review the written summary.");
    }
  }

  return { speak, stop, speaking, error };
}
