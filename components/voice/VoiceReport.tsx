"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";
import { categorize } from "../../lib/categorize";
import { extractLandmark } from "../../lib/extractLandmark";
import { sampleComplaints, speechLocales } from "../../lib/sampleComplaints";
import { sanitize } from "../../lib/sanitize";
import { summarize } from "../../lib/summarize";
import type {
  Complaint, ComplaintCategory, ComplaintDraft, ComplaintLanguage, ComplaintStore, NewComplaintInput,
} from "../../types/complaint";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export type VoiceReportStorage = Pick<ComplaintStore, "create">;

export interface VoiceReportProps {
  language: ComplaintLanguage;
  resolveLocation: (
    draft: Readonly<ComplaintDraft>,
  ) => ComplaintDraft["coordinates"] | Promise<ComplaintDraft["coordinates"]>;
  storage: VoiceReportStorage;
  onSaved?: (complaint: Complaint) => void;
}

const statusText = {
  idle: "",
  starting: "Starting the microphone…",
  listening: "Listening…",
  stopping: "Finishing transcription…",
};

export function VoiceReport(props: VoiceReportProps) {
  const [description, setDescription] = useState("");
  return <ReportSession key={props.language} {...props} description={description} setDescription={setDescription} />;
}

type ReportSessionProps = VoiceReportProps & {
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
};

function ReportSession({ language, resolveLocation, storage, onSaved, description, setDescription }: ReportSessionProps) {
  const id = useId();
  const [categoryOverride, setCategoryOverride] = useState<ComplaintCategory | "">("");
  const [landmarkOverride, setLandmarkOverride] = useState<string | null>(null);
  const [review, setReview] = useState<NewComplaintInput | null>(null);
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState(false);
  const [saved, setSaved] = useState(false);
  const reviewRequest = useRef<symbol | null>(null);
  const saveGuard = useRef(false);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const editField = useRef<HTMLTextAreaElement>(null);
  const returnToEdit = useRef(false);
  const locale = speechLocales[language];
  const speech = useSpeechRecognition(locale, (final) => {
    setDescription((current) => [current.trim(), final].filter(Boolean).join(" "));
  });
  const readBack = useSpeechSynthesis();
  const category = categoryOverride || categorize(sanitize(description));
  const landmark = landmarkOverride ?? extractLandmark(sanitize(description), language);
  const recording = speech.status !== "idle";

  useEffect(() => () => { reviewRequest.current = null; }, []);
  useEffect(() => {
    if (review) reviewHeading.current?.focus();
    else if (returnToEdit.current) {
      returnToEdit.current = false;
      editField.current?.focus();
    }
  }, [review]);

  async function prepareReview() {
    if (reviewRequest.current || recording) return;
    setError("");
    const cleanDescription = sanitize(description);
    const cleanLandmark = sanitize(landmark);
    if (!cleanDescription || !category || !cleanLandmark) {
      setError("Enter a description, select a category, and provide a nearby public landmark.");
      return;
    }

    const request = Symbol();
    reviewRequest.current = request;
    setResolving(true);
    try {
      const draft: ComplaintDraft = {
        description: cleanDescription, category, language, landmark: cleanLandmark, coordinates: null,
      };
      const coordinates = await resolveLocation(draft);
      if (reviewRequest.current !== request) return;
      if (!coordinates || !Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)
        || Math.abs(coordinates.latitude) > 90 || Math.abs(coordinates.longitude) > 180) {
        setError("Location could not be resolved. Check the landmark and try again.");
        return;
      }
      const summary = summarize(cleanDescription, category, language);
      setReview({
        category,
        title: sanitize(summary.title),
        description: sanitize(summary.description),
        language,
        location: { latitude: coordinates.latitude, longitude: coordinates.longitude, landmark: cleanLandmark },
        confirmed: true,
      });
    } catch {
      if (reviewRequest.current === request) setError("Location lookup failed. Please try again.");
    } finally {
      if (reviewRequest.current === request) {
        reviewRequest.current = null;
        setResolving(false);
      }
    }
  }

  function confirm() {
    if (!review || saveGuard.current) return;
    saveGuard.current = true;
    setError("");
    readBack.stop();
    let complaint: Complaint;
    try {
      complaint = storage.create({ ...review, location: { ...review.location } });
    } catch {
      saveGuard.current = false;
      setError("Could not save the report. Your review is still available. Try again.");
      return;
    }
    setSaved(true);
    setReview(null);
    setDescription("");
    setLandmarkOverride(null);
    setCategoryOverride("");
    onSaved?.(complaint);
  }

  if (saved) return <p role="status">Report saved.</p>;

  if (review) return (
    <Card as="section" className="style-panel" aria-labelledby={`${id}-review`}>
      <h2 id={`${id}-review`} tabIndex={-1} ref={reviewHeading}>Review your report</h2>
      <p lang={language}><strong>{review.title}</strong></p>
      <p lang={language}>{review.description}</p>
      <p>Landmark: <span lang={language}>{review.location.landmark}</span></p>
      {description === sampleComplaints[language] && <p>Fictional sample · demo location</p>}
      <p>Coordinates: {review.location.latitude}, {review.location.longitude}</p>
      <div className="utility-row">
        <Button variant="secondary" onClick={() => readBack.speaking
          ? readBack.stop()
          : readBack.speak(`${review.title}. ${review.description}`, locale)}>
          {readBack.speaking ? "Stop read-back" : "Read summary aloud"}
        </Button>
        <Button onClick={confirm}>Yes, save report</Button>
        <Button variant="secondary" onClick={() => {
          readBack.stop();
          setError("");
          returnToEdit.current = true;
          setReview(null);
        }}>No, edit report</Button>
      </div>
      {readBack.error && <p role="status">{readBack.error}</p>}
      {error && <p role="alert">{error}</p>}
    </Card>
  );

  return (
    <Card as="section" className="style-panel" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>Speak or type your report</h2>
      <p id={`${id}-privacy`} className="quiet-note">
        Your browser may send speech to a recognition service. Mohalla Mic never stores audio.
      </p>
      <div className="utility-row">
        {speech.status === "listening"
          ? <Button onClick={speech.stop}>Stop recording</Button>
          : <Button aria-describedby={`${id}-privacy`} disabled={recording || resolving} onClick={speech.start}>Start microphone</Button>}
        {recording && <Button variant="secondary" onClick={speech.cancel}>Cancel recording</Button>}
        <Button variant="secondary" disabled={recording || resolving} onClick={() => {
          setDescription(sampleComplaints[language]);
          setCategoryOverride("");
          setLandmarkOverride(null);
          setError("");
        }}>Use fictional sample</Button>
      </div>
      <p role="status">{statusText[speech.status]}</p>
      {speech.error && <p role="alert">{speech.error}</p>}
      {recording && <p lang={language}>{speech.transcript.final} {speech.transcript.interim}</p>}
      <fieldset disabled={resolving} className="space-y-3">
        <label className="block">
          Description
          <textarea ref={editField} className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-3" rows={4}
            lang={language} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className="block">
          Category
          <select className="block rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-2" value={categoryOverride || ""}
            onChange={(event) => setCategoryOverride(event.target.value as ComplaintCategory | "")}>
            <option value="">{category ? `Suggested: ${category}` : "Choose a category"}</option>
            <option value="garbage">Garbage</option>
            <option value="water">Water</option>
            <option value="streetlight">Streetlight</option>
          </select>
        </label>
        <label className="block">
          Public landmark
          <input className="block w-full rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-2" lang={language}
            value={landmark} onChange={(event) => setLandmarkOverride(event.target.value)} />
        </label>
        <Button disabled={recording || resolving} onClick={prepareReview}>{resolving ? "Resolving location…" : "Review report"}</Button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </Card>
  );
}
