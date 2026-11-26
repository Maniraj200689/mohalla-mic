import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { LanguageSelector } from "@/components/layout/language-selector";

export default function DashboardPage() {
  return <>
    <div className="page-kicker">Your neighbourhood, heard</div>
    <h1 className="page-title">Small signals.<br />Stronger streets.</h1>
    <p className="page-lede">A calm, community-led way to bring local issues into focus and follow them through together.</p>
    <Card as="section" className="hero-card" aria-labelledby="report-invite-title">
      <div>
        <span className="page-kicker">One clear next step</span>
        <h2 id="report-invite-title">Notice something that needs care?</h2>
        <p>Share what you see in your own words. Your neighbours can help build a clearer picture.</p>
        <Link href="/app/report" className="ui-button ui-button-primary"><span>Start a report</span><ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
      <div className="quiet-note" style={{ display: "flex", alignItems: "center", gap: 8 }}><ShieldCheck size={17} aria-hidden="true" />You review before anything is saved</div>
    </Card>
    <h2 className="section-heading">Your language</h2>
    <p className="quiet-note" style={{ marginTop: -10, marginBottom: 16 }}>Choose the language that feels most natural.</p>
    <LanguageSelector />
    <div className="style-grid" style={{ marginTop: 38 }}>
      <Card as="section" className="style-panel"><StatusBadge status="open" /><h3 style={{ marginTop: 16 }}>Neighbourhood reports</h3><p className="quiet-note">A shared view of what residents are noticing.</p></Card>
      <Card as="section" className="style-panel"><StatusBadge status="awaiting_verification" /><h3 style={{ marginTop: 16 }}>Follow through together</h3><p className="quiet-note">Check in when a reported issue is ready for a community update.</p></Card>
    </div>
  </>;
}
