import type { ComplaintStatus } from "@/types/complaint";

const labels: Record<ComplaintStatus, string> = {
  open: "Open",
  awaiting_verification: "Awaiting verification",
  verified_fixed: "Verified fixed",
};

const classes: Record<ComplaintStatus, string> = {
  open: "status-open",
  awaiting_verification: "status-awaiting",
  verified_fixed: "status-fixed",
};

export function StatusBadge({ status, label }: { status: ComplaintStatus; label?: string }) {
  return <span className={`status-badge ${classes[status]}`}><span className="status-dot" aria-hidden="true" />{label ?? labels[status]}</span>;
}
