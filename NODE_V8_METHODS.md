# NEES Node/V8 Realization Methods — Draft 0.2

This document is the prescriptive realization layer for NEES.

The stable rules live in [SPEC.md](SPEC.md). Current Node/V8 facts live in [RUNTIME_PROFILE_NODE26.md](RUNTIME_PROFILE_NODE26.md). Known folklore traps live in [STALE_ADVICE.md](STALE_ADVICE.md).

A method is not an incantation. For E0/E1, the implementer MUST be able to state:

```text
admission: why this method applies
mechanism: what work/representation it removes or preserves
semantic boundary: what must remain exactly true
falsifier: what would make this method neutral or worse
profile: which runtime/platform assumptions matter
```

## M01 — Normalize and specialize at ownership boundaries

**Applies:** E0-E2  
**Stability:** STABLE

### Admission

External inputs admit multiple representations, validation states, or semantic variants, but repeated internal consumers need only a narrower form.

### Method

```text
external/general form
    -> validate / normalize / dispatch once
    -> narrow internal form
    -> repeated specialized consumer
```

Normalize at the highest boundary that owns the invariant.

### Reject

- repeated `typeof` / `instanceof` / tag parsing in an inner recurrence;
- converting the same value on every descendant/record;
- carrying external error-reporting representation into E0 when a compact internal form is sufficient.

### Falsifier

If the normalization itself must be repeated because the semantic value can change between uses, or if specialization duplicates enough code to worsen the dominant path, keep the general form.

---

## M02 — Keep hot feedback stable and bounded

**Applies:** E0-E1  
**Stability:** V8-SENSITIVE

### Admission

A dominant function/property/call site is sensitive to changing runtime type, shape, elements kind, or call-target feedback.

### Method

Prefer stable families of values through a hot feedback site. Dispatch once at a boundary when materially different families can be separated cleanly.

The target is **stable, bounded feedback**, not monomorphism for its own sake.

### Reject

- architecture contortions whose only justification is "monomorphic is always faster";
- adding artificial type tags solely to force one object shape when role-specific consumers become more polymorphic;
- quoting a fixed acceptable polymorphism count without target-runtime evidence.

### Falsifier

If the site is not dominant, remains stably optimized, or the split increases code size/dispatch enough to regress the workload, do not specialize further.

---

## M03 — Keep object shapes stable when objects are the right representation

**Applies:** E0-E2  
**Stability:** V8-SENSITIVE

### Admission

Objects are semantically appropriate and hot property access is material.

### Method

- construct a semantic object family through a consistent property-addition order;
- keep hot fields present rather than repeatedly deleting/re-adding them;
- use one absence convention per field when semantics permit;
- avoid repeated reshaping/cloning in the hot recurrence.

### Important distinction

Initializing every possible property is not automatically required. The requirement is that instances flowing through the same dominant access sites have predictable useful shapes.

Field value representation matters separately from property shape.

### Reject

- `delete` on repeated hot objects without a semantic need;
- object spread solely to "refresh" a shape;
- null-prototype objects chosen solely because they sound lower-level.

### Falsifier

If object/property access is not material, or a fixed indexed representation would create more conversion work than it removes, keep the simpler object representation.

---

## M04 — Prefer scalars for small ephemeral fixed tuples

**Applies:** E0-E1  
**Stability:** STABLE

### Admission

A small temporary record exists only to pass a few values to the next operation.

### Method

Prefer scalar locals or fixed arguments:

```text
p0, p1, support, hash
```

over constructing:

```text
{ p0, p1, support, hash }
[p0, p1, support, hash]
```

Use caller-owned scratch when scalar count becomes unwieldy.

### Lifetime rule

If descendants may reuse scratch, copy all surviving values to owned scalars or stable storage before descent.

---

## M05 — Use indexed records for large fixed-schema populations

**Applies:** E0-E2  
**Stability:** STABLE / PLATFORM-SENSITIVE for layout

### Admission

Many hot records share a fixed schema and are addressed/traversed by identity or relation.

### Method

Use stable indices and explicit storage such as:

```text
state[node]
value[node]
firstEdge[node]

edgeTarget[edge]
edgeNext[edge]
edgeKind[edge]
```

Prefer structure-of-arrays when hot loops touch only a subset of fields across many records. Consider compact array-of-struct-like storage when operations consume most fields together.

Separate cold metadata from hot fields.

### Reject

- converting to indexed storage only to immediately rebuild objects for every consumer;
- packing fields so tightly that extraction, alignment, or update cost exceeds memory/locality savings.

---

## M06 — Use semantic coordinates for identity; use addresses only for lookup

**Applies:** E0-E2  
**Stability:** STABLE

### Method

If identity is not intrinsically textual or object-reference based, normalize it to stable integer symbols or fixed-width semantic coordinates.

A hash, slot, pointer, queue ID, worker-local ID, or array index MAY locate a candidate. It MUST NOT substitute for semantic equality unless the domain says they are the same thing.

### Text case

When text is the actual semantic data, use the string/buffer primitive that best preserves it. Do not invent a numeric symbol layer that forces conversion back to text on every use.

---

## M07 — Precompute small immutable relations

**Applies:** E0-E2  
**Stability:** STABLE

### Admission

A relation is immutable, bounded, and cheap enough to store compared with reconstructing it.

### Method

```text
input index -> prepared result / offset / mask / handler class
```

Validate the table once during preparation.

### Examples

- cell -> bit mask;
- token class -> transition;
- opcode -> handler class;
- reflection/canonical transform;
- finite incidence -> offset/span.

### Falsifier

If direct arithmetic is cheaper and clearer than the extra load, keep the arithmetic. "Table lookup" is not inherently faster.

---

## M08 — Use exact hash indexes, never hash identity

**Applies:** E1-E2  
**Stability:** STABLE

### Method

```text
hash semantic coordinates
    -> locate candidate slot
    -> compare authoritative coordinates
    -> return stable entry index
```

For sealed hot tables:

- growth/rehash belongs outside E0/E1;
- collision handling remains exact;
- hot probes do not materialize temporary key strings/objects when coordinates already exist.

Prefer direct indexing for small dense domains.

---

## M09 — Preserve useful numeric representation; do not cargo-cult signedness tricks

**Applies:** E0-E1  
**Stability:** V8-SENSITIVE

### Admission

A numeric recurrence is dominant and a representation transition, boxing event, or conversion is actually part of the cost.

### Method

Keep numeric semantics stable:

- integer-only state remains integer-only when the domain permits;
- floating state remains floating when fractions are required;
- avoid repeated coercion solely for presentation;
- keep fixed-width storage at storage/native boundaries when its width is semantically useful.

### Node 26/V8 14.6 note

Modern V8 can track/unbox several numeric representations, and that machinery continues to evolve. A source expression such as `>>> 0` is not by itself proof of a faster or slower carrier.

### Required evidence

Signed/unsigned carrier tricks, Smi-range engineering, or boxing-avoidance claims MUST be runtime-profile-specific and justified by generated/runtime evidence or a controlled counterexample.

---

## M10 — Choose Array, TypedArray, and Buffer by representation contract

**Applies:** E0-E2  
**Stability:** V8-SENSITIVE / NODE-STABLE for Buffer semantics

### Use TypedArray when

- fixed-width numeric representation is load-bearing;
- SharedArrayBuffer is required;
- contiguous binary layout matters;
- native/WASM/FFI interop matters;
- explicit width/sign behavior matters.

### Use Buffer when

- Node byte/string/I/O semantics are load-bearing;
- native-backed encoding/decoding/I/O operations match the operation.

### Use normal Array when

- dynamic packed append/local collection semantics are appropriate;
- values are ordinary JS values;
- binary/shared representation is not required.

### V8 cautions

- `new Array(n)` starts holey; do not use it as an automatic preallocation trick;
- avoid accidental sparse far-index writes;
- avoid repeated out-of-bounds reads on hot sites;
- avoid uncontrolled element-kind mixing.

Current V8 has special-case improvements such as `Array.prototype.fill`; keep such details in the runtime profile, not stable core.

---

## M11 — Eliminate repeated allocation only when the aggregate is unnecessary

**Applies:** E0-E2  
**Stability:** STABLE

Inside repeated execution, question:

- temporary object literals;
- array/object spread clones;
- intermediate `map`/`filter` results;
- fresh Set/Map used only as scratch;
- closures created per item;
- Promise creation for semantically synchronous work;
- repeated views over unchanged memory.

Replacement order:

1. no materialization at all;
2. scalar locals/direct predicate;
3. prepared constant;
4. caller-owned scratch;
5. indexed arena;
6. natural resource reuse.

Do not preserve the old allocation merely because an object is small.

---

## M12 — Pool only resources with a real reusable lifetime

**Applies:** E0-E3  
**Stability:** STABLE

### Admission

The resource is expensive to create/initialize, reuse avoids material work, and ownership has a clear release point.

Good candidates may include:

- worker threads;
- native handles;
- large backing stores with controlled ownership;
- prepared parser/compiler state;
- buffers whose downstream lifetime is known.

### Not sufficient

"Allocation count went down" is not an admission argument.

### Reject

Generic pools of short-lived JS objects without evidence. They can increase retention, old-generation pressure, reset cost, aliasing, and memory footprint.

### Buffer-specific rule

Before building a custom small-buffer pool on Node, account for Node's existing Buffer pool and downstream retention semantics.

---

## M13 — Prepare and seal capacity when hot growth is not semantic

**Applies:** E0-E2  
**Stability:** STABLE

### Method

1. estimate/reserve capacity;
2. widen index/reference representation before large growth if needed;
3. rehash/rebuild outside hot recurrence;
4. enter sealed mode;
5. make overflow explicit;
6. leave sealed mode only after recurrence unwinds.

A sealed hot path SHOULD exit to colder control rather than silently reallocating a large backing store.

### Falsifier

If growth is itself the semantic operation or demand is genuinely unbounded, use an amortized dynamic structure instead of pretending capacity is fixed.

---

## M14 — Make arena reuse generation-safe

**Applies:** E1-E3  
**Stability:** STABLE

Reusable indexed slots should carry enough state to reject stale references.

Typical model:

```text
(slot, generation)

FREE -> RESERVED -> LIVE -> COMPLETE/RETIRED -> FREE(next generation)
```

A stale queue entry MUST NOT silently target a new occupant.

Generation width MUST have an explicit wrap strategy if wrap is reachable.

---

## M15 — Construct derived facts once at the best owner

**Applies:** E0-E2  
**Stability:** STABLE

Examples:

- line-start indexes;
- normalized class metadata;
- reflection transforms;
- incidence masks;
- landing-cell metadata;
- canonical orientation;
- exact encoded lengths;
- parser/schema specialization.

Choose an owner whose lifetime matches the fact.

Do not memoize blindly: if maintaining the cache costs more than rare recomputation, compute on demand.

---

## M16 — Never materialize structure to rediscover structure

**Applies:** E0-E2  
**Stability:** STABLE

Reject:

```text
structured value
    -> string/bytes/object clone
    -> regex/indexOf/split/parser/scan
    -> structure/projection
```

when the required coordinates or projection already exist.

This applies equally to semantic objects, parser state, protocol records, graph state, and scheduler state.

---

## M17 — Split fast and slow paths by proven frequency/semantics

**Applies:** E0-E2  
**Stability:** STABLE

Place the common already-qualified case on a direct path. Route malformed/uncommon/general cases to a slower path where semantics permit.

Move out of the common path:

- verbose error construction;
- compatibility conversion;
- rare proof/metadata handling;
- heavyweight validation already established by an owner.

Do not duplicate a large body solely to remove one cheap branch unless the split is admitted by code-size and profile evidence.

---

## M18 — Consume exact simplifying facts before general transforms

**Applies:** E0-E2  
**Stability:** STABLE

Preferred dependency order:

```text
cached/exact terminal/empty/singleton/forced/degenerate fact
    -> return or specialize
    -> general transform only if still live
```

Do not normalize, canonicalize, allocate, encode, hash, or schedule state that an earlier exact fact makes dead.

---

## M19 — Choose iteration by required work, not syntax folklore

**Applies:** E0-E2  
**Stability:** V8-SENSITIVE

### Direct counted loop is preferred when

- numeric index is required;
- no callback/iterator semantics are required;
- early exit or fused multi-field work is central;
- the loop operates directly over prepared arrays/typed arrays.

### for-of / forEach may remain when

- current V8 optimizes the actual collection path adequately;
- no material callback/allocation cost matters;
- semantic/tamper-resistance requirements permit the iterator machinery;
- rewriting does not remove meaningful work.

### map/filter/reduce

Do not use them to build an intermediate result that the consumer immediately discards. If the returned collection is itself required, allocation is semantic rather than accidental.

### Node-core caveat

Node core sometimes avoids user-mutable builtins/iterators for primordial integrity. Do not misreport that semantic/security constraint as generic V8 speed evidence.

---

## M20 — Keep hot signatures and code size specialization-friendly

**Applies:** E0-E1  
**Stability:** V8-SENSITIVE

Prefer fixed, stable argument/return families when the operation naturally has them.

Avoid:

- needless rest-array creation where fixed arity is known;
- one call site mixing unrelated roles;
- unstable return families that force repeated downstream dispatch;
- giant generic functions whose uncommon cases inflate hot code;
- excessive specialization/code generation that explodes code size and warm-up.

A small call-site split can help; hundreds of specialized variants can hurt. The threshold is profile/workload dependent.

---

## M21 — Control closure and lexical-environment creation

**Applies:** E0-E2  
**Stability:** V8-SENSITIVE

Do not create a closure per iteration/request when the callable can be prepared once.

If a helper's lexical capture changes the hot function's context allocation or inlining behavior, move or restructure the helper.

Do not assume a closure is expensive solely because it is a closure; the load-bearing issue is repeated allocation/capture/escape or optimizer effect.

---

## M22 — Split validation from trusted internal primitives only with provenance

**Applies:** E0-E2  
**Stability:** STABLE

External/public route:

```text
validate type / range / ownership / state
    -> trusted primitive
```

Internal route:

```text
own/prove invariant
    -> trusted primitive
```

A trusted primitive MUST document where each unchecked precondition is established.

Do not remove validation globally.

### Falsifier

If the split adds more calls/code than checks it removes, or provenance is difficult to maintain, keep validation inline.

---

## M23 — Prefer mutate/undo to clone/replay for local reversible search

**Applies:** E0-E2  
**Stability:** STABLE

When exact restoration is simple:

- maintain compact mutable state;
- record minimal undo information;
- apply;
- recurse/evaluate;
- restore with guaranteed cleanup.

Do not deep-clone/replay per child merely for implementation convenience.

A portable replay representation MAY still be correct at worker/process/persistence boundaries.

---

## M24 — Collapse deterministic outdegree-one execution before scheduling

**Applies:** E0-E2  
**Stability:** STABLE

If exact semantics establish one unresolved successor:

```text
outdegree == 1
    -> direct descent
```

There is no scheduling choice to arbitrate.

A semantic occurrence MAY still need to become visible to another owner. Visibility does not require queueing and reclaiming the same work unless the coordination contract requires it.

---

## M25 — Use the narrowest priority structure that expresses the policy

**Applies:** E2  
**Stability:** STABLE

When scheduling priority can be quantized or factored, prefer:

```text
bounded priority bands
+ compact subrank/key
+ integer work IDs
+ preallocated queue/ring/indexed storage
```

over an object heap/tree by default.

Use a general heap/tree when the policy genuinely requires a large total order and the extra comparison/maintenance cost is justified.

Keep policy computation separate from claim mechanics when possible.

---

## M26 — Represent high-frequency shared claims as explicit numeric state

**Applies:** E2-E3  
**Stability:** NODE-STABLE

For SharedArrayBuffer-backed coordination, a typical lifecycle is:

```text
FREE -> RESERVED -> READY -> CLAIMED -> COMPLETE/RETIRED
```

Use integer state and generation/liveness fields.

The exact transitions are domain-specific; do not copy this state machine if fewer states suffice.

Avoid per-claim:

- Promise creation for synchronous coordination;
- manager RPC;
- structured-clone objects;
- rich queue traversal.

---

## M27 — Design the synchronization protocol before minimizing Atomics

**Applies:** E2  
**Stability:** STABLE / PLATFORM-SENSITIVE

Shared-memory correctness comes first.

For every shared field, identify:

- writer(s);
- reader(s);
- publication point;
- liveness/ABA protection;
- synchronization operation;
- whether ordinary non-atomic accesses can race.

After the protocol is correct, reduce:

- atomic operation count;
- contended writers;
- retry loops;
- wakeups;
- centralized synchronization.

Do not replace required synchronization with racy ordinary accesses to save instructions.

---

## M28 — Design shared layout for coherence traffic, not just byte count

**Applies:** E2  
**Stability:** PLATFORM-SENSITIVE

Identify which cores write which fields.

Separate frequently written independent words when sharing a cache line creates false sharing. Keep mostly-read fields distinct from churn-heavy counters when practical.

Prefer:

- worker-local accumulation;
- batched/infrequent publication;
- partitioned queues/bands;
- read-mostly global metadata.

Do not hard-code a cache-line size into a portable format without a platform profile or padding strategy.

---

## M29 — Reuse worker threads; tune task granularity and queue pressure

**Applies:** E3  
**Stability:** NODE-STABLE

For CPU-intensive repeated work:

- create/warm a bounded worker pool outside the repeated task path;
- avoid Worker creation/termination per task;
- retain worker-local prepared state when bounded/useful;
- choose task quantum large enough to amortize dispatch;
- tune queue pressure so workers neither starve nor accumulate unbounded pending work.

There is no universal ideal queue size or thread count.

Workers are not a generic accelerator for I/O already handled asynchronously by Node/libuv.

---

## M30 — Make worker transport ownership explicit

**Applies:** E2-E3  
**Stability:** NODE-STABLE

Every transported payload SHOULD be classified:

```text
shared       SharedArrayBuffer-backed; both sides can access
transferred  ownership moves; sender views become unusable
cloned       structured clone produces independent data
copied       explicit application copy
indexed      integer reference into already-shared/prepared state
```

Prefer an integer/indexed reference for very frequent coordination when the authoritative payload already lives in shared/prepared storage.

### Buffer caution

A Buffer is not automatically transferable. Pooled Buffer backing stores may be non-transferable and cloned, potentially copying more memory than the visible slice.

### Reject

Calling a transport "zero-copy" without proving ownership and backing-store behavior.

---

## M31 — Choose native/WASM/FFI by boundary economics

**Applies:** E0-E3  
**Stability:** STABLE decision rule; realization-specific submethods follow

Candidate mechanisms include:

1. optimized JavaScript / existing Node-V8 builtin;
2. generated/prepared JavaScript specialization;
3. WebAssembly;
4. Node-API addon;
5. direct Node/V8 embedder/core integration including Fast API;
6. experimental `node:ffi`.

There is no universal speed ordering.

Evaluate:

- per-call crossing/marshalling;
- copies and encoding;
- input/output materialization;
- batch size;
- native work per crossing;
- ABI/runtime stability;
- deployment/permission surface;
- lifetime/ownership;
- whether JS result construction remains dominant.

If the work is tiny, crossing may dominate. If result materialization dominates, native arithmetic may not matter.

---

## M32 — Prefer Node-API for stable native addons

**Applies:** E3 / native boundary  
**Stability:** NODE-STABLE

When a project needs a compiled addon and ABI stability across Node releases matters, Node-API is the default stable interface.

Keep native state in native storage when that is semantically appropriate; avoid bouncing fine-grained values through the JS/native boundary repeatedly.

Batch operations when crossing cost is material.

Use direct V8/Node APIs only when the project deliberately accepts version coupling for capabilities/performance unavailable through Node-API.

---

## M33 — Use V8 Fast API only with fast-path admission proof

**Applies:** E0-E2 native boundary  
**Stability:** V8-SENSITIVE / Node-core or embedder integration

A Fast API callback is admitted when:

- native call overhead is material relative to function body;
- hot arguments fit a fast signature;
- the JS caller reaches optimized code;
- a conventional slow implementation remains correct.

Required qualification:

- force/observe optimization in a representative test;
- verify the fast callback is actually taken where tooling permits;
- verify slow-path fallback for non-matching arguments.

Do not add a Fast API variant to an expensive native operation whose body already dwarfs call overhead.

Do not assume Node-core internal binding mechanisms are a supported generic userland addon API.

---

## M34 — Treat node:ffi as experimental unsafe execution machinery

**Applies:** E2-E3 native boundary  
**Stability:** EXPERIMENTAL / PLATFORM-SENSITIVE

On the Node 26 reference profile, `node:ffi` is experimental.

A conforming FFI use MUST record:

- exact symbol signature/ABI;
- supported architectures;
- library and callback lifetime;
- pointer ownership;
- backing-store stability;
- string/buffer marshalling;
- permission requirements;
- generic fallback vs Fast FFI eligibility;
- crash/corruption failure surface.

Strings passed through pointer-like string conversion may be copied. Buffer/ArrayBuffer views may borrow backing memory only for the call lifetime. Fast FFI signature limits differ by architecture.

FFI MUST NOT be selected simply to avoid writing an addon.

---

## M35 — Keep diagnostics off the success-frequency path

**Applies:** E0-E3  
**Stability:** STABLE

Hot instrumentation MAY update:

- integer counters;
- compact event codes;
- preallocated ring samples;
- indices;
- timestamps when timestamp cost is itself acceptable.

Move cold:

- `console.*`;
- JSON;
- symbol/name expansion;
- stack/message construction;
- file/network reporting;
- heavyweight heap/process snapshots.

Sampling MUST be bounded and its perturbation stated.

---

## M36 — Choose the cheapest introspection API that satisfies the question

**Applies:** E2-E3 diagnostics  
**Stability:** NODE-SENSITIVE

Do not assume process/runtime introspection is O(1) or cheap.

On the Node 26 profile, full `process.memoryUsage()` may iterate process pages and be slow. If only RSS is required, `process.memoryUsage.rss()` is documented as faster.

General rule:

```text
question
    -> minimum sufficient metric
    -> lowest-frequency collection that still answers it
```

Do not collect a rich snapshot merely because one field will later be read.

---

## M37 — Lay out hot data for working-set locality

**Applies:** E0-E2  
**Stability:** STABLE / PLATFORM-SENSITIVE

Keep frequently co-read fields and sequentially traversed data compact enough to reduce cache/TLB working set.

Move cold/rare fields away from dominant scans where practical.

Prefer flat indices over pointer-rich object graphs when the relation is large and traversal-dominant.

Do not overpack when bit extraction, unaligned access, or conversion costs more than bytes saved.

---

## M38 — Specialize only after semantic narrowing

**Applies:** E0-E2  
**Stability:** STABLE

A specialized operation MUST have an admission proof owned by an earlier stage.

Examples:

```text
general transition can return A/B/C
upstream proof excludes C
    -> A/B specialization
```

```text
public operation accepts arbitrary index
internal owner proves valid in-range index
    -> trusted indexed primitive
```

Keep the general/public path for callers that lack the proof.

Do not test the excluded condition again inside the specialization.

---

## M39 — Remove obsolete work before optimizing it

**Applies:** all  
**Stability:** STABLE

Before optimizing a local mechanism, check whether the target architecture removes its ownership boundary entirely.

Examples:

- optimizing central child reconstruction when workers become producers;
- optimizing serialization when the new interface passes structure directly;
- optimizing an object graph that will become a numeric arena;
- tuning a queue operation that deterministic descent removes.

Structural elimination dominates a faster obsolete operation.

---

## M40 — Prefer an existing optimized builtin until a narrower method is admitted

**Applies:** E0-E3  
**Stability:** V8-SENSITIVE / NODE-STABLE

Candidate builtins include Buffer/string operations, TypedArray methods, crypto/compression primitives, and optimized collection operations.

Before replacing one with hand-written JavaScript:

1. identify the builtin's unavoidable work;
2. identify the narrower domain the replacement exploits;
3. show that the replacement removes that work;
4. ensure the generic path is not regressed by inserting the specialization in its body.

A common safe pattern is caller-level routing:

```text
cheap admission test
    -> narrow specialized operation
otherwise
    -> existing builtin/general operation
```

This avoids bloating the generic builtin wrapper/path.

---

## M41 — Derive exact size, allocate once, write once

**Applies:** E0-E2 writers/encoders  
**Stability:** STABLE

### Admission

The exact output length follows cheaply from information the writer already has or must compute.

### Method

```text
prepare/encode required values once
derive exact total length
allocate exact output
write each value once
assert final offset == length at a safety boundary
```

### Avoid

- dry-run serialization only to learn length;
- encoding the same string/value once for sizing and again for output;
- heuristic grow/copy when exact size is already known.

### Falsifier

For streaming output or formats whose size cannot be known without repeating expensive work, prefer streaming/chunked growth.

---

## M42 — Compile stable structure once when repeated interpretation is the cost

**Applies:** COLD preparation -> E0-E2 execution  
**Stability:** STABLE concept / V8-SENSITIVE realization

Good candidates:

- schemas;
- grammar tables;
- serializers;
- validators;
- protocol layouts;
- fixed expression plans.

Pattern:

```text
trusted/prevalidated structure
    -> compile/generate specialized function/table once
    -> reuse many times
```

Admission requires enough reuse to amortize compilation/warm-up.

Control:

- generated code size;
- number of variants;
- cache key correctness;
- fallback/general path;
- source trust/code-injection risk;
- runtime policy that may forbid dynamic code generation.

Standalone pre-generated code can remove runtime `Function`/eval requirements when deployment policy needs it.

---

## M43 — Stop optimizing below an unavoidable materialization boundary

**Applies:** all  
**Stability:** STABLE

If the semantic result requires expensive JS strings, Dates, object graphs, copies, or external I/O, identify whether those costs dominate.

Do not move arithmetic to native/WASM or micro-optimize a parser if every result still pays the same dominant materialization cost.

Instead consider:

- returning a different representation when API semantics permit;
- streaming instead of retaining;
- lazy materialization;
- avoiding unused fields;
- batching the boundary;
- leaving irreducible product cost alone.

This is the antidote to locally impressive but end-to-end irrelevant optimizations.

---

## M44 — Keep every engine trick attached to a realization record

**Applies:** all V8-SENSITIVE / PLATFORM-SENSITIVE methods  
**Stability:** STABLE meta-rule

Record:

```text
NEES method:
Node:
V8:
OS:
architecture:
semantic boundary:
expected runtime/machine mechanism:
admission condition:
falsifier:
requalification trigger:
evidence:
```

Examples of requalification triggers:

- Node/V8 major update;
- architecture change;
- new builtin implementation;
- API stability change;
- native ABI change;
- generated-code/deopt behavior changes;
- workload moves the dominant cost elsewhere.

Do not let a successful local trick become an undocumented universal rule.
