/**
 * Tahan program IDL — Anchor 0.30+ format.
 *
 * SOURCE OF TRUTH: specs/tahan.idl.json (legacy Anchor IDL format) + specs/API-CONTRACT-retention.md.
 * This file is a mechanical transcription of the stub IDL into the modern Anchor IDL shape
 * (top-level `address`, per-instruction/account `discriminator` sighashes, `writable`/`signer`
 * flags, `pubkey` type name) so it works with `@coral-xyz/anchor@0.30`'s `Program` class.
 *
 * Discriminators are computed the standard Anchor way: first 8 bytes of
 * sha256("global:<snake_case_ix_name>") for instructions and
 * sha256("account:<PascalCaseAccountName>") for accounts.
 *
 * DO NOT hand-edit fields/instructions here without updating specs/tahan.idl.json first —
 * per API-CONTRACT-retention.md §6, the markdown + stub IDL are the frozen source of truth
 * until BE-1 emits the real IDL from `anchor build`.
 */
export const TAHAN_IDL = {
  // NOTE: specs/tahan.idl.json ships "Tahan1111111111111111111111111111111111111"
  // as its placeholder address, but that string is 42 base58 chars, not a
  // decodable 32-byte public key (`new PublicKey(...)` throws). Since a
  // valid PublicKey is required at module load, this is swapped for a
  // throwaway generated placeholder until BE-1 emits the real deployed
  // program ID. Flag this back to the spec: the stub's placeholder address
  // is not a valid base58 pubkey.
  address: "7V2MQqwDBM4CvgqEr9bPgSrqE4ZBqR4CAJdwMhZo2UMM",
  metadata: {
    name: "tahan",
    version: "0.1.0",
    spec: "0.1.0",
    description:
      "STUB IDL — hand-transcribed to match API-CONTRACT-retention.md so the frontend can wire the Anchor TS client on day one. Replace with the IDL emitted by `anchor build` when BE-1 deploys. address is a placeholder until deploy.",
  },
  instructions: [
    {
      name: "fund_vault",
      docs: [
        "CORE. Contractor deposits SOL and names authorities. Vault becomes program-owned.",
      ],
      discriminator: [26, 33, 207, 242, 119, 108, 134, 73],
      accounts: [
        { name: "main_contractor", writable: true, signer: true },
        { name: "rent_payer", writable: true, signer: true },
        { name: "vault", writable: true, signer: false },
        { name: "system_program", writable: false, signer: false },
      ],
      args: [
        { name: "project_id", type: "string" },
        { name: "amount", type: "u64" },
        { name: "practical_completion_ts", type: "i64" },
        { name: "dlp_days", type: "u32" },
        { name: "grace_days", type: "u32" },
        { name: "release_schedule_bps", type: "u16" },
        { name: "subcontractor", type: "pubkey" },
        { name: "certifier", type: "pubkey" },
        { name: "adjudicator", type: "pubkey" },
        { name: "demo_authority", type: "pubkey" },
      ],
    },
    {
      name: "claim_release",
      docs: [
        "CORE. Sub-only, backstop-gated. Releases everything undisputed. On full drain, auto-closes and refunds rent to rent_payer. No contractor signature.",
      ],
      discriminator: [32, 49, 104, 71, 174, 25, 58, 118],
      accounts: [
        { name: "subcontractor", writable: true, signer: true },
        { name: "vault", writable: true, signer: false },
        { name: "rent_payer", writable: true, signer: false },
      ],
      args: [],
    },
    {
      name: "attest_cpc",
      docs: ["CORE. Certifier releases the first moiety (normal fast path)."],
      discriminator: [157, 253, 153, 142, 191, 227, 225, 105],
      accounts: [
        { name: "certifier", writable: false, signer: true },
        { name: "vault", writable: true, signer: false },
        { name: "subcontractor", writable: true, signer: false },
      ],
      args: [],
    },
    {
      name: "close_vault",
      docs: [
        "CORE. Certificate-path completion; asserts zero residual; refunds rent to rent_payer (Verita), never the contractor. A fully-draining claim_release auto-closes instead.",
      ],
      discriminator: [141, 103, 17, 126, 72, 75, 29, 29],
      accounts: [
        { name: "rent_payer", writable: true, signer: false },
        { name: "vault", writable: true, signer: false },
      ],
      args: [],
    },
    {
      name: "advance_clock",
      docs: [
        "CORE, DEMO-ONLY, FEATURE-GATED. Operator sets clock_offset. Absent in production builds; frontend must hide Demo Control if this instruction is missing from the IDL.",
      ],
      discriminator: [52, 57, 147, 111, 56, 227, 33, 127],
      accounts: [
        { name: "demo_authority", writable: false, signer: true },
        { name: "vault", writable: true, signer: false },
      ],
      args: [{ name: "new_offset", type: "i64" }],
    },
    {
      name: "raise_defect_claim",
      docs: [
        "STRETCH. Contractor files a capped, bonded freeze before the DLP-close cutoff.",
      ],
      discriminator: [143, 18, 46, 181, 168, 188, 194, 21],
      accounts: [
        { name: "main_contractor", writable: true, signer: true },
        { name: "vault", writable: true, signer: false },
        { name: "freeze", writable: true, signer: false },
        { name: "system_program", writable: false, signer: false },
      ],
      args: [
        { name: "freeze_id", type: "u32" },
        { name: "frozen_amount", type: "u64" },
        { name: "freeze_reason", type: "string" },
        { name: "freeze_bond", type: "u64" },
        { name: "adjudication_response_deadline", type: "i64" },
      ],
    },
    {
      name: "resolve_defect",
      docs: [
        "STRETCH. Named adjudicator splits a frozen slice; invalid freeze slashes the bond to the sub.",
      ],
      discriminator: [183, 52, 108, 28, 204, 142, 201, 58],
      accounts: [
        { name: "adjudicator", writable: false, signer: true },
        { name: "vault", writable: true, signer: false },
        { name: "freeze", writable: true, signer: false },
        { name: "main_contractor", writable: true, signer: false },
        { name: "subcontractor", writable: true, signer: false },
      ],
      args: [
        { name: "freeze_id", type: "u32" },
        { name: "valid_amount", type: "u64" },
      ],
    },
  ],
  accounts: [
    {
      name: "RetentionVault",
      discriminator: [140, 47, 175, 233, 108, 17, 177, 154],
    },
    {
      name: "Freeze",
      discriminator: [228, 234, 96, 188, 227, 214, 87, 178],
    },
  ],
  types: [
    {
      name: "RetentionVault",
      type: {
        kind: "struct" as const,
        fields: [
          { name: "main_contractor", type: "pubkey" },
          { name: "subcontractor", type: "pubkey" },
          { name: "certifier", type: "pubkey" },
          { name: "adjudicator", type: "pubkey" },
          { name: "demo_authority", type: "pubkey" },
          { name: "rent_payer", type: "pubkey" },
          { name: "mint", type: "pubkey" },
          { name: "project_id", type: "string" },
          { name: "amount", type: "u64" },
          { name: "released_cumulative", type: "u64" },
          { name: "practical_completion_ts", type: "i64" },
          { name: "dlp_days", type: "u32" },
          { name: "grace_days", type: "u32" },
          { name: "release_schedule_bps", type: "u16" },
          { name: "cpc_attested", type: "bool" },
          { name: "aggregate_frozen", type: "u64" },
          { name: "active_freeze_count", type: "u16" },
          { name: "aggregate_freeze_cap", type: "u64" },
          { name: "max_active_freezes", type: "u16" },
          { name: "clock_offset", type: "i64" },
          { name: "status", type: { defined: { name: "VaultStatus" } } },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "Freeze",
      docs: ["STRETCH."],
      type: {
        kind: "struct" as const,
        fields: [
          { name: "vault", type: "pubkey" },
          { name: "freeze_id", type: "u32" },
          { name: "frozen_amount", type: "u64" },
          { name: "freeze_reason", type: "string" },
          { name: "freeze_ts", type: "i64" },
          { name: "freeze_bond", type: "u64" },
          { name: "adjudication_response_deadline", type: "i64" },
          { name: "resolved", type: "bool" },
        ],
      },
    },
    {
      name: "VaultStatus",
      type: {
        kind: "enum" as const,
        variants: [
          { name: "Funded" },
          { name: "CpcReleased" },
          { name: "Disputed" },
          { name: "NeutralLocked" },
          { name: "Closed" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "AlreadyFunded", msg: "This vault is already funded." },
    {
      code: 6001,
      name: "Unauthorized",
      msg: "Your wallet isn't authorized for this action.",
    },
    {
      code: 6002,
      name: "BackstopNotReached",
      msg: "Retention isn't claimable yet — DLP hasn't expired.",
    },
    { code: 6003, name: "NothingToClaim", msg: "Nothing left to claim." },
    {
      code: 6004,
      name: "AlreadyAttested",
      msg: "First moiety already certified.",
    },
    {
      code: 6005,
      name: "NonzeroResidual",
      msg: "Vault still holds funds; can't close.",
    },
    {
      code: 6006,
      name: "FreezeAfterCutoff",
      msg: "Defect window has closed.",
    },
    {
      code: 6007,
      name: "AggregateCapExceeded",
      msg: "Freeze exceeds the aggregate cap.",
    },
    {
      code: 6008,
      name: "TooManyFreezes",
      msg: "Too many active freezes.",
    },
  ],
} as const;

export type TahanIdl = typeof TAHAN_IDL;
