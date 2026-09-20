# NEES Node/V8 Realization Methods — Draft 0.1

This document supplies the concrete method layer for NEES.

These recipes are intentionally more prescriptive than ordinary JavaScript guidance. They apply only inside a declared NEES scope and become stricter as execution frequency approaches E0.

Each method identifies the default realization and its stability.

## M01 — Boundary specialization

**Applies:** E0-E2  
**Stability:** STABLE with V8-specific rationale

When an operation accepts multiple external representations:

```text
external union
    -> validate/dispatch once
    -> specialized internal function
```

Prefer one boundary dispatch over one hot function repeatedly receiving unrelated types/shapes.

Reject by default in E0:

- deep repeated type dispatch;
- the same call site receiving unrelated object shapes;
- alternating sentinel conventions such as both null and undefined;
- union-shaped values carried through the recurrence.

## M02 — Stable object shapes when objects are necessary

**Applies:** E0-E2  
**Stability:** V8-SENSITIVE

If hot objects are justified:

- construct each semantic family through one shape policy;
- initialize all hot properties in the same order;
- use one sentinel convention for absent state;
- do not delete hot properties;
- do not add hot properties after construction;
- do not reshape through object spread in repeated execution.

If shape diversity is inherent, dispatch once and split hot consumers by shape/type.

Prefer indexed arrays/typed arrays over objects when records are fixed-width numeric, populations are large, graph relations dominate, or shared memory is required.

## M03 — Scalar locals before aggregate temporaries

**Applies:** E0-E1  
**Stability:** STABLE

For small fixed tuples, prefer scalar locals:

```text
p0, p1, support, hash
```

over allocating a temporary object/array.

If temporary multi-field state is required, use caller-owned scratch with explicit lifetime.

Copy scratch-derived coordinates to scalars before recursive descent if descendants may reuse the scratch.

## M04 — Fixed/indexed records for large hot populations

**Applies:** E0-E2  
**Stability:** STABLE

Default large-population representation:

```text
state[node]
value[node]
firstEdge[node]

edgeTarget[edge]
edgeNext[edge]
edgeKind[edge]
```

rather than a pointer-rich graph of per-node/per-edge objects.

Use structure-of-arrays when operations touch a subset of fields across many records. Separate cold metadata from hot fields.

## M05 — Numeric/symbol identity at hot frequency

**Applies:** E0-E2  
**Stability:** STABLE

If semantic identity is not intrinsically textual, assign/derive a stable integer index or fixed-width coordinate at ingress and compare that representation.

If character content is semantically required repeatedly, decode once into indexed byte/code-unit storage and carry offset/length/index metadata.

This does not prohibit strings when strings are the actual semantic data and V8 string operations are the appropriate primitive.

## M06 — Direct finite tables

**Applies:** E0-E2  
**Stability:** STABLE

For a small immutable domain:

```text
inputIndex -> prepared result / offset / mask
```

Precompute at module/preparation time and validate closure once.

Examples:

- cell -> bit mask;
- token -> transition class;
- opcode -> handler index;
- symbol -> reflected symbol;
- finite relation -> start/end span.

Do not replace cheaper arithmetic with a table blindly; use the table when it removes repeated/general work.

## M07 — Exact numeric hash index

**Applies:** E1-E2  
**Stability:** STABLE

Default exact indexed-table pattern:

```text
hash = mix(key coordinates)
slot = hash & mask
probe
compare every authoritative coordinate
return entry index
```

Requirements:

- hash is locator only;
- collision behavior is exact;
- hot probes do not materialize key objects/strings;
- growth/rehash is preparation/cold work;
- sealed hot tables do not silently resize.

Prefer direct indexing over hashing for bounded dense domains.

## M08 — 32-bit numeric carrier discipline

**Applies:** E0-E1  
**Stability:** V8-SENSITIVE

When the complete consumer semantics observe only the low 32 bits:

- prefer an int32 carrier through bitwise / Math.imul / Math.clz32-class operations;
- avoid converting to unsigned 0..2^32-1 Number at call boundaries solely for presentation if unsigned magnitude is not consumed;
- use `>>> 0` where unsigned magnitude/storage is actually required.

Rationale: relevant V8 realizations can generalize/box unsigned Number values that no longer fit the preferred integer representation across calls.

This requires exact bit-pattern equivalence. Do not apply it when magnitude, ordering, division, serialization, or other non-bitwise semantics differ.

## M09 — JavaScript Array vs TypedArray

**Applies:** E0-E2  
**Stability:** V8-SENSITIVE

Do not assume TypedArray is always faster.

Use TypedArray/Buffer when one or more are load-bearing:

- fixed-width numeric storage;
- SharedArrayBuffer backing;
- contiguous binary layout;
- native/WASM interop;
- bounded footprint;
- explicit signed/unsigned width;
- zero-copy I/O.

For short local homogeneous collections with append behavior, a packed normal array MAY be better.

If normal arrays are hot:

- keep element type stable;
- avoid holes;
- avoid sparse far-index writes;
- avoid numeric-to-object element transitions.

## M10 — Avoid repeated allocation in loops

**Applies:** E0-E2  
**Stability:** STABLE

Inside repeated loops/recursion reject by default:

- temporary object literals;
- array spread/clones;
- map/filter/reduce intermediate arrays;
- Array.from temporary transforms;
- fresh Set/Map per iteration;
- closures per iteration;
- Promise creation for synchronous/local work;
- repeated TypedArray views over the same region.

Replacement order:

1. scalar locals;
2. direct predicate/loop without materialization;
3. reusable scratch;
4. preallocated indexed arena;
5. cold allocation outside the loop.

## M11 — Prepared/sealed storage

**Applies:** E0-E2  
**Stability:** STABLE

For dictionaries, arenas, caches, queues:

1. reserve expected capacity before entry;
2. widen reference fields before growing large backing arrays when that avoids duplicate copies;
3. rehash before entry;
4. seal storage;
5. treat unexpected hot overflow as an explicit control/failure condition;
6. unseal only after the hot recurrence unwinds.

Do not recover from a hot capacity miss by silently allocating/copying.

## M12 — Generation-safe arena reuse

**Applies:** E1-E3  
**Stability:** STABLE

Reusable indexed slots should carry:

```text
slot index + generation
```

so stale references cannot target a recycled occupant.

Default lifecycle:

```text
FREE -> RESERVED -> LIVE -> RETIRED/COMPLETE -> FREE(new generation)
```

## M13 — Derived facts: construct once, read many

**Applies:** E0-E2  
**Stability:** STABLE

If a fact depends only on immutable/prepared data or maintained state, choose one owner.

Examples:

- source line starts;
- reflection;
- support masks;
- incidence spans;
- normalized-class metadata;
- action landing cells;
- canonical orientation hints.

Do not reconstruct it in each consumer.

## M14 — Never serialize to rediscover structure

**Applies:** E0-E2  
**Stability:** STABLE

Reject:

```text
structured object
    -> string/bytes
    -> regex/indexOf/split/parser
    -> structure
```

when original structured coordinates can be passed directly.

## M15 — Fast path / slow path split

**Applies:** E0-E2  
**Stability:** STABLE

Keep common qualified execution small/direct.

Move malformed inputs, uncommon representation variants, verbose diagnostics, compatibility conversion, and exceptional metadata handling to a slow/cold path where semantics permit.

Do not execute slow-path setup before it is required.

## M16 — Consume terminal/simplifying facts first

**Applies:** E0-E2  
**Stability:** STABLE

Preferred precedence:

```text
cache / exact terminal / forced / empty / degenerate fact
    -> return or specialize
    -> general transform only if still required
```

Do not canonicalize, allocate, normalize, or transform state made semantically dead by an earlier exact fact.

## M17 — Dispatch once

**Applies:** E0-E2  
**Stability:** STABLE

If one discriminator determines the code family:

- read/normalize once;
- branch/switch once;
- call specialized monomorphic implementation.

Reject repeated scans/checks of the same prefix/family.

## M18 — Counted loops in extreme hot code

**Applies:** E0-E1  
**Stability:** V8-SENSITIVE

Default to simple counted loops over prepared numeric storage.

Avoid iterator/callback machinery in E0 when a direct loop expresses the same semantics:

- forEach;
- map;
- filter;
- generator/iterator pipelines.

This is about call/allocation/iterator structure, not syntax aesthetics.

## M19 — Stable signatures and return classes

**Applies:** E0-E1  
**Stability:** V8-SENSITIVE

Prefer:

- fixed arity;
- stable argument types;
- one sentinel convention;
- stable return class;
- specialized functions for materially different input families.

Avoid complex/leaking use of `arguments`, rest collection where fixed arity is known, shape-diverse calls, and unstable return unions in E0.

## M20 — Closure/context discipline

**Applies:** E0-E2  
**Stability:** V8-SENSITIVE

Do not create closures inside repeated execution when module-scope/precreated callables can express the same semantics.

Cold helpers that capture preparation state SHOULD live outside hot lexical scope when placement otherwise causes context allocation on the common path.

A cold branch does not guarantee zero common-path allocation if lexical capture changes function realization.

## M21 — Validation boundary and trusted primitives

**Applies:** E0-E2  
**Stability:** STABLE

Public/external route:

```text
validate ownership/range/type
    -> trusted primitive
```

Internal hot route:

```text
prove invariant at owning boundary
    -> trusted primitive
```

Do not remove validation globally.

A trusted method requires documented provenance for each unchecked input and a fail-closed public route.

## M22 — Reversible state: mutate/undo, not clone/replay

**Applies:** E0-E2  
**Stability:** STABLE

When descendants can be explored with exact restoration:

- maintain compact mutable state;
- store minimal reversible history;
- apply;
- execute descendant;
- restore in finally/equivalent guaranteed cleanup.

Reject per-child state cloning/full replay where exact mutation/undo is cheaper and lifecycle-safe.

Replay MAY remain appropriate at a process/thread portability boundary.

## M23 — Deterministic/outdegree-one direct descent

**Applies:** E0-E2  
**Stability:** STABLE

If exact semantics establish one unresolved successor:

```text
outdegree == 1
    -> descend directly
```

Do not create a scheduling record merely to reclaim the same dependency unless another owner needs the occurrence for correctness/visibility.

## M24 — Priority work structures

**Applies:** E2  
**Stability:** STABLE

Do not begin with a general object priority heap when bounded coarse priority is sufficient.

Preferred first realization:

```text
small fixed priority-band count
preallocated numeric queues/rings
integer work IDs
generation/liveness state
highest nonempty band selection
```

Rich policy may compute compact band/subrank fields outside the claim fast path.

Use a general heap/tree only when required ordering cannot be represented efficiently by bounded classes.

## M25 — Shared-memory claim lifecycle

**Applies:** E2-E3  
**Stability:** NODE-STABLE

For high-frequency worker coordination using SharedArrayBuffer, prefer fixed numeric slot state:

```text
FREE -> RESERVED -> READY -> CLAIMED -> COMPLETE/RETIRED
```

Use the minimum required bounded Atomics for claim/retire.

Avoid per-claim Promise creation, synchronous manager RPC, per-work structured clone, rich object queue traversal, and one globally contended word when partitioned state works.

## M26 — False-sharing and contention layout

**Applies:** E2  
**Stability:** STABLE / hardware-sensitive

Identify which party writes each shared field.

Separate frequently-written independent words when they would otherwise share a contended cache line.

Prefer worker-local accumulation, infrequent publication, mostly-read global state, and partitioned queues/bands.

Atomic count alone is not the full cost; coherence traffic is part of the design.

## M27 — Worker lifecycle

**Applies:** E3  
**Stability:** NODE-STABLE

For repeated CPU work:

- create/warm worker pools outside hot work;
- retain bounded useful worker-local state;
- reset only at explicit retention/resource boundaries;
- do not create/terminate a worker per task;
- do not allocate one control buffer per task if a generation-safe shared control arena can represent lifecycle.

Worker-local IDs remain local unless a portable semantic representation qualifies them.

## M28 — Transport representation

**Applies:** E2-E3  
**Stability:** NODE-STABLE

For frequent task/occurrence transport prefer:

1. integer slot/reference into shared/prepared storage;
2. compact fixed-width numeric payload;
3. bounded Buffer/TypedArray;
4. structured clone/object messages only when frequency permits.

Never replace a portable semantic representation with process-local IDs merely to avoid transport cost.

## M29 — Native/builtin preference ladder

**Applies:** E0-E3  
**Stability:** NODE/V8-SENSITIVE

Evaluate primitives in this order:

1. direct JS operation lowered efficiently by V8;
2. existing Node/Buffer/TypedArray native-backed builtin;
3. batched WebAssembly/native primitive;
4. V8/Node fast native interface where appropriate;
5. N-API/C++/other native implementation.

Do not call native code for work so small that crossing dominates.

If a native primitive is required frequently, batch or use a fast-call mechanism rather than repeated general value marshalling.

## M30 — Diagnostic cold path

**Applies:** E0-E3  
**Stability:** STABLE

Hot code may update numeric counters, event codes, indices, bounded samples, and prepared timestamps.

Move out of E0-E2:

- console/logging;
- JSON;
- human formatting;
- stack/message construction;
- heavyweight memory/process snapshots;
- file/network reporting.

Instrumentation that changes allocation/control-flow shape is not transparent.

## M31 — Runtime introspection caution

**Applies:** E2-E3  
**Stability:** NODE-SENSITIVE

Do not assume process/runtime introspection calls are cheap enough for task/branch frequency.

Collect expensive snapshots at a cold/sample boundary or use a cheaper qualified subset API if it satisfies the diagnostic requirement.

## M32 — Data locality

**Applies:** E0-E2  
**Stability:** STABLE / hardware-sensitive

Place fields read together so working-set/cache traffic is minimized.

Separate cold metadata.

Avoid pointer-rich object graphs for large traversed populations when flat indices represent the same relation.

Do not overpack if extraction/misalignment costs more than bytes saved.

## M33 — Specialize after semantic narrowing

**Applies:** E0-E2  
**Stability:** STABLE

When an upstream theorem/validator/classifier excludes result classes, create a scoped specialized downstream operation rather than carrying impossible cases.

Examples:

```text
general transition may terminal
qualified caller proves nonterminal
    -> nonterminal specialization
```

```text
public function accepts arbitrary index
internal caller proves validated index
    -> trusted indexed primitive
```

The specialization MUST NOT escape its admission boundary.

## M34 — Do not optimize an abstraction a structural change removes

**Applies:** all  
**Stability:** STABLE

Before optimizing a local mechanism, ask whether the target architecture removes that ownership boundary.

Prefer structural elimination to faster execution of obsolete work.

## M35 — Version-sensitive realization records

**Applies:** V8-SENSITIVE rules  
**Stability:** STABLE meta-rule

For methods depending on specific V8 lowering, boxing, inlining, element-kind, Fast API, or Node internal behavior, record:

- Node version/family;
- V8 version/family;
- expected behavior;
- semantic equivalence boundary;
- requalification trigger.

Do not turn an observed engine quirk into a universal JavaScript rule.
