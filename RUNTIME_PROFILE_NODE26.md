# NEES Runtime Profile — Node.js 26 / V8 14.6 family

**Profile ID:** `node26-v8-14.6`  
**Status:** Draft 0.3 reference profile  
**Last research pass:** 2026-09-20  
**Target baseline:** Node.js 26.x; exact projects SHOULD record `process.version`, `process.versions.v8`, OS, and architecture.

This profile contains realization facts that are intentionally kept out of the stable NEES core. They may change between Node/V8 releases.

Node.js 26.0.0 shipped V8 14.6.202.33. Node 26.9.0 is the current Node 26 release at this research checkpoint. Patch releases may carry V8 patches, so an exact conformance record SHOULD capture the actual runtime rather than assuming every Node 26 binary is identical.

Primary release source: [Node.js 26.0.0](https://nodejs.org/en/blog/release/v26.0.0).

## 1. V8 compilation model

Modern V8 is a tiered engine. The relevant architectural fact for NEES is not a fixed tier-up threshold; it is that optimized code is generated from runtime feedback and those compiler internals continue to evolve.

Current public architecture includes Ignition/Sparkplug, Maglev as a mid-tier optimizing compiler, and the top-tier pipeline using Turboshaft in substantial portions of the backend. V8's March 2025 architecture write-up documents the continuing migration away from the older Sea-of-Nodes backend.

Sources:

- [Maglev](https://v8.dev/blog/maglev)
- [Leaving the Sea of Nodes](https://v8.dev/blog/leaving-the-sea-of-nodes)

### Profile consequence

Do not encode historical rules such as "all polymorphism is bad", "try/catch prevents optimization", or fixed inlining/tier thresholds into NEES core.

For Node 26, optimize for stable feedback and inspect actual optimization behavior when a claim about inlining, boxing, or deoptimization is load-bearing.

## 2. Object properties and arrays

V8 still uses hidden-class/Map-style object shape information and specialized element representations.

Current durable cautions include:

- repeated hot property deletion can force dictionary-like property handling;
- array element kinds matter;
- holes and out-of-bounds accesses can change the optimized access path;
- the value/type history of a numeric field can affect representation feedback.

V8 also continues to improve exceptions. For example, the elements-kinds guidance now notes a modern `Array.prototype.fill` transition exception that older "holey is forever" summaries did not contain.

Sources:

- [Fast properties](https://v8.dev/blog/fast-properties)
- [Elements kinds](https://v8.dev/blog/elements-kinds)
- [Mutable heap numbers](https://v8.dev/blog/mutable-heap-number)

### Profile consequence

Treat shapes and elements kinds as feedback/representation concerns, not as a reason to ban normal objects or arrays.

Do not claim an exact monomorphic/polymorphic threshold without current evidence from the target runtime.

## 3. Allocation and garbage collection

V8 uses a generational collector. Short-lived objects allocated in the young generation can be cheap; objects that survive collections create copying/promotion/tracing costs.

Source: [Trash talk: the Orinoco garbage collector](https://v8.dev/blog/trash-talk).

### Profile consequence

NEES-EXTREME still eliminates avoidable E0 allocation because allocation rate, GC frequency, object initialization, write barriers, and product garbage can dominate real workloads.

However, do not introduce generic JavaScript object pools merely to reduce allocation count. Pooling can extend lifetime, retain memory, create reset work, and increase aliasing. Pool resources only when ownership and measured lifetime economics justify it.

## 4. Worker threads

`node:worker_threads` is stable. Node documents Workers as useful for CPU-intensive JavaScript and explicitly recommends a pool rather than creating a Worker per task because creation overhead can exceed the benefit.

Source: [Worker threads](https://nodejs.org/api/worker_threads.html).

### Profile consequence

- prepare/warm worker pools outside E0-E2;
- use task granularity that amortizes dispatch;
- do not offload ordinary asynchronous I/O merely to "use more cores";
- preserve diagnostic correlation with `AsyncResource` when that semantic/tooling requirement exists.

Production pool evidence from Piscina also shows that queue capacity, worker lifetime, Atomics mode, and queue pressure are workload-dependent rather than universal constants: [Piscina](https://github.com/piscinajs/piscina).

## 5. SharedArrayBuffer and transfer semantics

Node worker messages distinguish sharing, transferring, and cloning:

- `SharedArrayBuffer` memory is shared across workers;
- transferring an owned `ArrayBuffer` invalidates sender-side views;
- many pooled `Buffer` backing stores are not transferable and are cloned instead;
- cloning a pooled Buffer can copy the entire Buffer pool, not merely the visible slice.

Source: [Worker threads — transfer considerations](https://nodejs.org/api/worker_threads.html#considerations-when-transferring-typedarrays-and-buffers).

### Profile consequence

A NEES transport design MUST name ownership:

`shared | transferred | cloned | copied`

and MUST NOT call a path "zero-copy" merely because the source value is a Buffer/TypedArray.

## 6. Atomics and the ECMAScript memory model

SharedArrayBuffer correctness is governed by the ECMAScript memory model. Race-free shared programs have sequentially consistent behavior; ordinary shared accesses involved in data races do not become safe simply because Atomics are used elsewhere.

Source: [ECMAScript memory model](https://tc39.es/ecma262/multipage/memory-model.html).

### Profile consequence

Use the minimum shared synchronization protocol required by correctness. Minimize shared writes, retry loops, and contention, but do not replace synchronization with racy ordinary accesses.

## 7. Buffer allocation

Node 26.3.0 raised the default `Buffer.poolSize` from 8192 to 65536 bytes. With the default pool, small `Buffer.allocUnsafe()` allocations below half the pool size are sliced from Node's internal pool. Node 26.8.0 added an optional alignment argument to `Buffer.allocUnsafe()` and `Buffer.allocUnsafeSlow()`.

Source: [Buffer](https://nodejs.org/api/buffer.html).

### Profile consequence

- do not build a custom small-buffer pool merely because allocation sounds expensive;
- first account for Node's existing pool;
- use `allocUnsafe` only when every exposed byte is definitely overwritten before observation;
- if exact output length is derivable, prefer exact allocation over heuristic grow/copy;
- alignment is available when a native/SIMD/ABI use case actually requires it; alignment alone is not a speed guarantee.

## 8. Native addon choices

Node documents three addon routes and recommends Node-API for stable addons. Node-API is ABI-stable across Node versions within its contract. Direct V8/Node/libuv APIs do not carry the same ABI stability.

Sources:

- [C++ addons](https://nodejs.org/api/addons.html)
- [Node-API](https://nodejs.org/api/n-api.html)

### Profile consequence

Node-API is the default stable addon mechanism when an addon is required.

Direct V8/Node internal APIs are a version-coupled choice and MUST be documented as such.

## 9. V8 Fast API calls

Node core documents V8 Fast API callbacks as a way for optimized JIT code to call selected C++ callbacks with less generic `v8::Value` marshalling. A fast signature has an associated conventional slow implementation, and calls that do not fit the fast signature fall back to the slow path.

Node's own documentation also warns that expensive native functions may not benefit because their body already dwarfs call overhead.

Source: [Adding V8 Fast API callbacks](https://github.com/nodejs/node/blob/main/doc/contributing/adding-v8-fast-api.md).

### Profile consequence

A Fast API optimization MUST prove:

- the function is actually eligible for the fast signature on the target path;
- the fast path is actually reached after optimization;
- the removed call overhead matters to the operation;
- the slow path remains semantically correct.

Treat this primarily as a Node-core/embedder mechanism unless the project deliberately owns that level of integration.

## 10. Experimental `node:ffi`

Node 26.1.0 added experimental `node:ffi`. It is explicitly unsafe: incorrect pointers, signatures, or lifetimes can crash or corrupt the process. It is also permission-gated when the Node Permission Model is active.

Current Node 26 documentation specifies that:

- strings passed as FFI string/pointer-like arguments are copied to temporary NUL-terminated UTF-8 storage;
- Buffer/ArrayBuffer/typed-array pointer-like arguments borrow backing memory for the duration of the call;
- that backing memory must not be resized, transferred, detached, or invalidated during the call;
- optimized Fast FFI has architecture-specific signature limits and otherwise falls back to generic FFI.

Sources:

- [FFI](https://nodejs.org/api/ffi.html)
- [Node 26.1.0 release](https://nodejs.org/en/blog/release/v26.1.0)
- [Permissions](https://nodejs.org/api/permissions.html)

### Profile consequence

`node:ffi` is EXPERIMENTAL in this profile. It MUST NOT be selected solely because it appears to be a convenient "native fast path".

A NEES FFI use requires an ABI, lifetime, permission, platform, fallback, and marshalling record.

## 11. Process introspection

Node documents `process.memoryUsage()` as iterating over process pages and potentially being slow depending on allocations. `process.memoryUsage.rss()` returns the RSS value through a faster route.

Source: [Process](https://nodejs.org/api/process.html#processmemoryusage).

### Profile consequence

Do not put full `process.memoryUsage()` on E0-E2 success paths. Sample or move it cold unless the measurement itself is the required operation.

## 12. Async context and diagnostics semantics

Node 26 documents `AsyncLocalStorage` as the preferred, optimized, memory-safe mechanism for async context tracking. The lower-level `createHook` / `AsyncHook` APIs are experimental and explicitly carry usability, safety, and performance implications.

Sources:

- [Asynchronous context tracking](https://nodejs.org/api/async_context.html)
- [Async hooks](https://nodejs.org/api/async_hooks.html)

### Profile consequence

If async context propagation is required semantics, do not invent a custom context mechanism or reject `AsyncLocalStorage` merely because it is high-level. Start from the supported optimized primitive and specialize only with a concrete reason.

Do not enable broad async-hooks observation on an extreme path merely for convenience; use the narrowest diagnostic/context API that answers the requirement.

## 13. Profile requalification triggers

Requalify affected methods when any of these change:

- Node major version;
- V8 major/family;
- target architecture or ABI;
- Worker transport design;
- use of experimental Node APIs;
- Buffer allocation semantics relied upon by the implementation;
- a load-bearing V8 optimization assumption.

An exact production profile SHOULD record the actual runtime tuple, for example:

```text
Node: v26.9.0
V8: <process.versions.v8>
OS: linux
arch: x64
NEES profile: node26-v8-14.6
```
