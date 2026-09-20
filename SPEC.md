# NEES Core Specification — Draft 0.3

## 1. Purpose

NEES defines a normative execution contract for Node.js/V8 code whose declared objective is extreme runtime efficiency.

NEES is not a benchmark standard and it does not assert that conforming code is fast. It defines the implementation discipline that MUST be followed, considered, or explicitly deviated from when a subsystem is declared NEES-conforming.

The central objective is to minimize the complete execution structure and **total machine cost** between the required semantics and the machine realization, without weakening semantics or turning current-engine folklore into permanent rules.

For **NEES-EXTREME**, "fast enough" is not a stopping criterion. After required semantics, safety, lifecycle, resource, and deployment constraints are fixed, every known avoidable E0-E2 cost remains an optimization target until it is removed, shown to reduce greater cost elsewhere, shown unavoidable on the selected realization, qualified as no better than the retained form, or explicitly carried as optimization debt/deviation.

The objective is minimum realizable machine cost, not minimum source lines or minimum instruction count in isolation. A realization with more instructions may be better when it reduces critical dependency depth, memory traffic, cache/TLB misses, branch misses, boxing/conversion, allocation/GC, synchronization/coherence, runtime dispatch, native-boundary cost, or other stall cycles.

Performance qualification remains separate. NEES does not claim mathematical proof of a globally optimal program; it requires systematic maximal-effort treatment of known and reasonably discoverable hot-path cost.

## 2. Normative language

The words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, and MAY are normative.

Rules carry a stability tag:

- **STABLE** — semantic or architectural and expected to survive runtime revisions.
- **NODE-STABLE** — tied to a stable Node.js platform contract.
- **V8-SENSITIVE** — depends on current V8 realization and MUST be qualified against a declared runtime profile.
- **PLATFORM-SENSITIVE** — depends on CPU, ABI, OS, allocator, cache topology, or other deployment facts.
- **EXPERIMENTAL** — useful candidate method whose generality has not been established.

A deviation from MUST or MUST NOT requires an explicit deviation record under [CONFORMANCE.md](CONFORMANCE.md).

## 3. Runtime profiles are part of the method contract

### NEES-EVID-001 — Pin realization-sensitive advice [STABLE]

A V8-SENSITIVE, NODE-STABLE, or PLATFORM-SENSITIVE method MUST identify the runtime/platform profile against which it is being applied.

The profile MUST distinguish at least:

- Node.js major or exact release;
- V8 family or exact `process.versions.v8` when the distinction matters;
- CPU architecture when ABI, atomics, cache behavior, SIMD, or native-call shape matters;
- relevant Node API stability state when an experimental API is used.

The current reference profile is [RUNTIME_PROFILE_NODE26.md](RUNTIME_PROFILE_NODE26.md).

### NEES-EVID-002 — Stale-advice firewall [STABLE]

Historical JavaScript performance advice MUST NOT be promoted into a NEES rule solely because it was once true, is common in blog posts, or appears in model training memory.

Before relying on an engine-specific claim, use this evidence order:

1. current Node/V8 specification, documentation, or source;
2. generated-code/runtime evidence on the declared target;
3. current production-project evidence with a stated runtime and workload;
4. maintained secondary guidance;
5. historical guidance only as context.

Known traps are recorded in [STALE_ADVICE.md](STALE_ADVICE.md).

### NEES-EVID-003 — State the mechanism and falsifier [STABLE]

A realization method MUST identify what work it is expected to remove or what machine/runtime property it is expected to preserve.

For E0/E1 changes, a V8-SENSITIVE or PLATFORM-SENSITIVE method MUST also state at least one condition that would make the method inapplicable, unnecessary, or worse.

"Lower level", "native", "typed", "branchless", "monomorphic", "preallocated", and "lock-free" are not mechanisms by themselves.

### NEES-EVID-004 — Qualify coherent changes, not individual edits [STABLE]

The default qualification unit for NEES implementation work is a **coherent completed pull request or equivalent complete change set**, not each edited line, helper, method application, or local optimization.

NEES MUST NOT require repeated full correctness suites, benchmarks, profiles, generated-code inspection, negative controls, or runtime qualification solely because another optimized line was written.

During development:

- inherited evidence from the selected runtime profile and previously qualified NEES methods MAY be reused;
- semantic derivation, representation accounting, source inspection, and other development evidence SHOULD guide continued implementation;
- targeted checks SHOULD be run when their result can change the next design decision, prevent continued work on an invalid premise, or establish a correctness invariant needed for further work;
- agents SHOULD checkpoint reasoning and durable progress without treating each checkpoint as a qualification gate.

Before promotion or merge, the completed qualification unit MUST receive the applicable project-required correctness, NEES conformance, structural, runtime/JIT, and performance qualification.

A method already qualified for the active runtime/profile does not require fresh microqualification at every application unless the change crosses that method's admission boundary or requalification trigger.

The qualification boundary SHOULD preserve a coherent structural optimization. It SHOULD NOT force useful architecture changes into tiny patches merely so each micro-delta is independently measurable.

## 4. Execution classes

Every NEES scope MUST declare an execution class.

### E0 — inner execution

Operations proportional to the fundamental problem size or recursive/node/item count.

Examples: solver nodes, parser token loops, codec inner loops, per-element transforms.

E0 receives the strictest allocation, representation, and coordination discipline.

### E1 — transition execution

Operations proportional to edges, transitions, records, probes, or equivalent fine-grained state changes.

Examples: state transitions, hash probes, graph-edge processing, table lookups.

### E2 — decision / coordination execution

Operations at branch, frontier, claim, reconciliation, publication, or batch frequency.

Examples: scheduler branch publication, task claim, dependency reconciliation.

### E3 — task / request boundary

Operations once per task, request, batch, bounded quantum, connection, or other amortization unit.

Allocation and richer structures MAY be admissible when their cost is not multiplied into E0-E2.

### COLD — preparation / reporting

Initialization, compilation, schema preparation, configuration, diagnostics, persistence, human formatting, and offline preprocessing.

A lower-frequency label MUST NOT be used to hide work that is actually proportional to a higher-frequency class.

## 5. Primary objectives

### NEES-CORE-001 — Minimize unnecessary execution structure [STABLE]

E0-E2 implementations MUST use the narrowest practical representation and mechanism that preserves required semantics.

Unnecessary structure includes work or state that:

- is not observed by the semantic consumer;
- is re-derived from information already available;
- represents generality the consumer cannot use;
- is constructed only to be immediately projected away;
- exists only because of a convenient API shape rather than the domain;
- duplicates runtime work that a stable builtin or prepared representation already performs more directly.

### NEES-CORE-002 — Semantics dominate optimization [STABLE]

No NEES method may weaken required correctness, safety, lifecycle, identity, ordering, restoration, capability, or failure behavior.

A faster representation with different meaning is not a performance optimization.

### NEES-CORE-003 — Separate semantic identity from addressing and occurrence [STABLE]

Hashes, slots, object identity, process-local IDs, worker ownership, occurrence IDs, queue records, pointers, and cache locations MUST NOT be treated as semantic identity unless the domain explicitly defines them as such.

Addressing machinery MAY narrow lookup. Authoritative equality remains owned by the semantic key.

### NEES-CORE-004 — Optimize the dominant boundary first, without exempting smaller costs [STABLE]

A local operation SHOULD NOT be optimized merely because it is easy to rewrite.

Before a substantial E0-E2 optimization, identify whether the largest currently known cost is:

- computation;
- allocation or retention;
- data movement;
- representation conversion or materialization;
- JS/native or thread boundary crossing;
- coordination/contention;
- cache/memory locality;
- I/O or external latency;
- JIT compilation/deoptimization.

The largest cost normally determines **priority**, not whether smaller avoidable costs count. A proposed method that does not affect the largest cost remains a legitimate NEES-EXTREME target when it has a concrete mechanism for lowering total machine cost and does not obstruct a higher-value structural change.

### NEES-XTRM-001 — Minimize total machine cost [STABLE]

For E0-E2 code declared **NEES-EXTREME**, the governing objective is the lowest realizable total machine cost on the selected runtime/platform profile, subject to required semantics and independently load-bearing constraints.

The cost model includes, where applicable:

- executed/retired work;
- critical dependency depth and pipeline stalls;
- loads, stores and memory traffic;
- cache and TLB working-set behavior;
- branches, prediction and misprediction;
- allocation, initialization, write barriers and garbage collection;
- boxing, coercion and representation conversion;
- call, dispatch, inlining and deoptimization machinery;
- synchronization, Atomics, cache-coherence traffic and wakeups;
- serialization, cloning, copying and transport;
- JS/native/WASM/FFI crossing and marshalling;
- required product materialization.

No one metric is automatically authoritative. The target is total execution cost.

### NEES-XTRM-002 — Presume observed avoidable work is optimization debt [STABLE]

Within a NEES-EXTREME E0-E2 scope, an observed operation, representation, memory access, allocation, conversion, branch, call, synchronization event, materialization, or runtime mechanism MUST NOT be retained merely because it is conventional, readable, idiomatic, already fast, individually small, or not currently dominant.

It is considered resolved only when at least one of these is established:

1. it is required by semantics;
2. it is required by safety, lifecycle, ownership, resource, ABI, permission, or deployment constraints;
3. retaining it reduces greater total machine cost elsewhere;
4. it is unavoidable under the selected Node/V8/platform realization;
5. a qualified alternative has equal or greater total machine cost;
6. it has been removed or structurally superseded;
7. it is explicitly recorded as unresolved optimization debt or a deviation.

### NEES-XTRM-003 — Cost magnitude controls priority, not legitimacy [STABLE]

A known avoidable E0/E1 cost does not cease to be an optimization target because its isolated effect is small or because another bottleneck is larger.

Projects SHOULD attack higher-leverage costs first, but smaller known costs MUST remain visible until resolved, disproven, superseded, or explicitly deferred.

A threshold such as "less than 1%" MAY be used to prioritize work. It MUST NOT be used as a general rule that the cost is irrelevant.

### NEES-XTRM-004 — Optimize cycles and critical path, not instruction count alone [STABLE]

NEES-EXTREME does not equate fewer source operations or fewer machine instructions with fewer elapsed cycles.

A realization MAY intentionally execute more instructions when doing so lowers total execution time or resource cost through effects such as:

- fewer dependent loads;
- lower latency on the critical path;
- better cache/TLB locality;
- fewer branch misses;
- more instruction-level parallelism;
- fewer allocations or GC interactions;
- less synchronization/coherence traffic;
- cheaper runtime representations.

Instruction count is evidence only for the cost it actually represents.

### NEES-XTRM-005 — No "fast enough" stopping condition [STABLE]

A NEES-EXTREME optimization pass may stop only because:

- no further justified improvement is presently known after the required review;
- remaining observed work is required or currently unavoidable;
- qualified alternatives do not reduce total machine cost;
- a larger structural change supersedes the local target;
- the owner explicitly defers unresolved optimization debt.

Owner deferral does not convert known avoidable work into required work. If a known avoidable E0/E1 cost is deliberately retained, the conformance record MUST preserve it as debt and, where it conflicts with a MUST/MUST NOT requirement, as an explicit deviation.

"Already fast", "not the bottleneck", "too small to matter", "idiomatic", and "cleaner" are not stopping reasons by themselves.

### NEES-XTRM-006 — Maximal effort is not a claim of global optimality [STABLE]

NEES-EXTREME requires systematic search for and disposition of known and reasonably discoverable avoidable machine cost. It does not require a proof that no faster program can exist.

Conformance therefore means:

```text
no known avoidable hot-path work silently ignored
+ explicit treatment of unresolved cost
+ current-runtime evidence for realization-sensitive choices
+ continued eligibility of small exact improvements
```

It does not mean "globally optimal machine code has been mathematically proved".

## 6. Boundary discipline

### NEES-BOUND-001 — Normalize once at ingress [STABLE]

Validation, decoding, normalization, type dispatch, and representation conversion SHOULD occur at the highest boundary that can establish the required invariant once.

E0-E1 code SHOULD consume already-normalized representations.

### NEES-BOUND-002 — Preserve stronger upstream facts [STABLE]

If an upstream operation proves a stronger precondition that removes downstream cases, the implementation SHOULD preserve that fact long enough to specialize the downstream operation.

It SHOULD NOT discard exact information and then re-test or re-generalize the same condition.

### NEES-BOUND-003 — Cold failure and reporting path [STABLE]

Human-readable error construction, formatting, logging, stack enrichment, rich diagnostics, and expensive process snapshots SHOULD occur after leaving successful E0-E2 execution unless those outputs are themselves required semantics.

### NEES-BOUND-004 — Builtins are candidate machine primitives [V8-SENSITIVE]

A standard Node/V8 builtin MUST NOT be replaced with hand-written JavaScript solely because the builtin appears higher-level.

When a builtin already performs the required operation with native or optimized-engine machinery, reimplementation requires an admission reason such as:

- avoiding a proven conversion/allocation the builtin necessarily performs;
- exploiting a narrower proven domain;
- eliminating repeated general dispatch;
- combining multiple passes into one exact pass;
- avoiding an actual boundary cost.

## 7. Representation discipline

### NEES-REP-001 — Domain-appropriate width [STABLE]

Numeric/reference widths MUST cover the actual domain with explicit overflow and capacity behavior.

Do not choose a wider/general representation merely for convenience when a narrower representation materially reduces execution structure.

Do not choose a narrow representation that creates an accidental future limit without a capacity strategy.

### NEES-REP-002 — Stable internal representation [STABLE]

E0-E2 code SHOULD avoid repeated conversion between representations.

Examples include:

- object <-> numeric record;
- string <-> parsed structure;
- signed <-> unsigned numeric presentation where only bits matter;
- portable <-> process-local representation;
- structured data <-> serialized bytes.

Convert at ownership boundaries, not repeatedly in the recurrence.

### NEES-REP-003 — Structured facts remain structured [STABLE]

A structured fact MUST NOT be serialized or materialized and then reparsed, rescanned, regex-matched, split, or otherwise re-derived in E0-E2 when the original structured representation can satisfy the consumer.

### NEES-REP-004 — One owner for derived facts [STABLE]

Facts derived from immutable or slowly changing state SHOULD have one construction point and many reads.

Consumers SHOULD receive or index the derived fact rather than rediscover it.

## 8. Allocation and lifetime

### NEES-ALLOC-001 — Eliminate avoidable E0 allocation [STABLE]

E0 successful execution MUST NOT allocate dynamic aggregate state when scalar locals, caller-owned scratch, preallocated storage, a reusable resource with natural ownership, or prepared immutable data can represent the same semantics with lower total cost.

This includes avoidable Objects, Arrays, Sets, Maps, Promises, closures, buffers/views, iterators, and formatted strings.

This is not a blanket ban on those language features.

### NEES-ALLOC-002 — Allocation count is not lifetime cost [STABLE]

NEES MUST NOT assume that reusing or pooling a JavaScript object is better merely because it avoids allocation.

V8 uses a generational collector in which short-lived objects can be cheap; retaining objects can increase old-generation, tracing, aliasing, and reset costs.

Custom pooling therefore requires an ownership/lifetime argument, not just a lower allocation count.

### NEES-ALLOC-003 — Prepare growth before entry [STABLE]

Storage growth, widening, rehashing, backing-store replacement, large copies, and capacity negotiation SHOULD occur before E0/E1 entry when the domain permits sealing.

A sealed hot path SHOULD fail or exit to a colder control boundary rather than silently grow.

### NEES-ALLOC-004 — Reuse must have ownership [STABLE]

Scratch or reusable storage MUST have explicit ownership and lifetime rules.

Borrowed scratch MUST NOT survive a recursive call or descendant operation that may reuse it unless copied into stable scalar/owned storage.

## 9. Complexity and repeated work

### NEES-COMP-001 — Complexity class is part of the implementation contract [STABLE]

A rewrite MUST NOT silently worsen the asymptotic complexity of a declared hot operation.

### NEES-COMP-002 — Do not restart monotonic work [STABLE]

When processing ordered data repeatedly, carry a cursor/index or use an appropriate direct lookup. Do not restart a scan from the beginning inside a repeated consumer unless required by semantics.

### NEES-COMP-003 — Do not materialize to answer a projection [STABLE]

If a consumer asks only existence, emptiness, cardinality class, membership, or another projection, do not construct the full collection/object/string solely to answer that projection.

### NEES-COMP-004 — Exact single-pass construction when size is derivable [STABLE]

If the exact output size can be derived cheaply from already-required information, a writer SHOULD prefer:

`derive exact length -> allocate once -> write once`

over dry-run serialization, guessed growth, repeated encoding, or allocate-copy-shrink patterns.

This method is inapplicable when exact sizing costs another full expensive pass or when streaming semantics make buffering undesirable.

## 10. Finite-domain and preparation rules

### NEES-FINITE-001 — Precompute immutable finite relations [STABLE]

When a relation is immutable, bounded, and small enough for practical prepared storage, E0-E2 SHOULD use a precomputed/indexed form rather than reconstructing the relation.

Preparation MUST validate the invariants required by the hot consumer.

### NEES-FINITE-002 — Compile stable structure when reuse amortizes compilation [STABLE]

If schema, grammar, protocol shape, or other structural metadata is known before repeated execution, NEES SHOULD consider compiling that structure into a specialized function/table once rather than interpreting it repeatedly.

Generated specialization MUST have explicit controls for:

- compilation/setup amortization;
- code-size and warm-up growth;
- trusted vs untrusted generator input;
- fallback/general cases;
- runtime-profile sensitivity.

## 11. Control flow and JIT feedback

### NEES-CF-001 — Simplify before general work [STABLE]

Exact terminal, forced, degenerate, empty, singleton, cached, or otherwise simplifying conditions SHOULD be consumed before operations whose result they make unnecessary.

### NEES-CF-002 — Dispatch once [STABLE]

If one discriminator determines a family of operations, read or normalize it once and route to the appropriate specialized path rather than repeatedly rescanning/retesting the same family.

### NEES-JIT-001 — Prefer stable, bounded feedback over cargo-cult monomorphism [V8-SENSITIVE]

E0-E1 code SHOULD avoid uncontrolled growth in types, shapes, elements kinds, and call targets at genuinely hot feedback sites.

NEES does NOT require every hot site to be monomorphic. A small stable polymorphic set can be well handled by modern V8.

The actual risks are:

- feedback that keeps changing after tier-up;
- megamorphic or otherwise unspecializable sites on repeated hot paths;
- representation transitions that invalidate optimized assumptions;
- dispatch diversity large enough to block useful specialization.

### NEES-JIT-002 — Stable object and element representations at repeated hot access sites [V8-SENSITIVE]

When objects or arrays are retained in E0-E1, their shapes/elements kinds SHOULD remain stable enough for the declared profile.

Deleting hot object properties, accidental sparse/holey arrays, out-of-bounds reads on repeated array access sites, or mixing incompatible element families MUST be treated as realization risks.

### NEES-JIT-003 — Source form is not generated-code proof [V8-SENSITIVE]

A source-level rewrite MUST NOT be justified by assumptions about inlining, register retention, boxing, branch elimination, or devirtualization when the claim is load-bearing.

If the optimization depends on one of those properties, inspect a suitable runtime signal, generated code, deopt/optimization trace, or controlled counterexample on the target profile.

## 12. Concurrency

### NEES-CONC-001 — Coordination frequency below useful-work frequency [STABLE]

E0 execution MUST NOT require synchronous cross-thread coordination merely to progress ordinary local computation.

Shared coordination SHOULD occur at an amortized boundary whose cost is small relative to the work it controls.

### NEES-CONC-002 — Visibility and execution are distinct [STABLE]

Making a dependency globally visible MUST NOT imply that it must execute immediately.

Execution resources SHOULD remain bounded independently of semantic/dependency visibility.

### NEES-CONC-003 — Shared state must minimize contention structure [STABLE]

"Atomic", "lock-free", or "wait-free" is not by itself a performance argument.

Shared writes, retry loops, cache-line contention, false sharing, wakeups, and centralized counters are part of the execution structure and SHOULD be minimized.

### NEES-CONC-004 — Shared-memory correctness precedes speed [STABLE]

SharedArrayBuffer code MUST establish a data-race-safe protocol for the shared fields it depends on.

Atomics establish synchronization semantics; ordinary conflicting accesses are not made safe merely because nearby fields use Atomics.

## 13. Native and runtime escape

### NEES-NATIVE-001 — Native is a boundary choice, not a performance rank [STABLE]

NEES MUST NOT assume that native code, WebAssembly, FFI, or an addon is faster than optimized JavaScript.

The selected mechanism MUST account for:

- call and marshalling cost;
- data copies and materialization;
- ownership/lifetime transfer;
- ABI and runtime stability;
- batching opportunity;
- permission/deployment constraints;
- whether the dominant cost remains in JavaScript object/string materialization after native work completes.

Detailed choices are defined in [NODE_V8_METHODS.md](NODE_V8_METHODS.md) and the runtime profile.

## 14. Diagnostics

### NEES-DIAG-001 — Hot diagnostics are compact [STABLE]

E0-E2 instrumentation SHOULD accumulate bounded counters, indices, compact event codes, or timestamps.

Formatting, serialization, symbol expansion, logging, and expensive system snapshots SHOULD be cold or sampled.

Instrumentation MUST NOT silently change the algorithmic shape being evaluated.

## 15. Method selection

When this specification says SHOULD, the default implementation is the corresponding recipe in [NODE_V8_METHODS.md](NODE_V8_METHODS.md).

An implementation MAY use a different method when:

- semantics require it;
- the default does not apply to the domain;
- current runtime evidence invalidates it;
- another method removes more total execution structure;
- the default introduces unacceptable lifecycle, security, deployment, or maintenance constraints.

The reason MUST be explicit for E0/E1 deviations.
