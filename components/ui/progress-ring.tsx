interface ProgressRingProps { value: number; max?: number; size?: number; label?: string; }

export function ProgressRing({ value, max = 100, size = 72, label }: ProgressRingProps) {
  const safeMax = max > 0 ? max : 100;
  const percent = Math.max(0, Math.min(100, (value / safeMax) * 100));
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  return <span className="progress-ring" style={{ width: size, height: size }} role="progressbar" aria-label={label ?? "Progress"} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={Math.min(safeMax, Math.max(0, value))}>
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden="true"><circle className="progress-ring-track" cx="30" cy="30" r={radius} /><circle className="progress-ring-value" cx="30" cy="30" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} /></svg>
    <span className="progress-ring-label">{Math.round(percent)}%</span>
  </span>;
}
