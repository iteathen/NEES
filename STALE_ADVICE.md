# NEES Stale-Advice Firewall — Draft 0.2

This document records common performance statements that MUST NOT be treated as unconditional NEES rules.

Its purpose is not to say that the corresponding technique is never useful. It prevents agents from turning old engine folklore or one-workload wins into universal methods.

## 1. "Every hot call site must be monomorphic"

**NEES stance:** false as a blanket rule.

Modern V8 has multiple optimizing tiers and can handle bounded stable polymorphism. What matters is whether the dominant site remains optimizable and whether feedback keeps changing, becomes megamorphic, or causes repeated deoptimization.

**Use instead:** M02 feedback stability and M20 signature/return stability.

Primary context: [Maglev](https://v8.dev/blog/maglev).

## 2. "try/catch prevents V8 optimization"

**NEES stance:** stale.

Modern V8 compilers support exception handling in optimized code. Do not move error handling across semantic boundaries to avoid a pre-2017 limitation.

A catch path can still add code size or work if executed frequently; evaluate the actual path rather than the old prohibition.

Primary context: [Leaving the Sea of Nodes](https://v8.dev/blog/leaving-the-sea-of-nodes).

## 3. "A counted for loop is always faster than for-of/forEach"

**NEES stance:** false as a universal rule.

Current V8 has optimized Array iteration paths. Node core sometimes uses explicit loops to avoid allocation, callbacks, user-mutable iterator semantics, or for a measured local reason; those reasons must not be collapsed into "for is faster".

**Use instead:** choose the iteration form that avoids unwanted work for the declared operation. If no unwanted allocation/callback/iterator semantics exist, do not rewrite solely on syntax folklore.

Primary context: [Elements kinds](https://v8.dev/blog/elements-kinds).

## 4. "Preallocate JavaScript arrays with new Array(n) for speed"

**NEES stance:** not a default method.

`new Array(n)` creates a holey array. Current V8 has specific exceptions such as `Array.prototype.fill`, but a holey representation must not be introduced accidentally.

For fixed-width numeric storage, a TypedArray may be the semantically better representation. For dynamic packed arrays, `[]` plus append may be appropriate.

Primary context: [Elements kinds](https://v8.dev/blog/elements-kinds).

## 5. "TypedArray is always faster than Array"

**NEES stance:** false.

TypedArrays provide fixed-width contiguous numeric storage, SharedArrayBuffer compatibility, explicit representation, and native/WASM interop. They can also impose conversions/bounds semantics and are not automatically faster for every small local collection.

Choose TypedArray because its representation is load-bearing, not because "typed" sounds low-level.

## 6. "Zero allocation is always better than allocation"

**NEES stance:** false outside the scoped E0 requirement.

NEES-EXTREME removes avoidable E0 allocation because repeated allocation and product garbage can matter. But V8's generational collector is optimized for short-lived objects.

Custom object pools can extend object lifetime, increase retention, reset work, aliasing, and old-generation tracing.

**Use instead:** eliminate unnecessary allocation first; pool only resources whose reuse economics and ownership are established.

Primary context: [Trash talk: the Orinoco garbage collector](https://v8.dev/blog/trash-talk).

## 7. "Use a plain object instead of Map for performance"

**NEES stance:** no general rule.

Use a struct-like object for a small fixed property set. Use `Map` when dynamic-key map semantics are actually required unless a narrower indexed representation is available.

Do not select either one from historical microbenchmarks.

## 8. "Object.create(null) is a faster dictionary"

**NEES stance:** false as a blanket performance rule.

Prototype-free objects can be valuable for semantics/security, but current Node core contains measured hot paths where a normal object is deliberately faster.

The reason for using a null prototype MUST be semantic/security or local evidence, not cargo-cult speed.

## 9. "delete is harmless on hot objects"

**NEES stance:** still a real V8 realization risk.

Property deletion can force dictionary-style property storage. Prefer a stable field/sentinel when semantics allow.

Primary context: [Fast properties](https://v8.dev/blog/fast-properties).

## 10. "Branchless JavaScript is always faster"

**NEES stance:** false.

The JIT and CPU own final branch/select lowering, speculation, and prediction. A source-level branchless rewrite can add arithmetic, dependencies, conversions, or obscure the optimizing compiler's information.

Use branchless formulations only when generated-code/profile evidence or a structural simplification justifies them.

## 11. "Manual JavaScript byte/string handling beats Node builtins"

**NEES stance:** not a default assumption.

Node/V8 builtins evolve. Modern production evidence such as MySQL2's 2026 Node 26 work found native `Buffer` UTF-8 decoding and integer readers competitive or better than classic manual loops in broad cases, while a very narrow <=8-byte ASCII specialization won only after an explicit admission test.

**Use instead:** M40 builtin-first and M38 narrowed specialization.

Project evidence: [MySQL2 performance analysis](https://github.com/sidorares/node-mysql2/blob/master/benchmarks/perf/ANALYSIS.md).

## 12. "Native, WASM, or FFI is inherently faster"

**NEES stance:** false.

Crossing, marshalling, copying, lifetime management, and returning results to JavaScript may dominate. Native acceleration cannot remove JS object/string materialization that the semantic result still requires.

A MySQL2 parser investigation rejected WASM because the dominant remaining costs were JS materialization and GC rather than protocol arithmetic.

**Use instead:** M31 native-boundary decision and M43 dominant-cost analysis.

## 13. "A custom Buffer pool is automatically faster"

**NEES stance:** false.

Node already pools many small unsafe Buffer allocations. Custom pools also create ownership hazards when downstream async operations retain or alias buffers.

Use a custom pool only when the existing allocator is actually material and reuse has a safe lifetime protocol.

Primary source: [Buffer](https://nodejs.org/api/buffer.html).

## 14. "No strings, Maps, Sets, objects, or Promises are allowed in hot code"

**NEES stance:** not a universal language-feature rule.

A project may impose stricter local constraints where its domain admits a narrower numeric/indexed realization.

NEES itself asks a different question:

> Does this representation or mechanism carry required semantics at this frequency, or is it avoidable execution structure?

A string operation can be the optimal primitive when string content is the semantics. A Map can be appropriate for dynamic keys. A Promise is required for some asynchronous contracts. The burden is on the declared execution class and consumer semantics.

## 15. "Fast API / Fast FFI means the call is fast"

**NEES stance:** false without admission proof.

Fast-call mechanisms have signature constraints and fallback paths. A call whose native body dominates call overhead gains little from reducing marshalling.

For Node core Fast API, verify the fast callback is actually reached. For experimental `node:ffi`, account for architecture-specific fast trampoline limits and generic fallback.

Sources:

- [Node V8 Fast API guide](https://github.com/nodejs/node/blob/main/doc/contributing/adding-v8-fast-api.md)
- [Node FFI](https://nodejs.org/api/ffi.html)

## 16. "Source-level simplification proves machine-level simplification"

**NEES stance:** false.

Modern V8 may already retain a property value in a register, inline a helper, eliminate an allocation, or lower a builtin. Conversely, a seemingly small source edit can cross an inlining/code-size threshold and regress unrelated inputs.

When the claim depends on generated realization, inspect generated/runtime evidence.

## 17. Rule for adding to this file

A new entry SHOULD be added when:

- a once-common JavaScript/V8 optimization becomes obsolete;
- a NEES method is repeatedly misread as unconditional;
- a production experiment falsifies a plausible generalization;
- a Node/V8 release changes a load-bearing assumption.

The correction SHOULD point to the replacement NEES method, not merely say "benchmark it".
