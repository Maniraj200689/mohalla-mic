import { AudioLines } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui";

export default function BriefPage() {
  return <AppShell>
    <div className="page-kicker">Community brief</div>
    <h1 className="page-title">A clearer picture,<br />together.</h1>
    <p className="page-lede">A weekly summary of neighbourhood concerns will appear here once the shared complaint data is connected.</p>
    <Card as="section" className="style-panel" style={{ marginTop: 36, maxWidth: 720 }}>
      <AudioLines color="var(--accent)" size={24} aria-hidden="true" />
      <h2 className="section-heading" style={{ marginTop: 16 }}>Community voice, with care</h2>
      <p className="quiet-note">This screen is a presentation shell only. It does not load, create, merge, or vote on complaint data.</p>
    </Card>
  </AppShell>;
}
