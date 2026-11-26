"use client";

import { useState } from "react";
import { ArrowRight, Check, Plus, Sparkles } from "lucide-react";
import { LanguageSelector } from "@/components/layout/language-selector";
import { PreferenceControls } from "@/components/layout/preference-controls";
import { usePreferences } from "@/components/layout/preferences-provider";
import { BottomSheet, Button, Card, Chip, MicOrb, ProgressRing, StatusBadge } from "@/components/ui";
import type { ComplaintCategory, ComplaintStatus } from "@/types/complaint";

const categories: { id: ComplaintCategory; label: string }[] = [
  { id: "garbage", label: "Waste collection" },
  { id: "water", label: "Water" },
  { id: "streetlight", label: "Streetlights" },
];
const statuses: ComplaintStatus[] = ["open", "awaiting_verification", "verified_fixed"];

export default function StyleguidePage() {
  const [category, setCategory] = useState<ComplaintCategory>("garbage");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { theme, largeText } = usePreferences();
  return <main className="app-main" style={{ paddingTop: 32 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
      <div className="brand"><span className="brand-mark"><Sparkles size={18} aria-hidden="true" /></span><span>Mohalla Mic · Styleguide</span></div>
      <PreferenceControls />
    </div>
    <div className="page-kicker" style={{ marginTop: 48 }}>Foundation · component reference</div>
    <h1 className="page-title">A quieter kind<br />of civic tech.</h1>
    <p className="page-lede">Core components and preference states. Current appearance: {theme} theme; large text {largeText ? "on" : "off"}.</p>

    <section className="style-section" aria-labelledby="buttons-heading">
      <h2 id="buttons-heading">Buttons</h2>
      <Card className="style-panel"><div className="utility-row">
        <Button><Check size={17} aria-hidden="true" />Primary action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Quiet action</Button>
        <Button variant="danger">Destructive</Button>
        <Button disabled>Disabled</Button>
        <Button variant="secondary" iconOnly aria-label="Add item"><Plus size={19} aria-hidden="true" /></Button>
      </div><p className="quiet-note" style={{ marginBottom: 0 }}>All buttons have a minimum 48px target and visible keyboard focus.</p></Card>
    </section>

    <section className="style-section" aria-labelledby="cards-heading">
      <h2 id="cards-heading">Cards</h2>
      <div className="style-grid"><Card className="style-panel"><span className="page-kicker">Surface</span><h3 style={{ marginTop: 10 }}>Everyday content</h3><p className="quiet-note">Soft border, 16px corners and a restrained shadow.</p></Card><Card className="style-panel" style={{ background: "var(--surface-raised)" }}><span className="page-kicker">Raised surface</span><h3 style={{ marginTop: 10 }}>Secondary emphasis</h3><p className="quiet-note">Used for selected or nested content when needed.</p></Card></div>
    </section>

    <section className="style-section" aria-labelledby="chips-heading">
      <h2 id="chips-heading">Chips · categories and language</h2>
      <Card className="style-panel"><div className="utility-row" role="group" aria-label="Complaint category examples">{categories.map((item) => <Chip key={item.id} selected={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</Chip>)}</div><div style={{ marginTop: 22 }}><LanguageSelector /></div></Card>
    </section>

    <section className="style-section" aria-labelledby="status-heading">
      <h2 id="status-heading">Complaint status</h2>
      <Card className="style-panel"><div className="utility-row">{statuses.map((status) => <StatusBadge key={status} status={status} />)}</div></Card>
    </section>

    <section className="style-section" aria-labelledby="progress-heading">
      <h2 id="progress-heading">Progress ring</h2>
      <Card className="style-panel"><div className="utility-row"><ProgressRing value={0} label="No votes yet" /><ProgressRing value={2} max={3} label="Two of three votes" /><ProgressRing value={3} max={3} label="Three of three votes" /></div></Card>
    </section>

    <section className="style-section" aria-labelledby="mic-heading">
      <h2 id="mic-heading">Microphone orb</h2>
      <Card className="style-panel"><div className="utility-row" style={{ alignItems: "flex-start", gap: 34 }}><MicOrb /><MicOrb listening label="Listening · animated state" /></div><p className="quiet-note" style={{ marginBottom: 0 }}>Visual component preview only; speech recognition is not connected in Phase 1.</p></Card>
    </section>

    <section className="style-section" aria-labelledby="sheet-heading">
      <h2 id="sheet-heading">Bottom sheet</h2>
      <Card className="style-panel"><p className="quiet-note">Opens as a keyboard-accessible modal dialog. Close with Escape or the close button.</p><Button onClick={() => setSheetOpen(true)}>Preview bottom sheet <ArrowRight size={17} aria-hidden="true" /></Button></Card>
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="A little more context" description="A focused surface for a short decision or supporting details."><p className="quiet-note">The native dialog keeps keyboard focus inside the panel and returns focus to the opener when closed.</p><Button onClick={() => setSheetOpen(false)} style={{ marginTop: 16 }}>Done</Button></BottomSheet>
    </section>

    <section className="style-section" aria-labelledby="tokens-heading">
      <h2 id="tokens-heading">Theme and text preferences</h2>
      <Card className="style-panel"><p className="quiet-note">Switch theme or large-text preference from the controls at the top. Both preferences persist locally.</p><PreferenceControls /></Card>
    </section>
  </main>;
}
