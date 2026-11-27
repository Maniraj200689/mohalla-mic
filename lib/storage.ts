import type {
  Complaint,
  ComplaintCategory,
  ComplaintHistoryEntry,
  ComplaintLanguage,
  ComplaintLocation,
  ComplaintStatus,
  ComplaintStore,
  ComplaintStoreDataV1,
  NewComplaintInput,
  NeighbourId,
  VerificationRound,
  WeeklyBriefItem,
  VoteResult,
} from "@/types/complaint";

const STORAGE_KEY = "mohalla-mic:complaints:v1";
const CATEGORIES = new Set<ComplaintCategory>(["garbage", "water", "streetlight"]);
const LANGUAGES = new Set<ComplaintLanguage>(["en", "hi", "kn"]);
const STATUSES = new Set<ComplaintStatus>(["open", "awaiting_verification", "verified_fixed"]);
const NEIGHBOURS = new Set<NeighbourId>([
  "neighbour-1",
  "neighbour-2",
  "neighbour-3",
  "neighbour-4",
  "neighbour-5",
]);

export interface ComplaintStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class ComplaintStorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ComplaintStorageError";
  }
}

export class InvalidComplaintInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidComplaintInputError";
  }
}

export class UnsupportedStoreOperationError extends Error {
  constructor(operation: string) {
    super(`${operation} is not available in this phase.`);
    this.name = "UnsupportedStoreOperationError";
  }
}

function browserStorage(): ComplaintStorageAdapter {
  if (typeof window === "undefined") {
    throw new ComplaintStorageError("Complaint storage is available in the browser only.");
  }

  try {
    return window.localStorage;
  } catch (error) {
    throw new ComplaintStorageError("Browser storage is unavailable.", { cause: error });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isLocation(value: unknown): value is ComplaintLocation {
  return isRecord(value)
    && isFiniteNumber(value.latitude)
    && value.latitude >= -90
    && value.latitude <= 90
    && isFiniteNumber(value.longitude)
    && value.longitude >= -180
    && value.longitude <= 180
    && isString(value.landmark)
    && value.landmark.trim().length > 0
    && (value.locality === undefined || isString(value.locality));
}

function isVerificationRound(value: unknown): value is VerificationRound {
  if (!isRecord(value) || !isString(value.id) || !isString(value.startedAt)) return false;
  if (value.completedAt !== undefined && !isString(value.completedAt)) return false;
  if (!Array.isArray(value.votes) || !["pending", "passed", "failed"].includes(String(value.result))) return false;
  return value.votes.every((vote) => isRecord(vote)
    && NEIGHBOURS.has(vote.voterId as NeighbourId)
    && (vote.value === "yes" || vote.value === "no")
    && isString(vote.castAt));
}

function isHistoryEntry(value: unknown): value is ComplaintHistoryEntry {
  return isRecord(value)
    && isString(value.id)
    && isString(value.complaintId)
    && isString(value.type)
    && isString(value.occurredAt)
    && isString(value.summary);
}

function isComplaint(value: unknown): value is Complaint {
  if (!isRecord(value)) return false;
  return isString(value.id)
    && CATEGORIES.has(value.category as ComplaintCategory)
    && isString(value.title)
    && isString(value.description)
    && LANGUAGES.has(value.language as ComplaintLanguage)
    && isLocation(value.location)
    && STATUSES.has(value.status as ComplaintStatus)
    && isString(value.createdAt)
    && isString(value.updatedAt)
    && Number.isInteger(value.neighbourReportCount)
    && Number(value.neighbourReportCount) >= 1
    && Array.isArray(value.mergedComplaintIds)
    && value.mergedComplaintIds.every(isString)
    && Number.isInteger(value.reopenCount)
    && Number(value.reopenCount) >= 0
    && Array.isArray(value.verificationRounds)
    && value.verificationRounds.every(isVerificationRound)
    && Array.isArray(value.history)
    && value.history.every(isHistoryEntry);
}

function isStoreData(value: unknown): value is ComplaintStoreDataV1 {
  return isRecord(value)
    && value.version === 1
    && Array.isArray(value.complaints)
    && value.complaints.every(isComplaint)
    && isRecord(value.canonicalIdByMergedId)
    && Object.entries(value.canonicalIdByMergedId).every(([mergedId, canonicalId]) =>
      mergedId.length > 0 && isString(canonicalId));
}

const DEMO_REOPENED_IDS = new Set(["demo-17", "demo-18"]);
const DEMO_ROWS: Array<[
  ComplaintCategory,
  string,
  string,
  number,
  number,
]> = [
  ["garbage", "Overflowing bins beside the stop", "Demo Street Bus Stop", 12.971600, 77.594600],
  ["garbage", "Litter beside the bins", "Demo Street Bus Stop", 12.971690, 77.594680],
  ["water", "Pipe leaking at the corner", "Banyan Corner", 12.972050, 77.595000],
  ["water", "Water pooling from a leak", "Banyan Corner", 12.972140, 77.595080],
  ["streetlight", "Lamp is out near the bakery", "Rose Bakery Junction", 12.972500, 77.594250],
  ["streetlight", "Dark stretch by the lamp", "Rose Bakery Junction", 12.972590, 77.594330],
  ["garbage", "Missed collection at the curb", "Community Hall Gate", 12.970900, 77.595100],
  ["garbage", "Waste left after collection", "Community Hall Gate", 12.970990, 77.595180],
  ["water", "Drain overflows after rain", "Mango Tree Lane", 12.973100, 77.593900],
  ["streetlight", "Light flickers near the crossing", "Blue Gate Crossing", 12.973400, 77.595400],
  ["garbage", "Public bin lid is broken", "Flower Stall Corner", 12.970700, 77.593800],
  ["water", "Tap leaks beside the walkway", "Demo Park Entrance", 12.971200, 77.596000],
  ["streetlight", "Lane entrance is unlit", "Paper Shop Bend", 12.974000, 77.594700],
  ["garbage", "Packaging scattered by the wall", "Painted Wall Turn", 12.970200, 77.594300],
  ["water", "Standing water near the steps", "Community Garden Steps", 12.972900, 77.596100],
  ["streetlight", "Dark patch near the speed bump", "Yellow House Bend", 12.969900, 77.595700],
  ["garbage", "Collection point remains untidy", "Demo Street East End", 12.973700, 77.592900],
  ["water", "Recurring leak beside the footpath", "Demo Street West End", 12.969800, 77.593500],
];

function makeDemoSeed(): ComplaintStoreDataV1 {
  const complaints = DEMO_ROWS.map(([category, title, landmark, latitude, longitude], index): Complaint => {
    const id = `demo-${String(index + 1).padStart(2, "0")}`;
    const createdAt = `2025-01-${String(index + 1).padStart(2, "0")}T08:00:00.000Z`;
    const reopened = DEMO_REOPENED_IDS.has(id);
    const fixStartedAt = `2025-02-${String(index + 1).padStart(2, "0")}T08:00:00.000Z`;
    const completedAt = `2025-02-${String(index + 1).padStart(2, "0")}T09:00:00.000Z`;
    const history: ComplaintHistoryEntry[] = [{
      id: `${id}-created`,
      complaintId: id,
      type: "created",
      occurredAt: createdAt,
      summary: "Fictional demo complaint created.",
    }];
    const verificationRounds: VerificationRound[] = [];

    if (reopened) {
      verificationRounds.push({
        id: `${id}-round-1`,
        startedAt: fixStartedAt,
        completedAt,
        result: "failed",
        votes: [
          { voterId: "neighbour-1", value: "yes", castAt: fixStartedAt },
          { voterId: "neighbour-2", value: "no", castAt: fixStartedAt },
          { voterId: "neighbour-3", value: "no", castAt: completedAt },
        ],
      });
      history.push({
        id: `${id}-verification-failed`,
        complaintId: id,
        type: "verification_failed",
        occurredAt: completedAt,
        summary: "Fictional demo verification failed; complaint reopened.",
      });
    }

    return {
      id,
      category,
      title,
      description: `${title}. Fictional demo report for testing only.`,
      language: "en",
      location: {
        latitude,
        longitude,
        landmark: `Demo location: ${landmark}`,
        locality: "Fictional Demo Street, Bengaluru — not a real user location",
      },
      status: "open",
      createdAt,
      updatedAt: reopened ? completedAt : createdAt,
      neighbourReportCount: 1,
      mergedComplaintIds: [],
      reopenCount: reopened ? 1 : 0,
      verificationRounds,
      history,
    };
  });

  return { version: 1, complaints, canonicalIdByMergedId: {} };
}

function hasUnsanitizedText(value: string): boolean {
  const containsLongDigitSequence = /\p{N}{4,}/u.test(value);
  const containsHonorificName = /(?:^|[^\p{L}])(?:mr|mrs|ms|miss|dr|prof|shri|smt|श्री|श्रीमती|सुश्री|डॉ|ಶ್ರೀ|ಶ್ರೀಮತಿ|ಡಾ)\.?\s+[\p{Lu}][\p{L}'’-]+/iu.test(value);
  return containsLongDigitSequence || containsHonorificName;
}

function validateInput(input: NewComplaintInput): void {
  if (!isRecord(input) || input.confirmed !== true) {
    throw new InvalidComplaintInputError("A report must be explicitly confirmed before saving.");
  }
  const allowedKeys = new Set(["category", "title", "description", "language", "location", "confirmed"]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
    throw new InvalidComplaintInputError("Only confirmed complaint fields can be saved.");
  }
  if (!CATEGORIES.has(input.category) || !LANGUAGES.has(input.language)) {
    throw new InvalidComplaintInputError("The report category or language is invalid.");
  }
  if (!isString(input.title) || input.title.trim().length === 0
    || !isString(input.description) || input.description.trim().length === 0) {
    throw new InvalidComplaintInputError("A report title and description are required.");
  }
  if (!isLocation(input.location)) {
    throw new InvalidComplaintInputError("A valid, resolved location is required.");
  }
  const textFields = [input.title, input.description, input.location.landmark, input.location.locality ?? ""];
  if (textFields.some(hasUnsanitizedText)) {
    throw new InvalidComplaintInputError("The report contains personal details that must be sanitized before saving.");
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `complaint-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createComplaintStore(adapter?: ComplaintStorageAdapter): ComplaintStore {
  const listeners = new Set<() => void>();
  let listeningToStorage = false;

  const getAdapter = () => adapter ?? browserStorage();

  const notify = () => {
    listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Subscriber failures must not turn a successful storage write into a reported save failure.
      }
    });
  };

  const write = (data: ComplaintStoreDataV1) => {
    try {
      getAdapter().setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      if (error instanceof ComplaintStorageError) throw error;
      throw new ComplaintStorageError("The complaint could not be saved to browser storage.", { cause: error });
    }
    notify();
  };

  const read = (): ComplaintStoreDataV1 => {
    let raw: string | null;
    try {
      raw = getAdapter().getItem(STORAGE_KEY);
    } catch (error) {
      if (error instanceof ComplaintStorageError) throw error;
      throw new ComplaintStorageError("Complaint storage could not be read.", { cause: error });
    }

    if (raw !== null) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (isStoreData(parsed)) return parsed;
      } catch {
        // Invalid JSON is replaced with the deterministic demo collection below.
      }
    }

    const seed = makeDemoSeed();
    write(seed);
    return seed;
  };

  const resolveId = (data: ComplaintStoreDataV1, id: string): string =>
    data.canonicalIdByMergedId[id] ?? id;

  const unsupported = (operation: string): never => {
    throw new UnsupportedStoreOperationError(operation);
  };

  const store: ComplaintStore = {
    list() {
      const data = read();
      const mergedIds = new Set(Object.keys(data.canonicalIdByMergedId));
      return data.complaints.filter((complaint) => !mergedIds.has(complaint.id));
    },

    getById(id) {
      const data = read();
      const canonicalId = resolveId(data, id);
      return data.complaints.find((complaint) => complaint.id === canonicalId);
    },

    create(input) {
      validateInput(input);
      const id = createId();
      const now = new Date().toISOString();
      const complaint: Complaint = {
        id,
        category: input.category,
        title: input.title.trim(),
        description: input.description.trim(),
        language: input.language,
        location: {
          latitude: input.location.latitude,
          longitude: input.location.longitude,
          landmark: input.location.landmark.trim(),
          ...(input.location.locality?.trim() ? { locality: input.location.locality.trim() } : {}),
        },
        status: "open",
        createdAt: now,
        updatedAt: now,
        neighbourReportCount: 1,
        mergedComplaintIds: [],
        reopenCount: 0,
        verificationRounds: [],
        history: [{
          id: `${id}-created`,
          complaintId: id,
          type: "created",
          occurredAt: now,
          summary: "Confirmed complaint created.",
        }],
      };
      const data = read();
      write({ ...data, complaints: [...data.complaints, complaint] });
      return complaint;
    },

    findDuplicate() {
      return unsupported("Duplicate detection");
    },

    claimFixed() {
      return unsupported("Claiming a fix");
    },

    castVote(): VoteResult {
      return unsupported("Voting");
    },

    getHistory(id) {
      const data = read();
      const canonicalId = resolveId(data, id);
      return data.complaints.find((complaint) => complaint.id === canonicalId)?.history ?? [];
    },

    getWeeklyBrief(): WeeklyBriefItem[] {
      return unsupported("Weekly brief generation");
    },

    resetDemoData() {
      write(makeDemoSeed());
    },

    subscribe(listener) {
      listeners.add(listener);
      if (!listeningToStorage && typeof window !== "undefined" && !adapter) {
        window.addEventListener("storage", handleStorageEvent);
        listeningToStorage = true;
      }
      return () => {
        listeners.delete(listener);
        if (listeningToStorage && listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", handleStorageEvent);
          listeningToStorage = false;
        }
      };
    },
  };

  function handleStorageEvent(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) notify();
  }

  return store;
}

export const complaintStore = createComplaintStore();
