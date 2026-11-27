// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PreferencesProvider } from "../layout/preferences-provider";
import { VoiceReportIntegration } from "./VoiceReportIntegration";
import { createComplaintStore } from "../../lib/storage";
import { sampleComplaints } from "../../lib/sampleComplaints";

const COMPLAINTS_KEY = "mohalla-mic:complaints:v1";

function setup() {
  return render(<PreferencesProvider><VoiceReportIntegration /></PreferencesProvider>);
}

async function startWithDemoLocation(id = "demo-bus-stop") {
  await screen.findByRole("button", { name: "English" });
  await waitFor(() => expect((screen.getByRole("button", { name: "English" }) as HTMLButtonElement).disabled).toBe(false));
  fireEvent.change(screen.getByLabelText("Fictional demo location"), { target: { value: id } });
  await waitFor(() => expect((screen.getByRole("button", { name: "Continue with selected location" }) as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(screen.getByRole("button", { name: "Continue with selected location" }));
  await screen.findByRole("heading", { name: "Speak or type your report" });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("report page integration", () => {
  it("requires an explicit fictional location and does not silently start a report", async () => {
    setup();

    const continueButton = await screen.findByRole("button", { name: "Continue with selected location" });
    expect(continueButton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/does not read or assign your device location/)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Speak or type your report" })).toBeNull();
    expect(localStorage.getItem(COMPLAINTS_KEY)).toBeNull();
  });

  it("uses the saved language preference for the voice report and its fictional sample", async () => {
    setup();
    await screen.findByRole("button", { name: "English" });
    await waitFor(() => expect((screen.getByRole("button", { name: "Hindi" }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole("button", { name: "Hindi" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Hindi" }).getAttribute("aria-pressed")).toBe("true"));
    await startWithDemoLocation("demo-banyan-corner");

    const description = screen.getByLabelText("Description") as HTMLTextAreaElement;
    expect(description.lang).toBe("hi");
    fireEvent.click(screen.getByRole("button", { name: "Use fictional sample" }));
    expect(description.value).toBe(sampleComplaints.hi);
    expect(description.lang).toBe("hi");
  });

  it("keeps typed fallback available, requires Yes to save, and persists a confirmed complaint after refresh", async () => {
    setup();
    await startWithDemoLocation();

    fireEvent.click(screen.getByRole("button", { name: "Start microphone" }));
    expect(screen.getByRole("alert").textContent).toMatch(/unavailable.*type/i);
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Garbage has piled up near the bus stop." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Review report" }));
    await screen.findByRole("heading", { name: "Review your report" });

    expect(localStorage.getItem(COMPLAINTS_KEY)).toBeNull();
    expect(screen.getByText(/Selected: Fictional demo location — Demo Street Bus Stop/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "No, edit report" }));
    expect((screen.getByLabelText("Description") as HTMLTextAreaElement).value).toBe("Garbage has piled up near the bus stop.");
    expect(localStorage.getItem(COMPLAINTS_KEY)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Review report" }));
    await screen.findByRole("heading", { name: "Review your report" });
    fireEvent.click(screen.getByRole("button", { name: "Yes, save report" }));
    const savedMessage = await screen.findByText(/was saved in this browser/);
    const savedId = savedMessage.textContent?.match(/report ([\w-]+)/)?.[1];
    expect(savedId).toBeTruthy();
    expect(screen.getByText("Report saved.")).toBeTruthy();

    const stored = JSON.parse(localStorage.getItem(COMPLAINTS_KEY) ?? "null");
    const saved = stored.complaints.find((complaint: { id: string }) => complaint.id === savedId);
    expect(saved).toMatchObject({
      language: "en",
      category: "garbage",
      location: { latitude: 12.9716, longitude: 77.5946 },
    });
    expect(JSON.stringify(saved)).not.toMatch(/audio|rawTranscript/i);

    cleanup();
    const reloadedStore = createComplaintStore();
    expect(reloadedStore.getById(savedId!)).toEqual(saved);
  });
});
