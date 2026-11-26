"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, FilePlus2, House, Mic2 } from "lucide-react";
import type { ReactNode } from "react";
import { PreferenceControls } from "./preference-controls";

const navItems = [
  { href: "/app", label: "Overview", icon: House },
  { href: "/app/report", label: "Report", icon: FilePlus2 },
  { href: "/brief", label: "Community brief", icon: AudioLines },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="app-shell">
    <a className="sr-only" href="#main-content">Skip to main content</a>
    <header className="app-header">
      <Link className="brand" href="/app" aria-label="Mohalla Mic home"><span className="brand-mark"><Mic2 size={19} aria-hidden="true" /></span><span>Mohalla Mic</span></Link>
      <PreferenceControls />
    </header>
    <nav className="app-nav" aria-label="Main navigation">
      {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="nav-link" aria-current={pathname === href ? "page" : undefined}><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>)}
    </nav>
    <main id="main-content" className="app-main">{children}</main>
  </div>;
}
