import { useEffect, useRef, useState } from "react";

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

const messages: Record<string, string> = {
  "not-allowed": "Microphone permission was denied. You can type your report.",
  "service-not-allowed": "Speech recognition permission was denied. You can type your report.",
  "audio-capture": "No microphone is available. You can type your report.",
  "language-not-supported": "This browser cannot recognize the selected language. You can type your report.",
  "no-speech": "No speech was detected. Try again or type your report.",
  network: "The speech service could not connect. Try again or type your report.",
};

type Status = "idle" | "starting" | "listening" | "stopping";

export function useSpeechRecognition(locale: string, onFinal: (text: string) => void) {
  const session = useRef<Recognition | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState({ final: "", interim: "" });
  const [error, setError] = useState("");

  useEffect(() => () => {
    const active = session.current;
    session.current = null;
    active?.abort();
  }, []);

  function cancel() {
    const active = session.current;
    session.current = null;
    active?.abort();
    setStatus("idle");
    setTranscript({ final: "", interim: "" });
    setError("");
  }

  function start() {
    if (session.current) return;
    const browser = window as RecognitionWindow;
    const Constructor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Constructor) {
      setError("Speech recognition is unavailable in this browser. You can type your report.");
      return;
    }

    let final = "";
    setError("");
    setTranscript({ final: "", interim: "" });
    try {
      const recognition = new Constructor();
      session.current = recognition;
      recognition.lang = locale;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => {
        if (session.current === recognition) setStatus("listening");
      };
      const finish = (message: string) => {
        if (session.current !== recognition) return;
        session.current = null;
        setStatus("idle");
        setTranscript({ final: "", interim: "" });
        setError(message);
        if (final) onFinal(final);
      };
      recognition.onresult = ({ results }) => {
        if (session.current !== recognition) return;
        const all = Array.from(results);
        final = all.filter((result) => result.isFinal).map((result) => result[0].transcript.trim()).join(" ").trim();
        const interim = all.filter((result) => !result.isFinal).map((result) => result[0].transcript.trim()).join(" ");
        setTranscript({ final, interim });
      };
      recognition.onerror = ({ error }) => finish(messages[error] ?? "Speech recognition stopped. Try again or type your report.");
      recognition.onend = () => finish(final ? "" : messages["no-speech"]);
      setStatus("starting");
      recognition.start();
    } catch (failure) {
      cancel();
      setError(failure instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(failure.name)
        ? messages["not-allowed"] : "Could not start speech recognition. You can type your report.");
    }
  }

  function stop() {
    if (!session.current || status !== "listening") return;
    setStatus("stopping");
    try {
      session.current.stop();
    } catch {
      cancel();
      setError("Could not finish speech recognition. You can type your report.");
    }
  }

  return { start, stop, cancel, status, transcript, error };
}
