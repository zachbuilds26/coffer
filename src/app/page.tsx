"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const pillars = [
  {
    number: "01",
    title: "Name the round",
    body: "Set the work being funded, the round’s declared budget, and how many grants you intend to release.",
  },
  {
    number: "02",
    title: "Prepare allocations",
    body: "Keep recipient addresses and individual allocations in your local Coffer workspace until you are ready to pay.",
  },
  {
    number: "03",
    title: "Release through STRK20",
    body: "Fund the privacy pool, then send shielded grant payouts from your Starknet wallet to registered recipients.",
  },
];

const privacyRows = [
  { public: "The shielding deposit", private: "Who received a private payout" },
  { public: "Deposit address, token, and amount", private: "The private transfer amount" },
  { public: "What you choose to publish about the round", private: "The link between payer and recipient" },
];

const faqs = [
  {
    question: "What is Coffer?",
    answer: "Coffer is a workspace for communities distributing grants through Starknet. It keeps a grant round’s operations organised while using STRK20 private transfers for individual payouts.",
  },
  {
    question: "What does Coffer keep private?",
    answer: "A STRK20 private transfer protects the transfer amount and the relationship between its sender and recipient. A shielding deposit is not private: its address, token, and amount are visible onchain.",
  },
  {
    question: "Where is my grant-round data stored?",
    answer: "For this MVP, the round name, notes, drafted recipients, and local activity list are stored in your browser. Coffer does not present them as shared onchain records.",
  },
  {
    question: "What does a recipient need?",
    answer: "They need a privacy-capable Starknet wallet and a registered STRK20 viewing key before a private transfer can be received.",
  },
];

function CofferMark({ compact = false }: { compact?: boolean }) {
  return (
    <span style={{ alignItems: "center", display: "inline-flex", gap: compact ? "0.5rem" : "0.75rem" }}>
      <svg aria-hidden="true" height={compact ? 24 : 30} viewBox="0 0 32 32" width={compact ? 24 : 30}>
        <rect fill="var(--surface-action)" height="32" width="32" />
        <path d="M8 11h16v13H8zM11 11V8h10v3M13 17h6" fill="none" stroke="#f5f5f5" strokeWidth="1.75" />
      </svg>
      <span style={{ color: "var(--text-heading)", fontSize: compact ? "0.95rem" : "1.05rem", fontWeight: 700, letterSpacing: "0.07em" }}>COFFER</span>
    </span>
  );
}

function Arrow() {
  return <span aria-hidden="true" style={{ fontSize: "1.1rem", lineHeight: 1 }}>→</span>;
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  const wrap: React.CSSProperties = { margin: "0 auto", maxWidth: "var(--max-width)", padding: "0 1.5rem" };
  const label: React.CSSProperties = { color: "var(--surface-action)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" };
  const section: React.CSSProperties = { padding: "6rem 0" };
  const secondaryButton: React.CSSProperties = { background: "var(--surface-raised)", border: "1px solid var(--border-default)", color: "var(--text-heading)", display: "inline-flex", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.03em", padding: "0.7rem 0.9rem", textTransform: "uppercase" };
  const primaryButton: React.CSSProperties = { ...secondaryButton, background: "var(--surface-action)", borderColor: "var(--surface-action)", gap: "0.65rem" };

  return (
    <div>
      <header style={{ backdropFilter: scrolled ? "blur(12px)" : "none", background: scrolled ? "rgba(9,9,9,0.95)" : "transparent", borderBottom: scrolled ? "1px solid var(--border-default)" : "1px solid transparent", position: "sticky", top: 0, transition: "0.2s ease", zIndex: 5 }}>
        <div style={{ ...wrap, alignItems: "center", display: "flex", height: "4rem", justifyContent: "space-between" }}>
          <CofferMark compact />
          <nav aria-label="Primary navigation" style={{ alignItems: "center", display: "flex", gap: "0.75rem" }}>
            <a href="#privacy" style={secondaryButton}>Privacy model</a>
            <Link href="/dashboard" style={primaryButton}>Launch workspace <Arrow /></Link>
          </nav>
        </div>
      </header>

      <main>
        <section style={{ ...section, alignItems: "center", display: "flex", minHeight: "calc(100vh - 4rem)", paddingTop: "4rem", position: "relative" }}>
          <svg aria-hidden="true" height="100%" style={{ inset: 0, opacity: 0.32, pointerEvents: "none", position: "absolute", width: "100%" }} viewBox="0 0 1440 900" preserveAspectRatio="none">
            <path d="M160 0V900M1280 0V900M0 170H1440M0 730H1440" fill="none" stroke="var(--border-default)" strokeWidth="1" />
            <path d="M720 115V345M720 555V785M535 450H905" fill="none" stroke="var(--surface-action)" strokeWidth="1" />
            <rect x="715" y="445" fill="var(--surface-action)" height="10" width="10" />
          </svg>
          <div style={{ ...wrap, position: "relative", textAlign: "center" }}>
            <p style={label}>Private grants / Starknet mainnet</p>
            <h1 style={{ color: "var(--text-heading)", fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 600, letterSpacing: "-0.06em", lineHeight: 0.96, margin: "1.25rem auto 0", maxWidth: "12ch" }}>Fund the work.<br /><span style={{ color: "var(--surface-action)" }}>Keep the terms private.</span></h1>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", lineHeight: 1.7, margin: "1.75rem auto 0", maxWidth: "47rem" }}>Coffer gives onchain communities one operating desk for a grant round: declare what the round is for, fund a shielded balance, and release private STRK20 payouts.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginTop: "2rem" }}>
              <Link href="/dashboard" style={{ ...primaryButton, padding: "0.9rem 1.2rem" }}>Open grant workspace <Arrow /></Link>
              <a href="#how-it-works" style={{ ...secondaryButton, padding: "0.9rem 1.2rem" }}>See the workflow</a>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1.7, margin: "2rem auto 0", maxWidth: "43rem" }}>Coffer does not claim deposits are private. It distinguishes a public shielding deposit from a private STRK20 grant transfer.</p>
          </div>
        </section>

        <div style={{ background: "var(--border-default)", height: 1 }} />

        <section style={section}>
          <div style={wrap}>
            <div style={{ marginBottom: "3rem", textAlign: "center" }}>
              <p style={label}>The grant desk</p>
              <h2 style={{ color: "var(--text-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.1, marginTop: "0.75rem" }}>Accountable where it matters.<br />Private where it counts.</h2>
            </div>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {pillars.map((pillar) => (
                <article key={pillar.number} style={{ background: "var(--surface-default)", border: "1px solid var(--border-default)", minHeight: "15rem", padding: "1.75rem" }}>
                  <p style={{ color: "var(--surface-action)", fontSize: "1.75rem", fontWeight: 700, opacity: 0.65 }}>{pillar.number}</p>
                  <h3 style={{ color: "var(--text-heading)", fontSize: "1.05rem", marginTop: "2rem" }}>{pillar.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.7, marginTop: "0.75rem" }}>{pillar.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div style={{ background: "var(--border-default)", height: 1 }} />

        <section id="how-it-works" style={section}>
          <div style={wrap}>
            <div style={{ display: "grid", gap: "3rem", gridTemplateColumns: "minmax(0, .8fr) minmax(0, 1.2fr)" }}>
              <div>
                <p style={label}>How it works</p>
                <h2 style={{ color: "var(--text-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.1, marginTop: "0.75rem" }}>One round.<br />Four deliberate steps.</h2>
              </div>
              <ol style={{ display: "grid", gap: "1rem", listStyle: "none" }}>
                {[
                  ["01", "Create the round", "Set the purpose, a declared budget, and the scope of the funding work."],
                  ["02", "Fund the pool", "Shield STRK through your privacy-capable Starknet wallet. This funding deposit is public."],
                  ["03", "Prepare recipients", "Add recipient addresses and allocations to the local workspace, then confirm they can receive STRK20."],
                  ["04", "Release grants", "Approve each private transfer in your wallet and retain the chain transaction proof in Coffer."],
                ].map(([number, title, body]) => (
                  <li key={number} style={{ borderBottom: "1px solid var(--border-default)", display: "grid", gap: "1rem", gridTemplateColumns: "3rem 1fr", paddingBottom: "1rem" }}>
                    <span style={{ color: "var(--surface-action)", fontWeight: 700 }}>{number}</span>
                    <div><h3 style={{ color: "var(--text-heading)", fontSize: "0.95rem" }}>{title}</h3><p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.7, marginTop: "0.4rem" }}>{body}</p></div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <div style={{ background: "var(--border-default)", height: 1 }} />

        <section id="privacy" style={section}>
          <div style={wrap}>
            <div style={{ marginBottom: "3rem", textAlign: "center" }}>
              <p style={label}>Privacy model</p>
              <h2 style={{ color: "var(--text-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.1, marginTop: "0.75rem" }}>Say exactly what the chain reveals.</h2>
              <p style={{ lineHeight: 1.7, margin: "1rem auto 0", maxWidth: "44rem" }}>Coffer is designed around STRK20’s actual privacy properties. That means no vague promises and no “fully anonymous” marketing.</p>
            </div>
            <div style={{ border: "1px solid var(--border-default)" }}>
              <div style={{ background: "var(--surface-raised)", color: "var(--text-heading)", display: "grid", fontSize: "0.75rem", fontWeight: 700, gridTemplateColumns: "1fr 1fr", textTransform: "uppercase" }}><span style={{ padding: "1rem" }}>Public</span><span style={{ borderLeft: "1px solid var(--border-default)", padding: "1rem" }}>Private in a STRK20 transfer</span></div>
              {privacyRows.map((row) => <div key={row.public} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}><p style={{ borderTop: "1px solid var(--border-default)", fontSize: "0.8125rem", lineHeight: 1.6, padding: "1rem" }}>{row.public}</p><p style={{ borderLeft: "1px solid var(--border-default)", borderTop: "1px solid var(--border-default)", color: "var(--text-heading)", fontSize: "0.8125rem", lineHeight: 1.6, padding: "1rem" }}>{row.private}</p></div>)}
            </div>
          </div>
        </section>

        <div style={{ background: "var(--border-default)", height: 1 }} />

        <section style={section}>
          <div style={wrap}>
            <div style={{ marginBottom: "3rem", textAlign: "center" }}><p style={label}>Questions</p><h2 style={{ color: "var(--text-heading)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginTop: "0.75rem" }}>The details matter.</h2></div>
            <div style={{ margin: "0 auto", maxWidth: "48rem" }}>
              {faqs.map((faq, index) => <div key={faq.question} style={{ borderBottom: "1px solid var(--border-default)" }}><button aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} style={{ alignItems: "center", background: "transparent", border: 0, color: "var(--text-heading)", display: "flex", fontSize: "0.9rem", fontWeight: 600, justifyContent: "space-between", padding: "1.25rem 0", textAlign: "left", width: "100%" }}><span>{faq.question}</span><span aria-hidden="true" style={{ color: "var(--surface-action)", fontSize: "1.25rem", marginLeft: "1rem", transform: openFaq === index ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span></button>{openFaq === index ? <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.7, paddingBottom: "1.25rem" }}>{faq.answer}</p> : null}</div>)}
            </div>
          </div>
        </section>

        <section style={{ background: "var(--surface-default)", borderTop: "1px solid var(--border-default)", padding: "4rem 0" }}>
          <div style={{ ...wrap, alignItems: "center", display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between" }}>
            <div><p style={label}>Ready to fund a round?</p><h2 style={{ color: "var(--text-heading)", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", lineHeight: 1.1, marginTop: "0.75rem" }}>Open your Coffer workspace.</h2></div>
            <Link href="/dashboard" style={{ ...primaryButton, padding: "0.95rem 1.1rem" }}>Launch workspace <Arrow /></Link>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border-default)", padding: "2rem 0" }}>
        <div style={{ ...wrap, alignItems: "center", display: "flex", flexWrap: "wrap", fontSize: "0.75rem", gap: "1.25rem", justifyContent: "space-between" }}>
          <CofferMark compact />
          <div style={{ display: "flex", gap: "1rem" }}><a href="https://github.com/zachbuilds26/coffer" rel="noreferrer" target="_blank">GitHub</a><a href="https://strk20-by-example.org/what-is-strk20" rel="noreferrer" target="_blank">STRK20 docs</a><a href="https://strk20.starknet.io/hackathon" rel="noreferrer" target="_blank">Private Sprint</a></div>
        </div>
      </footer>
    </div>
  );
}
