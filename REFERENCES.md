# NEES Draft 0.2 — Research and Source Map

NEES separates **primary runtime authorities**, **current production evidence**, and **secondary guidance**. No single source is treated as authority for the whole standard.

## 1. Primary Node.js sources

### Node.js 26

- [Node.js 26.0.0 release](https://nodejs.org/en/blog/release/v26.0.0) — Node 26 introduced V8 14.6 family.
- [Node.js release index](https://nodejs.org/en/blog/release) — current release tracking.

### Worker threads and transport

- [Worker threads](https://nodejs.org/api/worker_threads.html) — CPU-worker guidance, pool recommendation, SharedArrayBuffer, transfer/clone semantics, Buffer transfer hazards.
- [Asynchronous context tracking](https://nodejs.org/api/async_context.html) — AsyncResource and worker-pool diagnostic correlation.

### Buffers and process diagnostics

- [Buffer](https://nodejs.org/api/buffer.html) — current pool behavior, allocUnsafe semantics, alignment.
- [Process](https://nodejs.org/api/process.html) — memoryUsage cost and faster RSS-only route.

### Native interfaces

- [Node-API](https://nodejs.org/api/n-api.html) — stable ABI addon interface.
- [C++ addons](https://nodejs.org/api/addons.html) — addon choices and direct V8/libuv coupling.
- [Adding V8 Fast API callbacks](https://github.com/nodejs/node/blob/main/doc/contributing/adding-v8-fast-api.md) — fast/slow path signatures and qualification.
- [FFI](https://nodejs.org/api/ffi.html) — experimental unsafe Node FFI, pointer/marshalling/fast trampoline constraints.
- [Permissions](https://nodejs.org/api/permissions.html) — Worker/addon/WASI/FFI capability restrictions.

## 2. Primary V8 sources

- [Maglev](https://v8.dev/blog/maglev) — current mid-tier optimizing architecture and representation specialization.
- [Leaving the Sea of Nodes](https://v8.dev/blog/leaving-the-sea-of-nodes) — 2025 compiler-architecture transition to Turboshaft/Maglev-based pipeline pieces.
- [Fast properties](https://v8.dev/blog/fast-properties) — hidden classes/maps and property storage.
- [Elements kinds](https://v8.dev/blog/elements-kinds) — array representations, holes, out-of-bounds effects, updated fill exception.
- [Mutable heap numbers](https://v8.dev/blog/mutable-heap-number) — current evidence that numeric representation optimization continues to evolve.
- [Trash talk: Orinoco](https://v8.dev/blog/trash-talk) — generational GC, young-object lifetime economics.

These sources demonstrate why NEES keeps V8 tactics version-sensitive rather than turning historic behavior into permanent law.

## 3. Language memory model

- [ECMAScript memory model](https://tc39.es/ecma262/multipage/memory-model.html) — SharedArrayBuffer and Atomics correctness foundation.

NEES concurrency methods do not invent a separate memory model.

## 4. Production/project evidence

### Jess — V8 architecture invariants

Repository: [jesscss/jess](https://github.com/jesscss/jess)

Important artifacts:

- `docs/perf/V8-ARCHITECTURE.md`
- `.cursor/skills/perf-architecture/SKILL.md`
- `.cursor/agents/perf-architecture-reviewer.md`
- `docs/architecture/llm-quality-enforcement-design.md`

Key contributions to NEES:

- canonical tool-neutral invariants;
- rule + mechanism + incident + detector structure;
- evidence-per-rule review;
- deterministic structural detectors;
- incident-to-detector learning loop.

### Piscina — worker pool economics

Repository: [piscinajs/piscina](https://github.com/piscinajs/piscina)

Useful evidence:

- worker reuse;
- queue pressure/backpressure;
- Atomics communication;
- workload-dependent queue/thread tuning;
- fixed queue implementations.

Piscina is evidence against universal queue-size/thread-count formulas.

### MySQL2 — 2026 Node/V8 performance campaign

Repository: [sidorares/node-mysql2](https://github.com/sidorares/node-mysql2)

Artifact:

- `benchmarks/perf/ANALYSIS.md`

Important positive findings:

- exact-size/single-pass packet construction can eliminate repeated serialization/encoding;
- integer hash + exact metadata verification can replace expensive materialized cache keys;
- narrowly admitted short-input specialization can beat a generic builtin;
- caller-level routing can avoid bloating the generic path.

Important negative findings:

- classic manual UTF-8 loops did not generally beat modern Buffer decoding;
- local-variable rewrites did not beat a field access V8 already kept efficiently;
- custom Buffer pooling was not automatically worthwhile;
- WASM was not useful when JS object/string materialization dominated;
- adding a branch inside a generic decode path could regress other inputs through code-size/inlining effects.

NEES uses these as falsifiers for generic folklore, not as universal numeric benchmarks.

### Ajv and fast-json-stringify — compile once, execute many

- [Ajv](https://github.com/ajv-validator/ajv)
- [fast-json-stringify](https://github.com/fastify/fast-json-stringify)

Both demonstrate the structural value of compiling stable schema information into specialized repeated execution.

They also show the limits: compilation cost, code size, trust of generated input, and payload/workload shape matter.

## 5. Maintained secondary guidance

### Semantic-Next V8 performance knowledge base

Repository: [Semantic-Org/Semantic-Next](https://github.com/Semantic-Org/Semantic-Next)

Relevant modules:

- `performance-v8-overview.md`
- `performance-v8-stale-advice.md`
- `performance-v8-uncertain-topics.md`
- `performance-v8-object-model.md`
- `performance-v8-compilation.md`
- `performance-v8-memory.md`
- `performance-v8-strings.md`

Its most important contribution is methodological: explicitly date V8 claims and maintain a stale-advice firewall.

NEES verifies load-bearing claims against primary sources rather than treating this secondary index as authority.

### Next.js V8 JIT agent skill

Repository: [vercel/next.js](https://github.com/vercel/next.js)

Artifact:

- `.agents/skills/v8-jit/SKILL.md`

Useful for hidden-class, feedback, allocation, array, and V8 diagnostic patterns. NEES 0.2 narrows several of its categorical suggestions using newer/current primary evidence.

### Node-core agent guides

Repositories:

- [jazelly/nodejs-core-skills](https://github.com/jazelly/nodejs-core-skills)
- [mcollina/skills](https://github.com/mcollina/skills)

Useful for packaging Node/V8 implementation knowledge into agent-consumable form.

## 6. Normative vocabulary

NEES uses conventional uppercase requirement terms (MUST, MUST NOT, SHOULD, SHOULD NOT, MAY) to distinguish requirements from explanation.

The words are used in the style of BCP 14, but NEES is not an IETF specification.

## 7. What NEES adds

The synthesis targeted by NEES is:

```text
stable execution invariants
+ explicit execution-frequency classes
+ detailed Node/V8 recipes
+ admission conditions and falsifiers
+ pinned runtime profiles
+ stale-advice firewall
+ semantic vs addressing identity
+ allocation/lifetime discipline
+ concurrency/shared-memory discipline
+ native/FFI decision contracts
+ agent implementation workflow
+ deviations and evidence hierarchy
+ incident-to-detector learning
```

It is intended to be useful for solvers, parsers, runtimes, schedulers, codecs, databases, protocol engines, serializers, validators, and other compute-intensive Node systems.
