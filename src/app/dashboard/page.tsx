"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

import { useGrantRound } from "@/hooks/use-grant-round";
import { useWallet } from "@/hooks/use-wallet";
import {
  formatTokenAmount,
  fundShieldedBalance,
  parseTokenAmount,
  readShieldedStrkBalance,
  releasePrivateGrant,
  voyagerTransactionUrl,
  type TransactionState,
} from "@/lib/strk20";

const emptyRecipient = { label: "", address: "", amount: "" };

type Tab = "fund" | "recipients" | "release";

function truncateAddress(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function StatusLine({ state }: { state: TransactionState | null }) {
  if (!state || state.state === "idle") return null;

  const color =
    state.state === "confirmed"
      ? "var(--status-success)"
      : state.state === "pending" || state.state === "awaiting_signature"
        ? "var(--status-pending)"
        : "var(--surface-action)";

  return (
    <div style={{ border: `1px solid ${color}`, color, padding: "0.9rem", fontSize: "0.8125rem", lineHeight: 1.6 }}>
      <strong style={{ display: "block", color: "var(--text-heading)", marginBottom: "0.25rem" }}>
        {state.state === "confirmed" ? "Transaction confirmed" : state.state === "pending" ? "Transaction pending" : state.state === "failed" ? "Transaction failed" : "Awaiting wallet"}
      </strong>
      {state.message}
      {"hash" in state && state.hash ? (
        <a href={voyagerTransactionUrl(state.hash)} target="_blank" rel="noreferrer" style={{ display: "block", color, marginTop: "0.5rem", textDecoration: "underline" }}>
          View transaction on Voyager →
        </a>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const wallet = useWallet();
  const grant = useGrantRound();
  const [tab, setTab] = useState<Tab>("fund");
  const [fundAmount, setFundAmount] = useState("");
  const [recipientDraft, setRecipientDraft] = useState(emptyRecipient);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [balance, setBalance] = useState<bigint | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<TransactionState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const selectedRecipient = useMemo(
    () => grant.round.recipients.find((recipient) => recipient.id === selectedRecipientId),
    [grant.round.recipients, selectedRecipientId],
  );

  const draftAllocationExceedsBalance =
    balance !== null && parseTokenAmount(grant.allocations.toString()) > balance;

  async function refreshBalance() {
    if (!wallet.account) return;

    setBalanceError(null);
    try {
      setBalance(await readShieldedStrkBalance(wallet.account));
    } catch (error) {
      setBalanceError(error instanceof Error ? error.message : "Could not read the private balance.");
    }
  }

  // The balance is loaded through the explicit Refresh balance control so the
  // wallet never triggers a privacy read merely by mounting this screen.

  function addRecipient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const issue = grant.addRecipient(recipientDraft);
    setRecipientError(issue);
    if (!issue) setRecipientDraft(emptyRecipient);
  }

  async function fundRound(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!wallet.account) return;

    const amount = parseTokenAmount(fundAmount);
    if (amount <= 0n) {
      setActionState({ state: "failed", message: "Enter a valid STRK amount." });
      return;
    }

    setIsSubmitting(true);
    setActionState({ state: "awaiting_signature", message: "Approve the public STRK20 deposit in your wallet." });
    const result = await fundShieldedBalance(wallet.account, amount);
    setActionState(result);
    setIsSubmitting(false);

    if ((result.state === "confirmed" || result.state === "pending") && result.hash) {
      grant.recordFunding(fundAmount, result.hash);
      setFundAmount("");
      void refreshBalance();
    }
  }

  async function releaseGrant() {
    if (!wallet.account || !selectedRecipient) return;

    const amount = parseTokenAmount(selectedRecipient.amount);
    if (balance !== null && amount > balance) {
      setActionState({ state: "failed", message: "This payout is larger than the shielded STRK balance." });
      return;
    }

    setIsSubmitting(true);
    setActionState({ state: "awaiting_signature", message: "Approve the private STRK20 transfer in your wallet." });
    const result = await releasePrivateGrant(wallet.account, selectedRecipient.address, amount);
    setActionState(result);
    setIsSubmitting(false);

    if ((result.state === "confirmed" || result.state === "pending") && result.hash) {
      grant.recordRelease(selectedRecipient, result.hash);
      setSelectedRecipientId("");
      void refreshBalance();
    }
  }

  const wrap: React.CSSProperties = { maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 1.5rem" };
  const card: React.CSSProperties = { background: "var(--surface-default)", border: "1px solid var(--border-default)", padding: "1.5rem" };
  const button: React.CSSProperties = { background: "var(--surface-action)", border: 0, color: "var(--text-heading)", fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.03em", padding: "0.85rem 1rem", textTransform: "uppercase" };
  const input: React.CSSProperties = { background: "var(--surface-raised)", border: "1px solid var(--border-default)", color: "var(--text-heading)", padding: "0.8rem", width: "100%" };

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--border-default)", padding: "1rem 0" }}>
        <div style={{ ...wrap, alignItems: "center", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <Link href="/" style={{ color: "var(--text-heading)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.06em" }}>COFFER</Link>
          {wallet.status === "connected" ? (
            <div style={{ alignItems: "center", display: "flex", gap: "0.75rem", fontSize: "0.75rem" }}>
              <span style={{ background: "var(--surface-raised)", color: "var(--text-heading)", padding: "0.65rem 0.8rem" }}>{wallet.address ? truncateAddress(wallet.address) : "Connected"}</span>
              <button onClick={wallet.disconnectWallet} style={{ ...button, background: "transparent", border: "1px solid var(--border-default)", color: "var(--text-body)" }}>Disconnect</button>
            </div>
          ) : (
            <button onClick={wallet.connectWallet} disabled={wallet.status === "connecting"} style={{ ...button, opacity: wallet.status === "connecting" ? 0.6 : 1 }}>
              {wallet.status === "connecting" ? "Connecting…" : "Connect wallet"}
            </button>
          )}
        </div>
      </header>

      {!wallet.account ? (
        <main style={{ ...wrap, alignItems: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "75vh", textAlign: "center" }}>
          <p style={{ color: "var(--surface-action)", fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.04em" }}>PRIVATE GRANT WORKSPACE</p>
          <h1 style={{ color: "var(--text-heading)", fontSize: "clamp(2rem, 6vw, 4rem)", lineHeight: 1.1, marginTop: "1rem", maxWidth: "14ch" }}>Connect to create a grant round.</h1>
          <p style={{ lineHeight: 1.7, marginTop: "1rem", maxWidth: "42rem" }}>Coffer uses your privacy-capable Starknet wallet to fund a shielded balance and release private STRK20 payouts. Draft round details remain in this browser.</p>
          {wallet.message ? <p style={{ color: "var(--surface-action)", fontSize: "0.8125rem", marginTop: "1rem", maxWidth: "42rem" }}>{wallet.message}</p> : null}
          <button onClick={wallet.connectWallet} disabled={wallet.status === "connecting"} style={{ ...button, marginTop: "2rem", opacity: wallet.status === "connecting" ? 0.6 : 1 }}>
            {wallet.status === "connecting" ? "Connecting…" : "Connect Starknet wallet"}
          </button>
        </main>
      ) : (
        <main style={{ ...wrap, paddingBottom: "4rem", paddingTop: "3rem" }}>
          <section style={{ ...card, marginBottom: "1rem" }}>
            <div style={{ alignItems: "start", display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "space-between" }}>
              <div style={{ flex: "1 1 28rem" }}>
                <label style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", marginBottom: "0.5rem", textTransform: "uppercase" }}>Grant round — local draft</label>
                <input aria-label="Grant round name" value={grant.round.name} onChange={(event) => grant.updateDetails({ name: event.target.value })} style={{ ...input, border: 0, color: "var(--text-heading)", fontSize: "1.5rem", fontWeight: 600, padding: 0 }} />
                <textarea aria-label="Grant round purpose" value={grant.round.purpose} onChange={(event) => grant.updateDetails({ purpose: event.target.value })} placeholder="What work is this round funding?" style={{ ...input, marginTop: "0.75rem", minHeight: "5rem", resize: "vertical" }} />
              </div>
              <div style={{ flex: "0 1 13rem" }}>
                <label style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", marginBottom: "0.5rem", textTransform: "uppercase" }}>Declared budget (STRK)</label>
                <input inputMode="decimal" value={grant.round.declaredBudget} onChange={(event) => grant.updateDetails({ declaredBudget: event.target.value })} placeholder="0.00" style={input} />
                <button onClick={() => setShowReset(true)} style={{ background: "transparent", border: 0, color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.75rem", textDecoration: "underline" }}>Reset this local draft</button>
              </div>
            </div>
          </section>

          {showReset ? <section style={{ ...card, borderColor: "var(--surface-action)", marginBottom: "1rem" }}><p style={{ color: "var(--text-heading)" }}>Resetting removes this browser’s round draft and activity list. It cannot reverse onchain transactions.</p><div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}><button onClick={() => { grant.resetRound(); setShowReset(false); }} style={button}>Reset draft</button><button onClick={() => setShowReset(false)} style={{ ...button, background: "var(--surface-raised)" }}>Keep draft</button></div></section> : null}

          <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: "1rem" }}>
            <div style={card}><p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>Shielded grant balance</p><p style={{ color: "var(--text-heading)", fontSize: "1.8rem", fontWeight: 700, marginTop: "0.75rem" }}>{balance === null ? "—" : `${formatTokenAmount(balance)} STRK`}</p><button onClick={() => void refreshBalance()} style={{ background: "transparent", border: 0, color: "var(--surface-action)", fontSize: "0.75rem", marginTop: "0.5rem", textDecoration: "underline" }}>Refresh balance</button>{balanceError ? <p style={{ color: "var(--surface-action)", fontSize: "0.7rem", marginTop: "0.5rem" }}>{balanceError}</p> : null}</div>
            <div style={card}><p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>Recipients prepared</p><p style={{ color: "var(--text-heading)", fontSize: "1.8rem", fontWeight: 700, marginTop: "0.75rem" }}>{grant.releasedCount} / {grant.round.recipients.length}</p><p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.5rem" }}>Released / drafted</p></div>
            <div style={card}><p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>Prepared allocations</p><p style={{ color: draftAllocationExceedsBalance ? "var(--surface-action)" : "var(--text-heading)", fontSize: "1.8rem", fontWeight: 700, marginTop: "0.75rem" }}>{grant.allocations} STRK</p><p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.5rem" }}>{draftAllocationExceedsBalance ? "Exceeds current shielded balance" : "Kept in this browser until release"}</p></div>
          </section>

          <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1.3fr) minmax(18rem, 0.7fr)" }}>
            <div style={card}>
              <div style={{ borderBottom: "1px solid var(--border-default)", display: "flex", marginBottom: "1.5rem" }}>
                {(["fund", "recipients", "release"] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} style={{ background: "transparent", border: 0, borderBottom: tab === item ? "2px solid var(--surface-action)" : "2px solid transparent", color: tab === item ? "var(--text-heading)" : "var(--text-muted)", flex: 1, padding: "0.75rem", textTransform: "uppercase" }}>{item}</button>)}
              </div>

              {tab === "fund" ? <form onSubmit={fundRound}><h2 style={{ color: "var(--text-heading)", fontSize: "1.1rem" }}>Fund the private grant balance</h2><p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.7, marginTop: "0.5rem" }}>This shields STRK into the pool. The deposit address, token, and amount are public; later private transfers conceal payout parties and amounts.</p><label style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem", marginTop: "1.5rem" }}>Amount (STRK)</label><input value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} inputMode="decimal" placeholder="0.00" style={{ ...input, marginTop: "0.5rem" }} /><button disabled={isSubmitting} style={{ ...button, marginTop: "1rem", opacity: isSubmitting ? 0.6 : 1 }}>{isSubmitting ? "Processing…" : "Fund with STRK20"}</button></form> : null}

              {tab === "recipients" ? <><form onSubmit={addRecipient}><h2 style={{ color: "var(--text-heading)", fontSize: "1.1rem" }}>Prepare a recipient</h2><p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.7, marginTop: "0.5rem" }}>The recipient must already have a registered STRK20 viewing key before a private payout can succeed.</p><input value={recipientDraft.label} onChange={(event) => setRecipientDraft((current) => ({ ...current, label: event.target.value }))} placeholder="Recipient label" style={{ ...input, marginTop: "1.25rem" }} /><input value={recipientDraft.address} onChange={(event) => setRecipientDraft((current) => ({ ...current, address: event.target.value }))} placeholder="Starknet address" style={{ ...input, marginTop: "0.75rem" }} /><input value={recipientDraft.amount} onChange={(event) => setRecipientDraft((current) => ({ ...current, amount: event.target.value }))} inputMode="decimal" placeholder="Allocation in STRK" style={{ ...input, marginTop: "0.75rem" }} />{recipientError ? <p style={{ color: "var(--surface-action)", fontSize: "0.75rem", marginTop: "0.5rem" }}>{recipientError}</p> : null}<button style={{ ...button, marginTop: "1rem" }}>Add recipient</button></form><div style={{ marginTop: "1.5rem" }}>{grant.round.recipients.map((recipient) => <div key={recipient.id} style={{ alignItems: "center", background: "var(--surface-raised)", display: "flex", gap: "0.75rem", justifyContent: "space-between", marginTop: "0.5rem", padding: "0.75rem" }}><span><strong style={{ color: "var(--text-heading)", display: "block", fontSize: "0.8125rem" }}>{recipient.label}</strong><span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{truncateAddress(recipient.address)} · {recipient.amount} STRK</span></span>{recipient.status === "released" ? <span style={{ color: "var(--status-success)", fontSize: "0.7rem" }}>RELEASED</span> : <button onClick={() => grant.removeRecipient(recipient.id)} style={{ background: "transparent", border: 0, color: "var(--surface-action)", fontSize: "0.7rem" }}>REMOVE</button>}</div>)}</div></> : null}

              {tab === "release" ? <><h2 style={{ color: "var(--text-heading)", fontSize: "1.1rem" }}>Release a private grant</h2><p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.7, marginTop: "0.5rem" }}>Coffer sends a STRK20 private transfer to the selected registered recipient. Confirm their address and amount in your wallet before signing.</p><select value={selectedRecipientId} onChange={(event) => setSelectedRecipientId(event.target.value)} style={{ ...input, marginTop: "1.25rem" }}><option value="">Choose a drafted recipient</option>{grant.round.recipients.filter((recipient) => recipient.status === "draft").map((recipient) => <option key={recipient.id} value={recipient.id}>{recipient.label} — {recipient.amount} STRK</option>)}</select>{selectedRecipient ? <div style={{ background: "var(--surface-raised)", fontSize: "0.8125rem", lineHeight: 1.8, marginTop: "0.75rem", padding: "0.75rem" }}><strong style={{ color: "var(--text-heading)" }}>{selectedRecipient.label}</strong><br />{selectedRecipient.address}<br />{selectedRecipient.amount} STRK</div> : null}<button onClick={releaseGrant} disabled={!selectedRecipient || isSubmitting} style={{ ...button, marginTop: "1rem", opacity: !selectedRecipient || isSubmitting ? 0.5 : 1 }}>{isSubmitting ? "Processing…" : "Confirm private release"}</button></> : null}

              <div style={{ marginTop: "1.5rem" }}><StatusLine state={actionState} /></div>
            </div>

            <aside style={card}><h2 style={{ color: "var(--text-heading)", fontSize: "1.1rem" }}>Round activity</h2>{grant.round.activity.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.7, marginTop: "1rem" }}>No Coffer transactions in this browser yet.</p> : <div style={{ marginTop: "1rem" }}>{grant.round.activity.map((item) => <a key={item.id} href={voyagerTransactionUrl(item.transactionHash)} target="_blank" rel="noreferrer" style={{ background: "var(--surface-raised)", display: "block", fontSize: "0.75rem", lineHeight: 1.7, marginTop: "0.5rem", padding: "0.75rem" }}><strong style={{ color: "var(--text-heading)", display: "block" }}>{item.kind === "fund" ? "Funded shielded balance" : `Released to ${item.recipientLabel}`}</strong>{item.amount} STRK · Voyager →</a>)}</div>}<div style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1.7, marginTop: "1.5rem", paddingTop: "1.5rem" }}><strong style={{ color: "var(--text-heading)" }}>Privacy note</strong><br />Deposit details are public. Private STRK20 transfers protect the recipient relationship and transfer amount; Coffer does not claim that every part of grant administration is hidden.</div></aside>
          </section>
        </main>
      )}
    </div>
  );
}
