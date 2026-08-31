import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <p style={{ color: "var(--surface-action)", fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.04em" }}>
        COFFER / PRIVATE SPRINT
      </p>
      <h1 style={{ color: "var(--text-heading)", fontSize: "clamp(2.5rem, 8vw, 5.5rem)", lineHeight: 1, marginTop: "1rem", maxWidth: "12ch" }}>
        Fund the work. Keep the terms private.
      </h1>
      <p style={{ maxWidth: "48rem", fontSize: "1.125rem", lineHeight: 1.7, marginTop: "1.5rem" }}>
        Coffer is a private grant-distribution workspace for onchain communities. It uses STRK20 to release grant payouts without publishing recipient allocations or payment relationships.
      </p>
      <Link href="/dashboard" style={{ display: "inline-block", marginTop: "2rem", padding: "0.9rem 1.25rem", background: "var(--surface-action)", color: "var(--text-heading)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.875rem" }}>
        Launch workspace
      </Link>
    </main>
  );
}
