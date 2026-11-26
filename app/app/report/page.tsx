import Link from "next/link";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { LanguageSelector } from "@/components/layout/language-selector";

export default function ReportPage() {
  return <>
    <Link href="/app" className="quiet-note" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48 }}><ArrowLeft size={16} aria-hidden="true" />Back to overview</Link>
    <div className="page-kicker" style={{ marginTop: 24 }}>A neighbourly first step</div>
    <h1 className="page-title">Start with what<br />you noticed.</h1>
    <p className="page-lede">The reporting flow will be added in the next phase. Your audio will not be stored, and a report is only saved after you review and confirm it.</p>
    <Card as="section" className="style-panel" style={{ marginTop: 32, maxWidth: 640 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}><FilePlus2 color="var(--accent)" aria-hidden="true" /><strong>Choose your language</strong></div>
      <LanguageSelector label="Select a language for your report" />
      <p className="quiet-note" style={{ marginTop: 18 }}>Speech recognition and report confirmation are not part of this foundation release.</p>
      <Button disabled style={{ marginTop: 14 }}>Continue in a later phase</Button>
    </Card>
  </>;
}
