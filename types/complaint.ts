export type ComplaintCategory = "garbage" | "water" | "streetlight";

export type ComplaintLanguage = "en" | "hi" | "kn";

export type ComplaintStatus = "open" | "awaiting_verification" | "verified_fixed";

export type NeighbourId =
  | "neighbour-1"
  | "neighbour-2"
  | "neighbour-3"
  | "neighbour-4"
  | "neighbour-5";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ComplaintLocation extends Coordinates {
  landmark: string;
  locality?: string;
}

export interface NeighbourVote {
  voterId: NeighbourId;
  value: "yes" | "no";
  castAt: string;
}

export interface VerificationRound {
  id: string;
  startedAt: string;
  completedAt?: string;
  votes: NeighbourVote[];
  result: "pending" | "passed" | "failed";
}

export interface ComplaintDraft {
  category: ComplaintCategory | null;
  description: string;
  language: ComplaintLanguage;
  landmark: string;
  coordinates: Coordinates | null;
}

export interface NewComplaintInput {
  category: ComplaintCategory;
  title: string;
  description: string;
  language: ComplaintLanguage;
  location: ComplaintLocation;
  confirmed: true;
}

export interface ComplaintHistoryEntry {
  id: string;
  complaintId: string;
  type:
    | "created"
    | "merged"
    | "fix_claimed"
    | "vote_cast"
    | "verification_passed"
    | "verification_failed";
  occurredAt: string;
  summary: string;
  details?: Record<string, string | number | boolean | null>;
  /** Present on merge entries to preserve the sanitized incoming report. */
  incomingReport?: SanitizedIncomingReport;
}

export interface SanitizedIncomingReport {
  category: ComplaintCategory;
  title: string;
  description: string;
  language: ComplaintLanguage;
  location: ComplaintLocation;
  reportedAt: string;
}

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  title: string;
  /** Privacy-sanitized description; raw transcripts and audio are never stored. */
  description: string;
  language: ComplaintLanguage;
  location: ComplaintLocation;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  neighbourReportCount: number;
  mergedComplaintIds: string[];
  reopenCount: number;
  verificationRounds: VerificationRound[];
  history: ComplaintHistoryEntry[];
}

export interface WeeklyBriefItem {
  complaintId: string;
  category: ComplaintCategory;
  title: string;
  reportCount: number;
  daysOpen: number;
}

export interface VoteResult {
  complaint: Complaint;
  round: VerificationRound;
  added: boolean;
}

/** Versioned shape for the localStorage complaint collection. */
export interface ComplaintStoreDataV1 {
  version: 1;
  complaints: Complaint[];
  /** Maps merged report IDs to their canonical complaint IDs. */
  canonicalIdByMergedId: Record<string, string>;
}

export interface ComplaintStore {
  /** Returns canonical complaints, excluding archived merged records. */
  list(): Complaint[];

  /** Resolves canonical and merged IDs to the canonical complaint. */
  getById(id: string): Complaint | undefined;

  /** Requires resident confirmation and persists only sanitized report data. */
  create(input: NewComplaintInput): Complaint;

  findDuplicate(input: NewComplaintInput): Complaint | undefined;

  /** Starts a fresh verification round; status becomes awaiting_verification. */
  claimFixed(complaintId: string): Complaint;

  /** Casts at most one immutable vote per simulated neighbour in the round. */
  castVote(
    complaintId: string,
    voterId: NeighbourId,
    value: NeighbourVote["value"],
  ): VoteResult;

  getHistory(complaintId: string): ComplaintHistoryEntry[];

  /** Returns the top five problems with report counts and days open. */
  getWeeklyBrief(): WeeklyBriefItem[];

  resetDemoData(): void;

  subscribe(listener: () => void): () => void;
}

/**
 * Contract invariants for the eventual store implementation:
 * - Generate a unique report ID before duplicate detection.
 * - Merge only active complaints matching category, within 200 metres, and
 *   with overlapping normalized non-empty landmarks.
 * - Preserve sanitized incoming report information in history, increment
 *   neighbourReportCount, and resolve merged IDs to the canonical complaint.
 * - Never transfer votes between complaints.
 * - New complaints start open with reopenCount 0.
 * - A fix claim starts a fresh verification round and sets awaiting_verification.
 * - Evaluate immediately after three distinct votes. A strict Yes majority
 *   passes and sets verified_fixed; otherwise fail, return to open, and
 *   increment reopenCount exactly once.
 * - Completed rounds are permanently locked. Status is not directly mutable.
 * - Persist only to versioned localStorage and initialize deterministic seed
 *   data when stored data is missing or invalid. The seed has 18 fictional
 *   Demo Street, Bengaluru complaints, four mergeable pairs, and two reopen
 *   histories.
 * - Person 1 owns frontend, layouts, and reusable UI. Person 2 owns speech
 *   recognition, read-back, typed fallback, category and landmark extraction,
 *   and privacy sanitization. Person 3 owns shared types, persistence, maps,
 *   merging, voting, history, and seed data; Person 3 exclusively owns this
 *   module and other members import its definitions.
 * - Browser speech recognition is not guaranteed to operate entirely on-device;
 *   disclose this limitation and provide typed fallback.
 */
