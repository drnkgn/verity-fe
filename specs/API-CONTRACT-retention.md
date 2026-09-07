# API Contract — Tahan (verita-retention) On-Chain Interface

This is the contract the **frontend builds against** while the backend (Anchor program) is developed separately. For an Anchor program the "API" is the on-chain interface, not REST: program ID, IDL, account layouts, PDA seed derivations, instruction signatures (accounts + args + signers), and error codes.

**Companion file:** `tahan.idl.json` — a stub IDL the frontend imports into the Anchor TS client on day one. This markdown is the human-readable source of truth; the stub IDL mirrors it. When BE-1 emits the real IDL from `anchor build`, it replaces the stub and both are reconciled against this doc.

**Status of this contract**
- Core slice (fund, claim, attest, close, advance_clock) — **stable**, frontend may build against it now (FE-1 → FE-3).
- Stretch (raise_defect_claim, resolve_defect, neutral_locked) — **included but marked STRETCH**; shapes are defined so FE-4 needs no contract revision, but fields may firm up when BE-7/BE-8 land. Do not block core work on these.

---

## 0. Conventions

- **Cluster:** Solana devnet. Public RPC `https://api.devnet.solana.com` unless the team pins a provider.
- **Asset:** native SOL held by the vault PDA. All on-chain amounts are **lamports** (`u64`, 1 SOL = 1_000_000_000 lamports).
- **MYR display:** the MYR figure is a **frontend-only** static multiplier applied to the SOL amount for display. It is never stored or read on-chain. The frontend owns `MYR_PER_SOL` (a config constant) and renders e.g. `2.50 SOL (≈ RM 1,250)`. Changing the rate never touches the program.
- **`mint` field:** present on the vault for swappability but **unused in the demo** (native SOL). Frontend should read it but not depend on it; it will be `PublicKey::default()` (all-zeros / `11111111111111111111111111111111`) in the demo.
- **Timestamps:** unix seconds (`i64`). All program time comparisons use `effective_ts` (see §3), never the raw clock directly.
- **Program ID:** placeholder `Tahan1111111111111111111111111111111111111` until BE-1 deploys. Frontend must read the real ID from the generated IDL / a shared `constants` module — **do not hardcode** beyond a single source.

---

## 1. PDA derivations

### `retention_vault`
Seeds (order matters):
```
["vault", sha256(project_id) (32b), subcontractor (Pubkey, 32b), main_contractor (Pubkey, 32b)]
```
- `project_id`: an arbitrary-length UTF-8 string provided by the caller at funding. It is **hashed to a fixed 32 bytes** (`sha256`) for the seed — this avoids the 32-byte-per-seed limit (real project names fit) and removes any encoding-drift risk between the two tracks. The raw string is **not** recoverable from the seed, so `project_id` is also kept as a **stored field on the vault account** (§2) for display and lookup. Both sides must hash the same bytes (UTF-8, no trailing null, no normalization).
- On-chain the seed is `hash(project_id.as_bytes())` (Anchor's `hash`), not the raw bytes.
- TS derivation:
```ts
import { sha256 } from "js-sha256";

const projectHash = Buffer.from(sha256.arrayBuffer(projectId)); // 32 bytes
const [vaultPda, bump] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("vault"),
    projectHash,
    subcontractor.toBuffer(),
    mainContractor.toBuffer(),
  ],
  programId
);
```

### Freeze accounts (STRETCH)
Each defect freeze is an individually-addressable PDA under the vault:
```
["freeze", vault (Pubkey, 32b), freeze_id (u32 le)]
```

---

## 2. Account layouts

### `RetentionVault`
| Field | Type | Notes |
|---|---|---|
| `main_contractor` | `Pubkey` | funds the vault; **cannot** withdraw after funding |
| `subcontractor` | `Pubkey` | sole caller of `claim_release` |
| `certifier` | `Pubkey` | CA/architect authority for `attest_cpc` / `attest_cmgd` |
| `adjudicator` | `Pubkey` | named at funding, sub consents; resolves freezes (STRETCH) |
| `demo_authority` | `Pubkey` | sole caller of `advance_clock`; distinct from contractor/sub |
| `rent_payer` | `Pubkey` | Verita/platform; fronts the account rent at funding and receives the rent refund on close (never the contractor) |
| `mint` | `Pubkey` | swappable; `default()` (unused) in the SOL demo |
| `project_id` | `string` | stored for display/lookup; its `sha256` is the PDA seed (§1), not the raw string |
| `amount` | `u64` | total retention deposited, lamports |
| `released_cumulative` | `u64` | running total released; **not a boolean** |
| `practical_completion_ts` | `i64` | unix seconds |
| `dlp_days` | `u32` | defects-liability period length |
| `grace_days` | `u32` | backstop grace added after DLP |
| `release_schedule_bps` | `u16` | first-moiety share in basis points (e.g. 5000 = 50%) |
| `cpc_attested` | `bool` | first-moiety certificate flag |
| `aggregate_frozen` | `u64` | Σ active freezes (STRETCH; `0` in core) |
| `active_freeze_count` | `u16` | (STRETCH; `0` in core) |
| `aggregate_freeze_cap` | `u64` | max total frozen (STRETCH) |
| `max_active_freezes` | `u16` | count bound (STRETCH) |
| `clock_offset` | `i64` | demo-only; added to real clock; `0` in production |
| `status` | `u8` enum | see §2.1 |
| `bump` | `u8` | PDA bump |

**Derived (compute in frontend, not stored):**
- `effective_ts = clock.unix_timestamp + clock_offset`
- `backstop_ts = practical_completion_ts + dlp_days*86400 + grace_days*86400`
- `dlp_close_ts = practical_completion_ts + dlp_days*86400` (freeze filing cutoff, STRETCH)
- `claimable_now = amount − released_cumulative − aggregate_frozen`
- `is_claimable = effective_ts >= backstop_ts && claimable_now > 0`

### 2.1 `status` enum
| Value | Name | Meaning |
|---|---|---|
| 0 | `funded` | deposited, custody live |
| 1 | `cpc_released` | first moiety released via certificate |
| 2 | `disputed` | ≥1 active freeze (STRETCH) |
| 3 | `neutral_locked` | adjudicator silence; no timer resolves (STRETCH) |
| 4 | `closed` | zero residual, account closed |

### `Freeze` (STRETCH)
| Field | Type | Notes |
|---|---|---|
| `vault` | `Pubkey` | parent |
| `freeze_id` | `u32` | seed component |
| `frozen_amount` | `u64` | lamports held pending resolution |
| `freeze_reason` | `string` (≤128) | defect description |
| `freeze_ts` | `i64` | filed at (effective) |
| `freeze_bond` | `u64` | bad-faith bond staked by contractor |
| `adjudication_response_deadline` | `i64` | contractor-inaction clock |
| `resolved` | `bool` | |

---

## 3. Instructions

Each entry lists **args**, **accounts** (with signer `[s]` and mutable `[w]` markers), and the resulting state. Frontend uses these exact account orders when building transactions via the Anchor client.

### `fund_vault` — core
Contractor deposits SOL; names authorities; sets schedule/params. Vault becomes program-owned. **Split-payer:** the contractor sends the retention `amount`; a separate `rent_payer` (Verita/platform) funds the account rent, so the rent refund on close never routes to the contractor and closing needs no counterparty signature.
- **Args:** `project_id: string`, `amount: u64`, `practical_completion_ts: i64`, `dlp_days: u32`, `grace_days: u32`, `release_schedule_bps: u16`, `subcontractor: Pubkey`, `certifier: Pubkey`, `adjudicator: Pubkey`, `demo_authority: Pubkey`
- **Accounts:** `main_contractor [s,w]` (sends `amount`), `rent_payer [s,w]` (Verita; funds account rent), `vault [w] (PDA)`, `system_program`
- **Effect:** creates the PDA (rent paid by `rent_payer`), transfers `amount` lamports from the contractor in, stores `rent_payer`, `status = funded`, `released_cumulative = 0`, `clock_offset = 0`.
- **Rejects:** already-funded PDA (double-fund).

### `claim_release` — core
Sub-only, backstop-gated. Releases everything undisputed.
- **Args:** none
- **Accounts:** `subcontractor [s,w]`, `vault [w] (PDA)`, `rent_payer [w]` (receives the rent refund on auto-close; not a signer)
- **Effect:** requires `effective_ts >= backstop_ts`; transfers `claimable_now` (`amount − released_cumulative − aggregate_frozen`) from PDA to sub via `invoke_signed`; adds to `released_cumulative`; remainder rounds to sub. **If the claim fully drains the vault, the account auto-closes in the same instruction and the rent is refunded to `rent_payer` (Verita)** — no contractor and no sub close signature. **No contractor signature at any point.**
- **Rejects:** caller ≠ subcontractor; `effective_ts < backstop_ts`; nothing claimable.

### `attest_cpc` — core
Certifier releases the first moiety (normal fast path).
- **Args:** none
- **Accounts:** `certifier [s]`, `vault [w] (PDA)`, `subcontractor [w]` (receives moiety)
- **Effect:** requires `!cpc_attested`; releases `amount * release_schedule_bps / 10000` to sub; sets `cpc_attested = true`, `status = cpc_released`, updates `released_cumulative`.
- **Rejects:** caller ≠ certifier; already attested.

### `close_vault` — core
Finalize after full release. Used for the **certificate-path** completion (a fully-draining backstop `claim_release` already auto-closes — see above).
- **Args:** none
- **Accounts:** `rent_payer [w]` (Verita; rent refund), `vault [w] (PDA)`
- **Effect:** asserts residual (`amount − released_cumulative == 0` and PDA lamports == rent only); `status = closed`; closes account, **refunds rent to `rent_payer` (Verita), never the contractor**.
- **Rejects:** nonzero residual.

### `advance_clock` — core, **demo-only, feature-gated**
Operator fast-forwards effective time. Compiled only with the `demo` feature; absent in production builds.
- **Args:** `new_offset: i64` (or `add_seconds: i64` — see IDL)
- **Accounts:** `demo_authority [s]`, `vault [w] (PDA)`
- **Effect:** sets `clock_offset`; all time reads shift.
- **Rejects:** caller ≠ `demo_authority`.
- **Frontend note:** guard this view behind an operator/demo mode toggle; it must not appear in a "production" render.

### `raise_defect_claim` — STRETCH
Contractor files a capped, bonded freeze before the DLP-close cutoff.
- **Args:** `freeze_id: u32`, `frozen_amount: u64`, `freeze_reason: string`, `freeze_bond: u64`, `adjudication_response_deadline: i64`
- **Accounts:** `main_contractor [s,w]`, `vault [w] (PDA)`, `freeze [w] (PDA)`, `system_program`
- **Effect:** requires `effective_ts < dlp_close_ts`; enforces `aggregate_frozen + frozen_amount <= aggregate_freeze_cap` and `active_freeze_count < max_active_freezes`; stakes `freeze_bond`; `status = disputed`.
- **Rejects:** after cutoff; over aggregate cap; over count bound; caller ≠ contractor.

### `resolve_defect` — STRETCH
Named adjudicator splits a frozen slice.
- **Args:** `freeze_id: u32`, `valid_amount: u64` (portion upheld to contractor)
- **Accounts:** `adjudicator [s]`, `vault [w] (PDA)`, `freeze [w] (PDA)`, `main_contractor [w]`, `subcontractor [w]`
- **Effect:** upheld portion → contractor (cost of making good); remainder → sub; invalid/overstated freeze → bond slashed to sub; decrements `aggregate_frozen`/`active_freeze_count`; `status` returns to `funded`/`cpc_released` when no active freezes remain.
- **Rejects:** caller ≠ adjudicator; unknown/resolved freeze.

### (implicit) neutral-lock — STRETCH
On adjudicator silence past the response deadline the vault enters `neutral_locked`; **no timer auto-resolves to either party**. Exit only by joint signature or a higher tribunal. Frontend renders this as a terminal-until-manual state; no self-service claim button.

---

## 4. Error codes (Anchor `#[error_code]`)

Frontend maps these to user-facing messages. Names are the contract; numeric codes finalize in the real IDL.

| Name | When | Suggested UI message |
|---|---|---|
| `AlreadyFunded` | double `fund_vault` | "This vault is already funded." |
| `Unauthorized` | wrong signer for the instruction | "Your wallet isn't authorized for this action." |
| `BackstopNotReached` | `claim_release` before `backstop_ts` | "Retention isn't claimable yet — DLP hasn't expired." |
| `NothingToClaim` | `claimable_now == 0` | "Nothing left to claim." |
| `AlreadyAttested` | second `attest_cpc` | "First moiety already certified." |
| `NonzeroResidual` | `close_vault` with funds left | "Vault still holds funds; can't close." |
| `FreezeAfterCutoff` | STRETCH: file past `dlp_close_ts` | "Defect window has closed." |
| `AggregateCapExceeded` | STRETCH: over `aggregate_freeze_cap` | "Freeze exceeds the aggregate cap." |
| `TooManyFreezes` | STRETCH: over `max_active_freezes` | "Too many active freezes." |

The frontend should also handle the **absence** of `advance_clock` gracefully (production build): if the instruction isn't in the IDL, hide the Demo Control panel.

---

## 5. Read patterns for the frontend

- **Fetch a vault:** derive the PDA (§1), `program.account.retentionVault.fetch(pda)`. Compute derived fields (§2) client-side.
- **Live updates:** `connection.onAccountChange(vaultPda, ...)` to re-render balance/countdown without polling. This is the "verify it yourself, any time" value prop.
- **Balance verification:** read the PDA's lamport balance directly (`connection.getBalance(vaultPda)`) and cross-check against `amount − released_cumulative` to demonstrate custody is real.
- **Backstop countdown:** `backstop_ts − effective_ts`, refreshed on account change (so an `advance_clock` call updates the countdown live on stage).
- **Explorer links:** render every tx signature as `https://explorer.solana.com/tx/<sig>?cluster=devnet` and the vault as `.../address/<pda>?cluster=devnet`.

---

## 6. Change control

- This markdown is source of truth until BE-1 deploys and emits the real IDL. At that point: replace `tahan.idl.json` with the generated IDL, confirm program ID, and reconcile any field/type drift against this doc in the same PR.
- Core-slice shapes (§3 core instructions, §2 non-stretch fields) are **frozen** for FE-1→FE-3; changes require a note here and a heads-up to frontend.
- STRETCH shapes may adjust when BE-7/BE-8 land; FE-4 tracks those.
