# NEES Draft 0.3 — Maximal-Effort Doctrine

**Date:** 2026-09-20  
**Predecessor:** Draft 0.2 at `0294f37909e9a5b7a2202d3a9367a9e2428d47b3`  
**Scope:** meaning of NEES-EXTREME  
**Runtime claims changed:** none

## Problem

Draft 0.2 successfully prevented performance folklore from becoming normative law, but its evidence-gated language still admitted a weaker interpretation:

```text
optimize the dominant bottleneck
small isolated cost is not material
already fast enough
    ->
stop
```

That interpretation is incompatible with the intended meaning of **extreme performance**.

The evidence discipline exists to prevent changes that only *look* low-level from making execution worse. It is not permission to ignore known avoidable hot-path cost.

## Draft 0.3 doctrine

For a NEES-EXTREME E0-E2 scope:

```text
required semantics / safety / lifecycle / resource constraints
    ->
minimum realizable total machine cost
```

Every known avoidable hot-path operation remains an optimization target until it is:

- removed;
- structurally superseded;
- established as required;
- established as unavoidable on the selected profile;
- retained because removing it increases greater total cost;
- costed out against an equal-or-worse alternative;
- or explicitly preserved as unresolved debt/deviation.

The size of the cost changes **priority**, not whether the cost exists.

## Why total machine cost rather than instruction count

Elapsed machine cycles depend on more than the number of instructions.

Relevant dimensions include:

- dependency-chain latency;
- loads/stores and memory traffic;
- cache/TLB behavior;
- branch prediction;
- allocation/GC;
- boxing/conversion;
- JIT/runtime dispatch;
- synchronization/coherence;
- transport/copying;
- native/WASM/FFI boundary cost.

A change that adds instructions may still reduce total cycles when it removes a greater stall or memory dependency.

Therefore NEES-EXTREME targets the complete machine realization, not a single proxy metric.

## No fast-enough stopping condition

The standard now rejects these as independent stopping arguments:

```text
already fast
not the bottleneck
less than 1%
too small to matter
idiomatic
cleaner
```

A pass may stop because no further justified improvement is presently known, remaining work is required/unavoidable, alternatives are costed out, a structural successor supersedes the local target, or the owner deliberately defers recorded debt.

Deferral preserves the debt. It does not turn avoidable work into required work.

## Qualification cadence is unchanged

Draft 0.3 does **not** restore per-edit testing.

The coherent PR/change set remains the default qualification unit:

```text
develop coherent optimization
    ->
checkpoint reasoning/debt
    ->
targeted checks only when decision-blocking
    ->
PR qualification
```

Maximal effort describes how aggressively execution cost is pursued, not how often the full test/benchmark suite must run.

## Conformance consequence

NEES-EXTREME now requires durable disposition of known/suspected affected-scope optimization cost.

A known avoidable E0/E1 cost deliberately retained cannot be reported as plain `CONFORMS`; it is a deviation/debt item.

A suspected but not yet established cost may remain `UNVERIFIED-DEBT` while the implementation otherwise conforms, provided the uncertainty remains visible.

## Non-claim

Draft 0.3 does not claim that a conforming program is globally optimal.

It claims something narrower and enforceable:

> known and reasonably discoverable avoidable hot-path machine cost is not silently ignored.
