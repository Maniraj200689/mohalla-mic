// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VoiceReport } from "./VoiceReport";
import type { Complaint, NewComplaintInput } from "../../types/complaint";

const coordinates = { latitude: 12.97, longitude: 77.59 };

function setup(location: typeof coordinates | null = coordinates) {
  const resolveLocation = vi.fn(async () => location);
  const create = vi.fn((input: NewComplaintInput): Complaint => {
    localStorage.setItem("test:complaint", JSON.stringify(input));
    return {
      ...input, id: "demo", status: "open", createdAt: "", updatedAt: "", neighbourReportCount: 1,
      mergedComplaintIds: [], reopenCount: 0, verificationRounds: [], history: [],
    };
  });
  const onSaved = vi.fn();
  render(<VoiceReport language="en" resolveLocation={resolveLocation} storage={{ create }} onSaved={onSaved} />);
  return { resolveLocation, create, onSaved };
}

function click(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("VoiceReport", () => {
  it("redacts before review and saves once after Yes, even after a failed attempt", async () => {
    const { create, onSaved, resolveLocation } = setup();
    create.mockImplementationOnce(() => { throw new Error("write failed"); });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Water is leaking near the park, Mr. Ravi Kumar, 12345" },
    });
    fireEvent.change(screen.getByLabelText("Public landmark"), { target: { value: "Park 12345" } });
    click("Review report");
    const yes = await screen.findByRole("button", { name: "Yes, save report" });
    expect(create).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(JSON.stringify(resolveLocation.mock.calls)).not.toMatch(/12345|Ravi/);
    expect(screen.getByText("Water is leaking near the park, [redacted], [redacted]")).toBeTruthy();
    fireEvent.click(yes);
    expect(screen.getByRole("alert").textContent).toMatch(/Could not save/);
    expect(onSaved).not.toHaveBeenCalled();
    act(() => {
      fireEvent.click(yes);
      fireEvent.click(yes);
    });
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1][0]).toMatchObject({
      category: "water", language: "en", confirmed: true, location: { ...coordinates, landmark: "Park [redacted]" },
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Report saved.")).toBeTruthy();
    expect(localStorage.getItem("test:complaint")).not.toMatch(/12345|Ravi|audio|transcript/i);
    expect(JSON.parse(localStorage.getItem("test:complaint")!)).toEqual(create.mock.calls[1][0]);
  });

  it("keeps No and missing voices on the review/edit path without saving", async () => {
    const { create } = setup();
    vi.stubGlobal("speechSynthesis", { getVoices: () => [] });
    vi.stubGlobal("SpeechSynthesisUtterance", class {});
    click("Use fictional sample");
    click("Review report");
    await screen.findByRole("button", { name: "Yes, save report" });
    click("Read summary aloud");
    expect(screen.getByText(/No voice is available/)).toBeTruthy();
    click("No, edit report");
    expect((screen.getByLabelText("Description") as HTMLTextAreaElement).value).toMatch(/Garbage/);
    expect(create).not.toHaveBeenCalled();
  });

  it("blocks saving when location cannot be resolved", async () => {
    const { create } = setup(null);
    click("Use fictional sample");
    click("Review report");
    expect((await screen.findByRole("alert")).textContent).toMatch(/Location could not be resolved/);
    expect(screen.queryByRole("button", { name: "Yes, save report" })).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it("keeps typed fallback available without a browser recognizer", () => {
    setup();
    click("Start microphone");
    expect(screen.getByRole("alert").textContent).toMatch(/unavailable/);
    expect((screen.getByLabelText("Description") as HTMLTextAreaElement).disabled).toBe(false);
  });

  it("streams interim text, appends only final text, and ignores callbacks after cancellation", () => {
    const { create } = setup();
    const sessions: MockRecognition[] = [];
    class MockRecognition {
      lang = "";
      interimResults = false;
      onstart?: () => void;
      onend?: () => void;
      onresult?: (event: { results: { isFinal: boolean; 0: { transcript: string } }[] }) => void;
      onerror?: (event: { error: string }) => void;
      abort = vi.fn();
      constructor() { sessions.push(this); }
      start() { this.onstart?.(); }
      stop() { this.onend?.(); }
      result(transcript: string, isFinal: boolean) {
        this.onresult?.({ results: [{ isFinal, 0: { transcript } }] });
      }
    }
    vi.stubGlobal("webkitSpeechRecognition", MockRecognition);
    const description = screen.getByLabelText("Description") as HTMLTextAreaElement;
    fireEvent.change(description, { target: { value: "Existing notes." } });
    click("Start microphone");
    expect(sessions[0]).toMatchObject({ lang: "en-IN", interimResults: true });
    act(() => sessions[0].result("Water near", false));
    expect(screen.getByText("Water near")).toBeTruthy();
    expect(description.value).toBe("Existing notes.");
    act(() => sessions[0].result("Water near the park.", true));
    click("Stop recording");
    expect(description.value).toBe("Existing notes. Water near the park.");
    click("Start microphone");
    click("Cancel recording");
    expect(sessions[1].abort).toHaveBeenCalledOnce();
    act(() => {
      sessions[1].result("Discard this", true);
      sessions[1].onend?.();
    });
    expect(description.value).not.toContain("Discard this");
    click("Start microphone");
    act(() => sessions[2].onerror?.({ error: "not-allowed" }));
    expect(screen.getByRole("alert").textContent).toMatch(/permission was denied/);
    expect(description.disabled).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("reads back the reviewed wording using a matching language voice", async () => {
    setup();
    const voice = { lang: "en-IN" };
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { getVoices: () => [voice], speak, cancel: vi.fn() });
    vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
    click("Use fictional sample");
    click("Review report");
    await screen.findByRole("button", { name: "Yes, save report" });
    click("Read summary aloud");
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({
      voice, lang: "en-IN", text: "Garbage report. Garbage has piled up near the bus stop.",
    }));
  });
});
