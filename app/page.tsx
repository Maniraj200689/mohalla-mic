import Link from "next/link";
import { ArrowDown, ArrowRight, AudioLines, Check, LockKeyhole, Mic2, MessageSquareText, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Mic2,
    title: "Speak or type",
    description: "Describe what you noticed in English, Hindi, or Kannada. Typed reporting is available when speech recognition is not.",
  },
  {
    number: "02",
    icon: MessageSquareText,
    title: "Review the summary",
    description: "Check the issue, category, and nearby landmark before moving ahead.",
  },
  {
    number: "03",
    icon: Check,
    title: "Confirm to save",
    description: "Nothing is saved as a complaint until you review and confirm it.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <header className="mx-auto flex w-[min(1160px,calc(100%-40px))] items-center justify-between py-5 sm:py-7">
        <Link href="/" className="inline-flex min-h-12 items-center gap-3 rounded-full" aria-label="Mohalla Mic home">
          <span className="grid size-10 place-items-center rounded-[14px] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent-deep))] text-[#17140e]">
            <AudioLines size={20} aria-hidden="true" />
          </span>
          <span className="font-bold tracking-wide">Mohalla Mic</span>
        </Link>
        <nav aria-label="Page navigation" className="flex items-center gap-1 sm:gap-3">
          <a href="#how-it-works" className="inline-flex min-h-12 items-center rounded-full px-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:px-4">How it works</a>
          <a href="#privacy" className="inline-flex min-h-12 items-center rounded-full px-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:px-4">Privacy</a>
        </nav>
      </header>

      <main>
        <section aria-labelledby="hero-title" className="mx-auto grid min-h-[min(760px,calc(100svh-84px))] w-[min(1160px,calc(100%-40px))] grid-cols-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-20">
          <div className="max-w-[660px]">
            <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.19em] text-[var(--accent-readable)] sm:text-sm">Voice-first neighbourhood reporting</p>
            <h1 id="hero-title" className="font-serif text-[clamp(3.1rem,11vw,6.1rem)] font-medium leading-[0.98] tracking-[-0.055em] text-[var(--text-primary)]">Say it once.<br />Your whole street<br className="hidden sm:block" /> is heard.</h1>
            <p className="mt-6 max-w-[570px] text-base leading-7 text-[var(--text-secondary)] sm:mt-7 sm:text-lg sm:leading-8">Make a neighbourhood concern easier to share, review, and follow together—in the language that feels natural to you.</p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
              <Link href="/app" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,var(--accent-strong),var(--accent-deep))] px-7 py-3 text-sm font-extrabold text-[#17140e] shadow-[0_8px_22px_color-mix(in_srgb,var(--accent)_15%,transparent)] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]">
                <Mic2 size={18} aria-hidden="true" />Tap to speak<ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-7 py-3 text-sm font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]">
                See how it works<ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="mt-5 text-sm text-[var(--text-muted-readable)]">English · हिन्दी · ಕನ್ನಡ</p>
          </div>

          <div aria-label="Voice and text reporting illustration" role="img" className="relative mx-auto flex aspect-[0.98] w-full max-w-[470px] items-center justify-center overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:aspect-square sm:p-10">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_57%)]" />
            <div className="relative flex w-full max-w-[340px] flex-col items-center">
              <div className="mb-7 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted-readable)]">
                <span className="size-1.5 rounded-full bg-[var(--status-fixed)]" />Voice or text
              </div>
              <div className="relative grid size-32 place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[linear-gradient(145deg,var(--accent-strong),var(--accent-deep))] text-[#17140e] shadow-[0_0_0_12px_color-mix(in_srgb,var(--accent)_7%,transparent),0_0_44px_color-mix(in_srgb,var(--accent)_24%,transparent)] sm:size-36">
                <Mic2 size={38} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <div aria-hidden="true" className="my-8 flex h-10 items-center justify-center gap-1.5">
                {[12, 21, 31, 18, 27, 36, 20, 30, 14, 24, 34, 17, 27, 12].map((height, index) => <span key={index} className="w-[3px] rounded-full bg-[var(--accent)] opacity-75" style={{ height }} />)}
              </div>
              <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 sm:p-5">
                <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--text-muted-readable)]">A clear place to begin</p>
                <p className="font-serif text-xl leading-snug text-[var(--text-primary)] sm:text-2xl">“The streetlight near the park is out.”</p>
                <p className="mt-3 text-xs text-[var(--text-secondary)]">Example wording · no recording stored</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-8 border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto w-[min(1160px,calc(100%-40px))] py-16 sm:py-20 lg:py-24">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.19em] text-[var(--accent-readable)]">A simple, considered flow</p>
            <h2 id="how-heading" className="max-w-[720px] font-serif text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">From what you noticed to a report you can stand behind.</h2>
            <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
              {steps.map(({ number, icon: Icon, title, description }) => <article key={number} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_11%,var(--surface))] text-[var(--accent-readable)]"><Icon size={19} aria-hidden="true" /></span>
                  <span className="font-serif text-lg text-[var(--text-muted-readable)]">{number}</span>
                </div>
                <h3 className="mt-7 font-serif text-2xl font-medium tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              </article>)}
            </div>
          </div>
        </section>

        <section id="why-voice" aria-labelledby="why-heading" className="mx-auto grid w-[min(1160px,calc(100%-40px))] grid-cols-1 gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.19em] text-[var(--accent-readable)]">Why voice</p>
            <h2 id="why-heading" className="font-serif text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">Start with the way you already speak.</h2>
          </div>
          <div className="space-y-5 text-[var(--text-secondary)]">
            <p className="text-lg leading-8">A report can begin in English, Hindi, or Kannada, with typed input available if speech recognition is unavailable or does not suit the moment.</p>
            <p className="text-sm leading-6">Speech recognition support varies by browser, device, and language. The Web Speech API does not guarantee on-device processing; recognition may use browser or platform services.</p>
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6">
              <MessageSquareText className="mt-0.5 shrink-0 text-[var(--accent-readable)]" size={18} aria-hidden="true" />
              <p>Review the wording and summary before confirming, so the report reflects what you meant to say.</p>
            </div>
          </div>
        </section>

        <section id="privacy" aria-labelledby="privacy-heading" className="border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto grid w-[min(1160px,calc(100%-40px))] grid-cols-1 items-center gap-8 py-14 sm:py-16 md:grid-cols-[auto_1fr] md:gap-10">
            <span className="grid size-16 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--accent-readable)]"><ShieldCheck size={27} aria-hidden="true" /></span>
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.19em] text-[var(--accent-readable)]">Privacy, by design</p>
              <h2 id="privacy-heading" className="font-serif text-3xl font-medium tracking-[-0.03em] sm:text-4xl">Your voice starts a report. It is never stored as audio.</h2>
              <p className="mt-3 max-w-[780px] text-sm leading-6 text-[var(--text-secondary)]">Only a report you review and confirm is saved. Before saving, digit sequences of four or more digits and honorific-plus-name patterns are redacted. Speech recognition may rely on browser or platform services, so on-device processing cannot be promised.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:col-start-2">
              <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--border)] px-4 text-xs font-bold text-[var(--text-secondary)]"><LockKeyhole size={15} aria-hidden="true" />No audio saved</span>
              <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--border)] px-4 text-xs font-bold text-[var(--text-secondary)]"><Check size={15} aria-hidden="true" />Confirmation required</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-[min(1160px,calc(100%-40px))] flex-col gap-4 py-7 text-sm text-[var(--text-muted-readable)] sm:flex-row sm:items-center sm:justify-between sm:py-9">
        <Link href="/" className="inline-flex min-h-12 items-center gap-2 font-bold text-[var(--text-secondary)]"><AudioLines size={17} aria-hidden="true" />Mohalla Mic</Link>
        <p className="m-0">Neighbourhood concerns, heard with care.</p>
        <a href="#hero-title" className="inline-flex min-h-12 items-center gap-2 rounded-full px-3 font-semibold hover:text-[var(--text-primary)]">Back to top<ArrowDown size={15} className="rotate-180" aria-hidden="true" /></a>
      </footer>
    </div>
  );
}
