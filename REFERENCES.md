# NEES Draft 0.1 — Inspiration and Source Map

NEES Draft 0.1 synthesizes ideas from several existing bodies of work. None is authority for the entire standard.

## Jess — V8 Architecture Invariants

Repository: `jesscss/jess`

Important artifacts:

- `docs/perf/V8-ARCHITECTURE.md`
- `.cursor/skills/perf-architecture/SKILL.md`
- `.cursor/agents/perf-architecture-reviewer.md`
- `docs/architecture/llm-quality-enforcement-design.md`

Key inspiration:

- canonical tool-neutral performance invariants;
- rules grounded in actual incidents;
- explicit runtime mechanisms behind rules;
- evidence-per-rule review rather than bare verdicts;
- deterministic structural detectors where possible;
- hot compiler paths judged differently from ordinary application JavaScript.

NEES generalizes beyond Jess/compiler-specific invariants.

## Vercel / Next.js — V8 JIT agent guidance

Repository: `vercel/next.js`

Artifact:

- `.agents/skills/v8-jit/SKILL.md`

Key inspiration:

- current tiered V8 compilation context;
- hidden-class stability;
- monomorphic call sites;
- allocation/closure discipline;
- packed array/element-kind awareness;
- boundary specialization;
- practical optimization/deoptimization inspection.

NEES turns these into execution-class-dependent methods.

## Node.js core

Repository: `nodejs/node`

Key inspiration from core patterns:

- explicit fast/slow paths;
- repeated-allocation removal;
- simple loops in sensitive code;
- bit-packed state;
- lazy/need-gated work;
- native/buffer implementations for byte-heavy primitives;
- V8 Fast API mechanisms;
- cache-line-aware native layouts;
- avoidance of repeated system/runtime queries on hot paths.

Node core is implementation evidence, not one single written extreme-performance standard.

## Agent-oriented Node core guides

Repositories:

- `jazelly/nodejs-core-skills`
- `mcollina/skills`

Key inspiration:

- packaging Node/V8 implementation knowledge into agent-readable rules;
- connecting V8 JIT/GC, libuv, worker threads, SharedArrayBuffer/Atomics, native addons, and profiling;
- benchmark-backed Node-core implementation lessons.

## Normative vocabulary

NEES uses conventional uppercase normative terms (MUST, MUST NOT, SHOULD, SHOULD NOT, MAY) to distinguish requirements from explanation.

## What NEES adds

The missing synthesis targeted by NEES is:

```text
strict execution classes
+ precise low-level Node/V8 methods
+ stable vs revision-sensitive rule separation
+ agent implementation workflow
+ deviations
+ concurrency/shared-memory rules
+ native escape decision ladder
+ representation/allocation/derived-information discipline
```

It is intended for solvers, parsers, runtimes, schedulers, codecs, databases, protocol engines, and other compute-intensive Node systems.
