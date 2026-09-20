# NEES Core Specification — Draft 0.1

## 1. Purpose

NEES defines a normative execution contract for Node.js/V8 code whose declared objective is extreme runtime efficiency.

NEES does not promise that conforming code is fast. It defines the implementation shape that MUST be used, considered, or explicitly deviated from when a subsystem is declared NEES-conforming.

Performance measurement and promotion are separate concerns.

## 2. Normative language

The words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, and MAY are normative.

Rules are tagged:

- **STABLE** — semantic/architectural.
- **NODE-STABLE** — tied to durable Node platform mechanisms.
- **V8-SENSITIVE** — depends on current V8 realization and MUST be reconsidered on relevant runtime changes.
- **EXPERIMENTAL** — useful method, not a default requirement.

A deviation from MUST/MUST NOT requires an explicit deviation record under `CONFORMANCE.md`.

## 3. Execution classes

Every NEES scope MUST declare an execution class.

### E0 — inner execution

Operations proportional to fundamental problem size or recursive/node/item count.

Examples: solver nodes, parser token loops, codec inner loops, per-element transforms.

### E1 — transition execution

Operations proportional to edges/transitions/records rather than every primitive inner step.

Examples: state transitions, hash probes, graph-edge processing, table lookups.

### E2 — decision / coordination execution

Operations at branch/frontier/claim/reconciliation/batch frequency.

Examples: branch publication, task claim, dependency reconciliation.

### E3 — task / request boundary

Operations once per task, request, batch, or bounded quantum.

Allocation and richer structures MAY be admissible if their cost is not multiplied into E0-E2.

### COLD — preparation / reporting

Initialization, configuration, diagnostics, persistence, human formatting, offline preprocessing.

A lower-frequency class MUST NOT be used to hide work that is actually proportional to a higher-frequency class.

## 4. Primary objectives

### NEES-CORE-001 — Minimize unnecessary execution structure [STABLE]

E0-E2 implementations MUST use the narrowest practical representation and mechanism that preserves required semantics.

Unnecessary structure includes work/state that:

- is not observed by the semantic consumer;
- is re-derived from information already available;
- represents generality the consumer cannot use;
- is constructed only to be immediately projected away;
- exists only because of a high-level API shape rather than the domain.

### NEES-CORE-002 — Semantics dominate optimization [STABLE]

No NEES method may weaken required correctness, safety, lifecycle, identity, ordering, restoration, or failure behavior.

### NEES-CORE-003 — Separate semantic identity from addressing/occurrence [STABLE]

Hashes, slots, object identity, process-local IDs, worker ownership, occurrence IDs, queue records, and cache locations MUST NOT be treated as semantic identity unless the domain explicitly defines them as such.

Addressing machinery MAY narrow lookup; authoritative equality remains owned by the semantic key.

## 5. Boundary discipline

### NEES-BOUND-001 — Normalize once at ingress [STABLE]

Validation, decoding, normalization, type dispatch, and representation conversion SHOULD occur at the highest boundary that can establish the invariant once.

E0-E1 code SHOULD consume already-normalized representations.

### NEES-BOUND-002 — Preserve stronger upstream facts [STABLE]

If an upstream operation proves a stronger precondition that removes downstream cases, preserve that fact long enough to specialize the downstream operation.

Do not discard exact information and then re-test/re-generalize the same condition.

### NEES-BOUND-003 — Cold failure path [STABLE]

Human-readable error construction, formatting, logging, stack enrichment, and rich diagnostics SHOULD occur after leaving successful E0-E2 execution unless those outputs are themselves required semantics.

## 6. Representation discipline

### NEES-REP-001 — Domain-appropriate width [STABLE]

Numeric/reference widths MUST cover the actual domain with explicit overflow/capacity behavior.

Do not use a wider/general representation merely for convenience when a narrower representation materially reduces runtime structure.

Do not choose a narrow type that creates accidental future limits without a capacity strategy.

### NEES-REP-002 — Stable internal representation [STABLE]

E0-E2 SHOULD avoid repeated conversion between representations.

Examples:

- object <-> numeric record;
- string <-> parsed structure;
- signed <-> unsigned Number where only bits matter;
- portable <-> process-local representation;
- structured data <-> serialized bytes.

Convert at boundaries, not repeatedly in the recurrence.

### NEES-REP-003 — Structured facts remain structured [STABLE]

A structured fact MUST NOT be serialized/materialized and then reparsed, rescanned, regex-matched, split, or re-derived in E0-E2 when the original structure can satisfy the consumer.

### NEES-REP-004 — One owner for derived facts [STABLE]

Facts derived from immutable or slowly changing state SHOULD have one construction point and many reads.

## 7. Allocation and lifetime

### NEES-ALLOC-001 — No avoidable successful-path allocation in E0 [STABLE]

E0 successful execution MUST NOT allocate dynamic aggregate state when scalar locals, caller-owned scratch, preallocated storage, or prepared immutable data can represent the same semantics.

This includes avoidable creation of Objects, Arrays, Sets, Maps, Promises, closures, buffers/views, iterators, and formatted strings.

This is not a blanket ban outside E0.

### NEES-ALLOC-002 — Prepare growth before entry [STABLE]

Storage growth, widening, rehashing, backing-store replacement, large copies, and capacity negotiation SHOULD occur before E0/E1 entry.

A sealed hot path SHOULD fail/exit to cold control rather than silently grow.

### NEES-ALLOC-003 — Reuse must have ownership [STABLE]

Scratch/reusable storage MUST have explicit ownership and lifetime.

Borrowed scratch MUST NOT survive a recursive/descendant operation that may reuse it unless copied into stable scalar/owned storage.

## 8. Complexity and repeated work

### NEES-COMP-001 — Complexity class is part of the contract [STABLE]

A rewrite MUST NOT silently worsen the asymptotic complexity of a declared hot operation.

### NEES-COMP-002 — Do not restart monotonic work [STABLE]

When processing ordered data repeatedly, carry a cursor/index or use a direct lookup. Do not restart a scan from the beginning inside a repeated consumer unless semantics require it.

### NEES-COMP-003 — Do not materialize to answer a predicate [STABLE]

If a consumer asks only existence, emptiness, cardinality class, membership, or another projection, do not construct the full collection/object/string solely to answer that projection.

## 9. Finite-domain rule

### NEES-FINITE-001 — Precompute immutable finite relations [STABLE]

When a relation is immutable, bounded, and small enough for practical prepared storage, E0-E2 SHOULD use a precomputed/indexed form rather than reconstructing the relation.

Preparation MUST validate closure/invariants needed by the hot consumer.

## 10. Control flow

### NEES-CF-001 — Simplify before general work [STABLE]

Exact terminal, forced, degenerate, empty, singleton, cached, or otherwise simplifying conditions SHOULD be consumed before operations whose result they make unnecessary.

### NEES-CF-002 — Dispatch once [STABLE]

If one discriminator determines a family of operations, read/normalize it once and route to specialized code rather than repeatedly rescanning/retesting a shared prefix or performing polymorphic deep dispatch.

## 11. Concurrency

### NEES-CONC-001 — Coordination frequency below useful-work frequency [STABLE]

E0 execution MUST NOT require synchronous cross-thread coordination merely to progress ordinary local computation.

Shared coordination SHOULD occur at an amortized boundary whose cost is small relative to the work it controls.

### NEES-CONC-002 — Visibility and execution are distinct [STABLE]

Making a dependency globally visible MUST NOT imply immediate execution.

### NEES-CONC-003 — Minimize contention structure [STABLE]

A lock-free/atomic implementation is not sufficient by itself. Shared writes, false sharing, global counters, cache-line ping-pong, and retry loops are execution structure and SHOULD be minimized.

## 12. JIT/runtime stability

### NEES-JIT-001 — Specialization-friendly hot operations [V8-SENSITIVE]

E0-E1 functions SHOULD receive stable types, stable object shapes where objects are required, stable return classes, and bounded dispatch diversity.

Type/shape dispatch SHOULD occur at a boundary where practical.

### NEES-JIT-002 — Runtime generalization is a risk [V8-SENSITIVE]

A change introducing polymorphism, megamorphism, dictionary-like object behavior, element-kind degradation, boxing, closure/context allocation, or deoptimization into E0-E2 MUST be treated as a performance-risk change.

## 13. Native escape

### NEES-NATIVE-001 — Use the layer with least total structure [NODE-STABLE]

Preferred decision order:

1. direct optimized JS/V8 primitive;
2. prepared Buffer/TypedArray/native-backed builtin;
3. WebAssembly where favorable;
4. Node/V8 fast native mechanism;
5. N-API/C++/other native implementation.

A native crossing SHOULD NOT be introduced when crossing/marshalling costs more than the work removed. Batch or move the boundary when necessary.

## 14. Diagnostics

### NEES-DIAG-001 — Hot diagnostics are compact [STABLE]

E0-E2 instrumentation SHOULD accumulate bounded numeric counters/indices/timestamps only.

Formatting, serialization, logging, symbol expansion, and rich snapshots SHOULD be cold.

Instrumentation MUST NOT silently change the algorithmic shape under evaluation.

## 15. Method selection

When this specification says SHOULD, the default implementation is the corresponding recipe in `NODE_V8_METHODS.md`.

A different method MAY be used when semantics require it, the default does not apply, runtime-version evidence invalidates it, or another method has less total execution structure.

The reason MUST be explicit for E0/E1 deviations.
