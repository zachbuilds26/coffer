# Coffer — Private Grants, Public Accountability

## Objective

Build and submit **Coffer**, a Starknet-mainnet grant-distribution MVP for the STRK20 Private Sprint.

**Product promise:** An onchain community can show a grant round’s purpose, total budget, recipient count, and completion status while individual allocations and payment relationships settle through STRK20 private transfers.

**Scope decision:** Deliver a real, non-custodial product with STRK20 shielding and private transfers. Do not build DAO governance, voting, KYC, a database-backed multi-user workflow, escrow/disputes, multi-token support, or a custom Cairo grant contract. These are all outside the deadline-safe MVP.

## Constraints and success criteria

### Hackathon requirements

- The source repository, demo, and all linked materials must be public and open source with a license.
- The final repository needs a root `strk20.json` before **August 31, 2026 at 23:59 UTC**.
- `strk20.json` must list a public demo URL, a three-minute demo-video URL, and at least **three successful Starknet-mainnet transactions that touch the STRK20 pool**.
- The README must accurately distinguish public deposit information from private note-to-note payouts.
- The live product needs to work for a real user on Starknet mainnet.

### Product/technical assumptions

- The MVP uses the proven privacy SDK route already implemented by **Stash**: wallet connect, shielding, shielded balance discovery, and note-to-note private transfers.
- We will use small real STRK amounts for eligibility proof; shielding is public, while private transfers conceal the transfer’s parties and amount.
- A connected wallet provides the signer and viewing-key path. The app must detect unsupported wallet capabilities and provide a clear error state.
- Grant-round metadata and drafted recipient allocations are local browser state for the MVP. Only the actual STRK20 transactions are onchain. The UI must label drafts appropriately so it does not pretend they are shared/onchain records.

## Visual reference: exact Stash system, product-specific copy

Coffer intentionally retains Stash’s visual system—**not** its vault product language or features.

### Design tokens

- Font: `Source Code Pro` (weights 200–700), monospaced throughout.
- Page background: `#090909`.
- Surfaces: `#141414` default, `#1a1a1a` raised, `#222222` elevated, `#2a2a2a` floating/borders.
- Brand/action red: `#e63946`, hover `#ff4d5a`, active `#cc2f3b`, disabled `#4a2024`.
- Text: heading `#f5f5f5`, body `#b0b0b0`, muted `#6b6b6b`, disabled `#4a4a4a`.
- Success state: `#22c55e`; pending state: `#fbbf24`; errors use the Coffer red.
- Maximum content width: `1200px`; standard horizontal padding: `1.5rem`.
- Flat borders, square corners, no gradient hero, no rounded dashboard tiles, no icon emojis, no extraneous visual effects.
- Component spacing: `2rem` card padding on marketing; `1.5rem` on dashboard cards; `1px` dividers; 3rem action controls; 6rem marketing sections.
- Type: landing headline `clamp(2.5rem, 6vw, 4.5rem) / 600 / 1`; section headline `clamp(1.75rem, 4vw, 2.5rem) / 600 / 1.1`; uppercase label 0.875rem/600; supporting text at 0.875rem with 1.5 leading.

### Coffer identity

- Wordmark: `COFFER` in the Stash wordmark scale and Source Code Pro weight.
- Mark: a square Coffer-red field with an original simple SVG lockbox/ledger glyph in white. It must not reuse the Stash shield artwork.
- Core line: **Private grants, public accountability.**
- Hero: **Fund the work. Keep the terms private.**
- Voice: factual, direct, operations-oriented—not generic “complete privacy” claims.

## User journeys

### A. Landing page: understand and enter

**Route:** `/`

1. Header: Coffer mark, anchor link to the privacy model, `Learn more`, and a working `Launch app` link to `/dashboard`.
2. Hero: a flat black canvas with a subtle Coffer-red, animated ledger/transfer field—not a two-stop gradient. It explains the public-vs-private model in one short sentence.
3. Value section: three product-specific pillars:
   - **Name the round** — publish a grant purpose and visible total budget.
   - **Set allocations privately** — recipient wallet/payment relationship and allocation stay in the organizer’s local Coffer workspace until payment.
   - **Release through STRK20** — recipients are paid using shielded notes, with a clear chain proof.
4. Workflow: four steps: create a round, shield the grant budget, prepare private recipients, release grants.
5. Privacy disclosure grid: explicitly label what is public (round title, total declared budget, recipient count, the shielding deposit) vs private (private transfer amount and payment parties). Avoid claims the protocol does not guarantee.
6. Demo readiness / proof section: use true dynamic or labelled MVP-state information. Do not invent protocol metrics.
7. FAQ: explain Coffer, wallet requirements, what privacy covers, and that the MVP stores drafts in this browser.
8. Footer: actual GitHub, STRK20 docs, Starknet, and hackathon links. No inert links.

### B. Dashboard: create and operate one grant round

**Route:** `/dashboard`

#### Disconnected state

- Reuse Stash’s centered connect-wallet flow and modal behavior.
- State text: connect a Starknet wallet to create a local grant workspace and make real STRK20 payments.
- Include no fake balances or disabled workflows that appear live.

#### Connected state

1. **Top shell:** Coffer mark, connected wallet pill with copy feedback, disconnect action.
2. **Grant round header:** editable name (default: `Untitled grant round`), purpose, visible declared budget in STRK, and draft/local-state label. Saving updates local browser state; a reset action has a confirmation.
3. **Three summary cards:**
   - `Shielded grant balance` — queried STRK20 balance, or a clear unavailable/loading state.
   - `Recipients prepared` — drafted recipients / total.
   - `Release status` — not funded, ready to release, or completed for the active local round.
4. **Primary action panel:** retain Stash’s flat tabbed action-panel pattern, replacing tabs with:
   - `Fund` — select STRK, enter amount, call the Stash-derived `shieldTokens` path; explain the deposit is public.
   - `Recipients` — add/edit/remove a local recipient label plus a Starknet address. Allocation input is local. Validate addresses and total allocation against the observed or manually input available balance.
   - `Release` — select a prepared recipient and execute the SDK private-transfer function. Require an explicit confirmation panel that identifies exactly which privacy property applies. Disable safely while pending.
5. **Round activity:** show only real transactions that Coffer submitted in the current browser workspace; each includes status and a working Voyager transaction link. No fabricated history.
6. **Privacy callout:** always visible below the action panel; uses precise wording: deposits reveal address/token/amount; Coffer private payouts use STRK20 notes to conceal parties and transfer amounts.

#### States to implement

- wallet discovery/loading; no compatible wallet; wallet connect cancelled; wrong-network or mainnet-required;
- privacy functionality unavailable in chosen wallet;
- shielded-balance discovery loading/empty/error;
- invalid amount/address; allocations exceed available shielded balance;
- transaction awaiting signature, submitted/pending, succeeded with Voyager link, and failed with readable error;
- no recipients; draft round reset confirmation; mobile single-column layout.

## Repository and application architecture

### New repository

Create a separate public GitHub repository named `coffer` under the user’s GitHub account, with MIT license, descriptive About metadata, initial commit, and GitHub repository Website field populated after deployment. Coffer replaces the existing participant’s registration `repo_url`; do not create a duplicate entry.

### Project structure

```text
coffer/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # marketing site
│   │   ├── dashboard/page.tsx           # operational grant dashboard
│   │   ├── layout.tsx                   # metadata and global CSS
│   │   └── globals.css                  # Stash-exact token system
│   ├── components/
│   │   ├── BrandMark.tsx                # original Coffer glyph/wordmark
│   │   ├── WalletModal.tsx              # adapted from Stash, with accessibility fixes
│   │   ├── AppHeader.tsx
│   │   ├── GrantRoundEditor.tsx
│   │   ├── RecipientManager.tsx
│   │   ├── ReleaseConfirm.tsx
│   │   ├── TransactionResult.tsx
│   │   └── icons.tsx                    # Source Code-styled, monoline SVG icons
│   ├── lib/
│   │   ├── wallet.ts                    # Starknet wallet discovery/connection
│   │   ├── strk20.ts                    # pool configuration, shielding, discovery, transfer helpers
│   │   ├── grant-round.ts               # local types, validation, aggregate calculations
│   │   └── storage.ts                   # versioned localStorage persistence only
│   └── hooks/
│       └── useGrantRound.ts              # state, persistence and transaction activity
├── public/
├── strk20.json                           # added/updated during mainnet proof stage
├── README.md
├── .env.example
├── LICENSE
└── package.json
```

### Dependencies

Start from Stash’s known-working approach:

- Next.js + React + TypeScript
- `starknet`
- `@starknet-io/get-starknet`
- wallet-standard packages required by Stash
- Zustand only if it simplifies wallet state; otherwise use a small React context/hooks footprint

Do not introduce a backend/database unless mainnet SDK behavior proves it necessary. The point is a robust, straightforward client-side mainnet MVP.

### STRK20 integration plan

1. Copy and understand Stash’s tested wallet and STRK20 helper layer rather than hand-writing proofs or guessing endpoints.
2. Configure the official mainnet values:
   - `CHAIN_ID=SN_MAIN`
   - `POOL_ADDRESS=0x040337b1af3c663e86e333bab5a4b28da8d4652a15a69beee2b677776ffe812a`
   - a valid mainnet RPC URL.
3. Verify wallet readiness before showing a release flow. Probe the privacy capabilities safely; offer useful errors rather than pretending all wallets support STRK20.
4. Fund flow: public ERC-20 approval/deposit/shield flow via the pool helper.
5. Recipient flow: validate and stage recipient addresses/allocations locally.
6. Release flow: use the SDK’s private note-to-note transfer to a recipient whose viewing key is registered. If recipient onboarding/viewing-key registration is needed, present it explicitly and provide an in-product link/instruction—not hidden magic.
7. Store hash, status, and a user-readable operation label locally after every successful/accepted call.
8. Verify the final three candidate hashes against Voyager and pool event criteria before placing them in `strk20.json`.

## Delivery sequence

1. **Create and register Coffer**
   - Create `coffer` public repository with MIT License and initial README.
   - Find the user’s existing row in the official `registry.json`.
   - Submit a PR that changes only their existing row to Coffer’s URL, project name, one-line description, category `Payments`, user’s team handle, and `inspired_by: "RFP-11"` (private payroll/treasury disbursement is the closest RFP).
   - The PR must be authored by the user’s GitHub account or otherwise satisfy row ownership checks.

2. **Bootstrap Stash-derived application shell**
   - Initialize Coffer with the compatible Next.js/Starknet dependencies.
   - Adapt global CSS tokens exactly from Stash; preserve only the visual system.
   - Add the original Coffer SVG mark and complete global accessibility/focus behavior.

3. **Build the landing page**
   - Implement all sections above, mobile layout, real navigation, and source links.
   - Replace all Stash-specific statements, exaggerated privacy claims, nonfunctional CTA buttons, made-up metrics, and placeholder social links.

4. **Build wallet + grant workspace**
   - Reuse/adapt wallet modal/discovery and mainnet configuration.
   - Add durable local grant-round state, recipient management, input validation, and every empty/loading/error/success state.

5. **Wire real STRK20 actions**
   - Add shield balance discovery, mainnet shield/fund action, recipient prerequisite checks, and private release action.
   - Confirm every action has a visible, non-invented outcome and Voyager link.

6. **Prepare ship-quality hackathon assets**
   - Write a complete README: problem, product flow, architecture, exact privacy model/limitations, mainnet setup, local setup, contract addresses, and transaction evidence.
   - Publish a responsive public deployment and set it as the GitHub repository Website.
   - Make three small mainnet pool interactions and record the verified successful hashes.
   - Create `strk20.json` with hashes, any contract address if one exists, demo URL, and public three-minute video URL.
   - Record the demo: create a round, show public/declarative round state, shield, stage recipients, release payment, inspect the transaction link, and explain the privacy model accurately.

7. **Verification gate**
   - Run lint, typecheck, production build, and a mobile-width pass.
   - Test disconnected, connected, unsupported wallet, funding, validation, release confirmation, pending, failure, and success states.
   - Re-open all public GitHub/demo/video/Voyager links without authentication.
   - Inspect `strk20.json` and chain results against the hackathon’s exact eligibility rules.

## Explicit non-goals for v1

- Managing third-party recipients’ identity or eligibility
- Onchain grant voting/governance
- Automated/all-recipient batch payout contract
- Token swaps or multi-token accounting
- Hiding the public deposit amount/address
- Claiming Coffer makes all grant operations anonymous

## Acceptance checklist

- [ ] Coffer is a public, licensed GitHub repository and replaces—not duplicates—the registration entry.
- [ ] Landing and dashboard use Stash’s Source Code Pro, red/black token system, square flat surfaces, and information density, with entirely Coffer-specific assets and copy.
- [ ] Every visible control operates, navigates, or is correctly disabled with an explanation.
- [ ] Coffer creates local grant-round drafts, funds a shielded balance, stages recipients, and makes at least one real private transfer where wallet/recipient capabilities allow.
- [ ] Privacy claims accurately say what is public vs private.
- [ ] The app is responsive and all error/loading/success states are handled.
- [ ] README, deployment, demo, video, `strk20.json`, and three verified pool-touching mainnet transaction hashes are public and ready before the deadline.
