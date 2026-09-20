# NEES Draft 0.2 Runtime-Grounding Reassessment

**Date:** 2026-09-20  
**Starting authority:** Draft 0.1 at `main@0a8b1df564f036d2bf0e29fbc1cbef4201458061`  
**Purpose:** adversarially reassess whether Draft 0.1 communicates extreme-performance implementation intent without freezing stale V8 folklore into a standard.

## 1. Overall assessment

Draft 0.1 has the correct abstraction boundary: it treats performance as an execution/representation contract rather than a style guide or benchmark rubric.

Its strongest parts survive:

- execution classes;
- semantic identity vs addressing/occurrence;
- preserve stronger upstream facts;
- avoid repeated derivation/materialization;
- complexity-class preservation;
- explicit ownership/lifetime;
- visibility distinct from execution;
- minimize coordination;
- version-sensitive method labeling;
- evidence-based agent review.

The principal defect is **over-generalization at the realization layer**.

Several methods were written as if a historically useful V8 technique were a default law. Modern V8 and current Node core provide enough counterexamples that this would cause agents to "optimize" already-good code or replace optimized builtins with worse hand-written machinery.

Draft 0.2 therefore keeps the strict goals and makes the method layer more exact.

## 2. Research basis

The pass prioritized current primary sources:

- Node.js 26 current documentation and release notes;
- Node.js core source and contributor guidance;
- V8 architecture, object representation, elements-kind, GC, and Maglev documentation;
- ECMAScript SharedArrayBuffer memory model.

It then used current production projects as falsifiers/counterexamples:

- Jess V8 architecture invariants;
- Next.js V8 JIT skill;
- Piscina worker-pool implementation/guidance;
- MySQL2 2026 performance analysis;
- Ajv and fast-json-stringify compiled-specialization designs;
- Semantic-Next's maintained stale-V8-advice index as a secondary research map.

## 3. Findings that changed the draft

### F-001 — Monomorphism was overstated

Modern V8's optimizing tiers can handle bounded stable polymorphism. The dangerous class is uncontrolled/late-growing feedback, megamorphic hot sites, and representation churn.

**Change:** JIT rule becomes "stable, bounded feedback", not "monomorphic everywhere".

### F-002 — Counted-loop advice was too syntactic

Current V8 has optimized Array iteration paths. Node core's explicit-loop choices often remove a real allocation/callback or avoid user-mutable iterator semantics; those reasons are valid, but "for is always faster" is not.

**Change:** iteration method now requires naming the work being removed.

### F-003 — Allocation and pooling were conflated

V8's generational collector is optimized for short-lived objects. Eliminating E0 product garbage remains valuable, but pooling can extend lifetimes and increase retention/reset/aliasing costs.

**Change:** zero avoidable E0 allocation remains; generic object pooling is no longer implied.

### F-004 — Builtins must be treated as optimized primitives until disproven

Node/V8 builtins change over time. Current Node core and MySQL2 evidence show cases where manual JS byte/string work does not beat builtins.

**Change:** new builtin-first admission rule.

### F-005 — Numeric representation advice needs tighter profile scoping

Draft 0.1's 32-bit carrier method encoded a useful observed pattern too generally. V8 continues to improve Int32/HeapNumber handling, including recent mutable Int32 work.

**Change:** numeric method now preserves semantic width/type stability and requires target evidence for signedness/boxing tricks.

### F-006 — Worker transport needs ownership semantics, not "use typed arrays"

Node distinguishes SharedArrayBuffer sharing, ArrayBuffer transfer, and structured clone. Pooled Buffers may be non-transferable and cloning may copy the whole pool.

**Change:** transport method requires explicit `shared | transferred | cloned | copied` ownership classification.

### F-007 — Native is now a family of different contracts

Current Node has:

- stable Node-API;
- version-coupled direct V8/Node internals;
- Node-core V8 Fast API mechanisms;
- experimental unsafe `node:ffi` with architecture-specific fast-call constraints.

**Change:** the old native preference ladder is replaced by a decision matrix and separate methods.

### F-008 — Exact sizing is a reusable structural optimization

Current MySQL2 work demonstrated a large win by eliminating dry-run serialization/repeated encoding when exact wire size was already derivable.

**Change:** exact-length single-pass construction promoted to stable method.

### F-009 — Code generation deserves first-class treatment

Ajv, fast-json-stringify, MySQL2 and parser/compiler projects repeatedly show that stable schema/structure can be compiled once into specialized repeated execution.

**Change:** new prepared-code specialization method with amortization, code-size, trust, and fallback admission rules.

### F-010 — Runtime introspection can become the hot path

Node explicitly documents full `process.memoryUsage()` as potentially slow because it iterates process pages; `memoryUsage.rss()` has a faster route.

**Change:** diagnostics/introspection method becomes concrete in the Node 26 profile.

### F-011 — Performance reasons must be separated from security/semantic reasons

Node core sometimes avoids a JS feature because user-mutable builtins/iterators violate primordial/tamper-resistance requirements, not because the syntax itself is slower.

**Change:** conformance review now records the mechanism class instead of translating every Node-core pattern into generic V8 advice.

## 4. Negative results / rejected generalizations

The research specifically rejects these as NEES core laws:

- all hot calls must be monomorphic;
- try/catch makes a function unoptimizable;
- counted for loops are universally faster;
- TypedArray is universally faster than Array;
- `new Array(n)` is a universal preallocation optimization;
- object pooling is always better than allocation;
- null-prototype objects are faster dictionaries;
- native/WASM/FFI is inherently faster;
- custom Buffer pools are automatically better than Node's allocator;
- branchless source code is inherently faster;
- no strings/objects/Maps/Sets/Promises is a universal NEES rule.

A project can still impose stricter local constraints when its semantic domain admits them.

## 5. Governing revision principle

Draft 0.2 adopts this split:

```text
Stable NEES invariant:
    strict and normative

Node/V8 method:
    prescriptive, but with admission conditions

Runtime profile:
    concrete current facts

Stale-advice firewall:
    known non-rules and counterexamples

Project-local profile:
    may be stricter when domain and evidence justify it
```

This is intended to make NEES stricter where strictness is valid and less dogmatic where the engine is allowed to evolve.
