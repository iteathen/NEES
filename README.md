# NEES — Node Extreme Execution Standard

**Status:** Draft 0.5 — active research draft  
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
4. Use [COST_ACCOUNTING.md](COST_ACCOUNTING.md) when quantifying hot-path operations and function cycle ledgers.
5. Read [STALE_ADVICE.md](STALE_ADVICE.md) before relying on remembered JavaScript/V8 performance rules.
6. Use [CONFORMANCE.md](CONFORMANCE.md) for scope declarations, evidence, deviations, and review.
7. Use [AGENT_USAGE.md](AGENT_USAGE.md) when directing coding agents.
8. Consult [REFERENCES.md](REFERENCES.md) for the research/source map.

The Draft 0.2 runtime-grounding reassessment is preserved at [research/2026-09-20-runtime-grounding.md](research/2026-09-20-runtime-grounding.md). Draft 0.3's maximal-effort rationale is preserved at [research/2026-09-20-maximal-effort-doctrine.md](research/2026-09-20-maximal-effort-doctrine.md). Draft 0.4's causal-boundary reassessment is preserved at [research/2026-09-20-causal-optimization-units.md](research/2026-09-20-causal-optimization-units.md).

## Governing idea

For a declared hot path, minimize the complete execution structure between required semantics and machine realization:

```text
semantic requirement
    -> identify governing optimization unit and causal role
    -> remove unnecessary semantic/general structure
    -> choose the narrowest useful representation
    -> prepare reusable/finite structure
    -> preserve useful runtime/JIT feedback
    -> minimize allocation, conversion, data movement and coordination
    -> use the best admitted JS/builtin/native realization
    -> quantify modeled operations/cycles under the selected profile when useful
    -> machine execution
```

A richer representation or mechanism is acceptable when it carries independently required semantics or when a narrower realization is unavailable, unsafe, or demonstrably worse.

## Stable invariants vs runtime methods

NEES deliberately separates four layers:

1. **Stable execution invariants** — semantic and architectural constraints intended to survive Node/V8 releases.
2. **Realization methods** — prescriptive Node/V8 techniques with admission conditions and falsifiers.
3. **Runtime profiles** — concrete, versioned facts such as Worker transport behavior, Buffer pooling, FFI stability, and current V8 architecture.
4. **Execution cost profiles** — versioned CPU/runtime operation costs and composable cycle models used by [COST_ACCOUNTING.md](COST_ACCOUNTING.md).

That separation is a core feature. NEES is intended to be strict without fossilizing stale V8 folklore.

## What NEES-EXTREME means

NEES-EXTREME is a **maximal-effort machine-cost discipline**.

After semantics and load-bearing constraints are fixed, the goal is to minimize total realizable machine cost across the hot execution: computation, critical-path dependency depth, memory traffic, cache/TLB behavior, branches, allocation/GC, boxing/conversion, runtime dispatch, synchronization/coherence, transport, and boundary crossing.

A small candidate E0/E1 cost remains entitled to investigation and honest disposition. A larger bottleneck normally gets attention first, but "not the bottleneck", "too small to matter", and "already fast enough" do not erase the smaller candidate.

Draft 0.5 retains Draft 0.4's **candidate cost** from **known avoidable cost**. A locally cheaper implementation does not prove that the current local cost is avoidable if that cost enables or is coupled to a larger optimization. NEES therefore evaluates performance at the smallest enclosing causal boundary that owns the benefit and protects superior composite realizations from locally greedy rewrites.

NEES-EXTREME therefore has no "fast enough" stopping condition. Work stops because no further justified improvement is presently known, the remaining structure is required/unavoidable, alternatives have been costed out, a structural successor supersedes the local target, or unresolved work is explicitly retained as optimization debt/deviation.

This is **not** a claim that global optimality has been mathematically proved. It is a requirement that known and reasonably discoverable hot-path costs are not silently ignored.

The first NEES-EXTREME adoption of a scope performs a complete E0-E2 baseline cost audit. Later PRs inherit that debt/disposition record and re-audit only the affected causal neighborhood and any invalidated assumptions.

## What NEES-EXTREME does not mean

It does not mean:

- ban every Object, String, Map, Set, Array, Promise, or builtin;
- make every call site monomorphic;
- replace every loop with a counted loop;
- use TypedArrays everywhere;
- pool every allocation;
- use native code, WebAssembly, or FFI whenever possible;
- write branchless source code;
- apply every NEES method that appears syntactically relevant;
- make every component locally fastest at the expense of a superior composite optimization.

It means that E0/E1 implementation decisions are explicit: the agent names the semantic boundary, execution mechanism, admission condition, falsifier, ownership/lifetime behavior, runtime assumptions, machine-cost effect, and any remaining optimization debt.

## Current reference profile

Draft 0.5 currently uses one reference realization profile:

- **Node 26 / V8 14.6 family** — [RUNTIME_PROFILE_NODE26.md](RUNTIME_PROFILE_NODE26.md)

Projects SHOULD record the exact `process.version`, `process.versions.v8`, OS, and architecture when realization-sensitive behavior is load-bearing.

Additional profiles can be added without weakening the stable core.

## Qualification cadence

NEES is designed to support aggressive coherent optimization without turning development into a benchmark after every edit.

The default qualification unit is a completed coherent pull request or equivalent change set. During development, agents reuse inherited runtime/method evidence and run targeted checks only when the result can change the next implementation decision or protect a required correctness invariant.

Full correctness, conformance, structural, runtime/JIT, and performance qualification is performed at the promotion boundary as applicable. Performance claims are evaluated at the governing optimization unit, with local counters and microbenchmarks used as explanatory evidence rather than automatic authority over a contradictory enclosing result.

## Automated checks

The `verify` check runs on pull requests and pushes to main and release branches.

Run:

```sh
node tools/verify-repository.mjs
```

locally to check required documents, UTF-8, merge markers, JSON and JavaScript syntax, relative Markdown file links, and the deterministic cost-accounting fixture.

These are document-integrity checks, not certification of NEES conformance or performance.
