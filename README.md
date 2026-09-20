# NEES — Node Extreme Execution Standard

**Status:** Draft 0.2 — active research draft  
**Scope:** Node.js / V8 extreme-performance implementation intent  
**Authority:** experimental; projects opt in explicitly  
**Measurement policy:** performance qualification is separate from conformance

NEES exists to communicate *how* extreme-performance Node/V8 code is expected to be built.

It is not a JavaScript style guide, a benchmark standard, or a list of vague performance aspirations. Its purpose is to let a project owner write:

> This subsystem conforms to NEES-EXTREME under the Node 26 / V8 14.6 profile. E0 is the solver recurrence; E2 is work publication/claim.

and give a human or coding agent a precise implementation contract for representation, allocation/lifetime, derivation, control flow, JIT assumptions, concurrency, worker transport, native boundaries, diagnostics, and deviations.

## Start here

1. Read [SPEC.md](SPEC.md) for the stable normative contract and execution classes.
2. Read [NODE_V8_METHODS.md](NODE_V8_METHODS.md) for detailed realization recipes.
3. Select a runtime profile; the current reference is [RUNTIME_PROFILE_NODE26.md](RUNTIME_PROFILE_NODE26.md).
4. Read [STALE_ADVICE.md](STALE_ADVICE.md) before relying on remembered JavaScript/V8 performance rules.
5. Use [CONFORMANCE.md](CONFORMANCE.md) for scope declarations, evidence, deviations, and review.
6. Use [AGENT_USAGE.md](AGENT_USAGE.md) when directing coding agents.
7. Consult [REFERENCES.md](REFERENCES.md) for the research/source map.

The Draft 0.2 research reassessment is preserved at [research/2026-09-20-runtime-grounding.md](research/2026-09-20-runtime-grounding.md).

## Governing idea

For a declared hot path, minimize the complete execution structure between required semantics and machine realization:

```text
semantic requirement
    -> remove unnecessary semantic/general structure
    -> choose the narrowest useful representation
    -> prepare reusable/finite structure
    -> preserve useful runtime/JIT feedback
    -> minimize allocation, conversion, data movement and coordination
    -> use the best admitted JS/builtin/native realization
    -> machine execution
```

A richer representation or mechanism is acceptable when it carries independently required semantics or when a narrower realization is unavailable, unsafe, or demonstrably worse.

## Stable invariants vs runtime methods

NEES deliberately separates three layers:

1. **Stable execution invariants** — semantic and architectural constraints intended to survive Node/V8 releases.
2. **Realization methods** — prescriptive Node/V8 techniques with admission conditions and falsifiers.
3. **Runtime profiles** — concrete, versioned facts such as Worker transport behavior, Buffer pooling, FFI stability, and current V8 architecture.

That separation is a core feature. NEES is intended to be strict without fossilizing stale V8 folklore.

## What NEES-EXTREME does not mean

It does not mean:

- ban every Object, String, Map, Set, Array, Promise, or builtin;
- make every call site monomorphic;
- replace every loop with a counted loop;
- use TypedArrays everywhere;
- pool every allocation;
- use native code, WebAssembly, or FFI whenever possible;
- write branchless source code.

It means that E0/E1 implementation decisions are explicit: the agent names the semantic boundary, execution mechanism, admission condition, falsifier, ownership/lifetime behavior, and runtime assumptions.

## Current reference profile

Draft 0.2 currently ships one reference realization profile:

- **Node 26 / V8 14.6 family** — [RUNTIME_PROFILE_NODE26.md](RUNTIME_PROFILE_NODE26.md)

Projects SHOULD record the exact `process.version`, `process.versions.v8`, OS, and architecture when realization-sensitive behavior is load-bearing.

Additional profiles can be added without weakening the stable core.

## Qualification cadence

NEES is designed to support aggressive coherent optimization without turning development into a benchmark after every edit.

The default qualification unit is a completed coherent pull request or equivalent change set. During development, agents reuse inherited runtime/method evidence and run targeted checks only when the result can change the next implementation decision or protect a required correctness invariant.

Full correctness, conformance, structural, runtime/JIT, and performance qualification is performed at the promotion boundary as applicable.

## Automated checks

The `verify` check runs on pull requests and pushes to main and release branches.

Run:

```sh
node tools/verify-repository.mjs
```

locally to check required documents, UTF-8, merge markers, JSON and JavaScript syntax, and relative Markdown file links.

These are document-integrity checks, not certification of NEES conformance or performance.
