import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VoiceReportIntegration } from "@/components/complaints/VoiceReportIntegration";

export default function ReportPage() {
  return <>
    <Link href="/app" className="quiet-note" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48 }}><ArrowLeft size={16} aria-hidden="true" />Back to overview</Link>
    <div className="page-kicker" style={{ marginTop: 24 }}>A neighbourly first step</div>
    <h1 className="page-title">Start with what<br />you noticed.</h1>
    <p className="page-lede">Speak or type a neighbourhood concern, review the factual summary, and confirm before it is saved. Audio is never stored.</p>
    <div style={{ marginTop: 32, maxWidth: 760 }}><VoiceReportIntegration /></div>
  </>;
}
