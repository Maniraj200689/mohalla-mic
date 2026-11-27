"use client";

import { useCallback, useState } from "react";
import type { Complaint, ComplaintDraft, Coordinates } from "../../types/complaint";
import { complaintStore } from "../../lib/storage";
import { VoiceReport, type VoiceReportProps } from "../voice/VoiceReport";
import { LanguageSelector } from "../layout/language-selector";
import { usePreferences } from "../layout/preferences-provider";
import { Button, Card } from "../ui";

interface FictionalLocation {
  id: string;
  label: string;
  coordinates: Coordinates;
}

const fictionalLocations: FictionalLocation[] = [
  {
    id: "demo-bus-stop",
    label: "Fictional demo location — Demo Street Bus Stop, Bengaluru",
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
  },
  {
    id: "demo-banyan-corner",
    label: "Fictional demo location — Banyan Corner, Bengaluru",
    coordinates: { latitude: 12.97205, longitude: 77.595 },
  },
  {
    id: "demo-bakery-junction",
    label: "Fictional demo location — Rose Bakery Junction, Bengaluru",
    coordinates: { latitude: 12.9725, longitude: 77.59425 },
  },
];

export function VoiceReportIntegration() {
  const { language, ready } = usePreferences();
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [reportStarted, setReportStarted] = useState(false);
  const [savedComplaintId, setSavedComplaintId] = useState<string | null>(null);
  const selectedLocation = fictionalLocations.find((location) => location.id === selectedLocationId) ?? null;

  const resolveLocation: VoiceReportProps["resolveLocation"] = useCallback((draft: Readonly<ComplaintDraft>) => {
    if (!selectedLocation || !draft.landmark.trim()) return null;
    return { ...selectedLocation.coordinates };
  }, [selectedLocation]);

  const onSaved: NonNullable<VoiceReportProps["onSaved"]> = useCallback((complaint: Complaint) => {
    setSavedComplaintId(complaint.id);
  }, []);

  const storage: VoiceReportProps["storage"] = complaintStore;

  return <div className="space-y-5">
    <Card as="section" className="style-panel" aria-labelledby="report-language-heading">
      <h2 id="report-language-heading" className="m-0 mb-4 text-lg font-semibold">Choose your report language</h2>
      <LanguageSelector label="Select a language for your report" />
    </Card>

    <Card as="section" className="style-panel" aria-labelledby="report-location-heading">
      <h2 id="report-location-heading" className="m-0 mb-2 text-lg font-semibold">Choose a report location</h2>
      <p id="report-location-help" className="quiet-note mb-4">These locations are fictional demo places with fictional coordinates. Mohalla Mic does not read or assign your device location.</p>
      {!reportStarted ? <>
        <label htmlFor="fictional-report-location" className="mb-2 block text-sm font-semibold">Fictional demo location</label>
        <select
          id="fictional-report-location"
          aria-describedby="report-location-help"
          className="min-h-12 w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 text-[var(--text-primary)]"
          value={selectedLocationId}
          disabled={!ready}
          onChange={(event) => setSelectedLocationId(event.target.value)}
        >
          <option value="">Select a fictional demo location</option>
          {fictionalLocations.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
        </select>
        <div className="mt-4">
          <Button disabled={!ready || !selectedLocation} onClick={() => setReportStarted(true)}>Continue with selected location</Button>
        </div>
      </> : <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-sm font-semibold text-[var(--text-secondary)]">Selected: {selectedLocation?.label}</p>
        {!savedComplaintId && <Button variant="secondary" onClick={() => {
          setReportStarted(false);
          setSelectedLocationId("");
        }}>Change location and discard draft</Button>}
      </div>}
    </Card>

    {reportStarted && selectedLocation && ready && <VoiceReport
      language={language}
      resolveLocation={resolveLocation}
      storage={storage}
      onSaved={onSaved}
    />}
    {savedComplaintId && <p role="status" className="quiet-note">Confirmed report {savedComplaintId} was saved in this browser.</p>}
  </div>;
}
