import { describe, expect, it } from "vitest";
import type { ComplaintStorageAdapter } from "./storage";
import {
  ComplaintStorageError,
  InvalidComplaintInputError,
  UnsupportedStoreOperationError,
  createComplaintStore,
} from "./storage";
import type { NewComplaintInput } from "@/types/complaint";

class MemoryStorage implements ComplaintStorageAdapter {
  value: string | null = null;
  failRead = false;
  failWrite = false;

  getItem() {
    if (this.failRead) throw new Error("read blocked");
    return this.value;
  }

  setItem(_key: string, value: string) {
    if (this.failWrite) throw new Error("quota exceeded");
    this.value = value;
  }
}

const confirmedInput: NewComplaintInput = {
  category: "streetlight",
  title: "Lamp out near the park",
  description: "The streetlight near the park is not working.",
  language: "en",
  location: {
    latitude: 12.9716,
    longitude: 77.5946,
    landmark: "Demo location: Park entrance",
    locality: "Fictional demo area",
  },
  confirmed: true,
};

describe("complaint storage", () => {
  it("seeds a deterministic fictional demo collection and reloads created reports", () => {
    const storage = new MemoryStorage();
    const firstStore = createComplaintStore(storage);
    const demo = firstStore.list();

    expect(demo).toHaveLength(18);
    expect(demo.every((complaint) => complaint.location.landmark.startsWith("Demo location:"))).toBe(true);

    const saved = firstStore.create(confirmedInput);
    const reloaded = createComplaintStore(storage);

    expect(reloaded.getById(saved.id)).toEqual(saved);
    expect(reloaded.list()).toHaveLength(19);
    expect(storage.value).not.toContain('"audio"');
    expect(storage.value).not.toContain('"rawTranscript"');
  });

  it("replaces invalid stored data with the deterministic seed", () => {
    const storage = new MemoryStorage();
    storage.value = "{not-json";

    const store = createComplaintStore(storage);

    expect(store.list()).toHaveLength(18);
    expect(JSON.parse(storage.value ?? "null")).toMatchObject({ version: 1 });
  });

  it("requires explicit confirmation, valid fields, sanitized text, and resolved coordinates", () => {
    const store = createComplaintStore(new MemoryStorage());

    expect(() => store.create({ ...confirmedInput, confirmed: false } as unknown as NewComplaintInput))
      .toThrow(InvalidComplaintInputError);
    expect(() => store.create({ ...confirmedInput, category: "other" } as unknown as NewComplaintInput))
      .toThrow(InvalidComplaintInputError);
    expect(() => store.create({ ...confirmedInput, description: "Call me at 12345678." }))
      .toThrow(InvalidComplaintInputError);
    expect(() => store.create({ ...confirmedInput, description: "Dr Example reported a leak." }))
      .toThrow(InvalidComplaintInputError);
    expect(() => store.create({
      ...confirmedInput,
      rawTranscript: "Unredacted words",
      audio: "fictional-audio-payload",
    } as NewComplaintInput))
      .toThrow(InvalidComplaintInputError);
    expect(() => store.create({ ...confirmedInput, location: { ...confirmedInput.location, latitude: 91 } }))
      .toThrow(InvalidComplaintInputError);
  });

  it("does not claim success or notify listeners when storage fails", () => {
    const storage = new MemoryStorage();
    const store = createComplaintStore(storage);
    store.list();
    let notifications = 0;
    store.subscribe(() => notifications += 1);
    storage.failWrite = true;

    expect(() => store.create(confirmedInput)).toThrow(ComplaintStorageError);
    expect(notifications).toBe(0);
  });

  it("does not report a failed save when a subscriber throws after persistence", () => {
    const storage = new MemoryStorage();
    const store = createComplaintStore(storage);
    store.subscribe(() => { throw new Error("subscriber failed"); });

    expect(() => store.create(confirmedInput)).not.toThrow();
    expect(JSON.parse(storage.value ?? "null").complaints).toHaveLength(19);
  });

  it("reports storage read failures instead of silently starting a new collection", () => {
    const storage = new MemoryStorage();
    storage.failRead = true;

    expect(() => createComplaintStore(storage).list()).toThrow(ComplaintStorageError);
  });

  it("keeps voting and verification operations unavailable in this phase", () => {
    const store = createComplaintStore(new MemoryStorage());

    expect(() => store.findDuplicate(confirmedInput)).toThrow(UnsupportedStoreOperationError);
    expect(() => store.claimFixed("demo-01")).toThrow(UnsupportedStoreOperationError);
    expect(() => store.castVote("demo-01", "neighbour-1", "yes")).toThrow(UnsupportedStoreOperationError);
  });
});
