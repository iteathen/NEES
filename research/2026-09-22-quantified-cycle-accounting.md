# Draft 0.5 rationale — quantified execution cost accounting

Date: 2026-09-22

## Problem

NEES Draft 0.4 requires maximal-effort treatment of total machine cost but leaves operation cost mostly qualitative. That is sufficient for many structural decisions but weak for comparing small hot-path realizations whose differences can be expressed as machine operations.

A statement such as "this is one cheap add" is not durable evidence unless the runtime/CPU profile and source-to-machine mapping are explicit.

## Decision

Draft 0.5 adds a quantified execution-cost subsystem:

- versioned runtime/CPU cost profiles;
- semantic operation IDs;
- fixed, ranged, symbolic, and unbounded cycle models;
- composable function ledgers;
- a deterministic reference calculator;
- repository verification of the accounting fixture.

The system is general NEES infrastructure. It is not tied to JSMinsys or Connect4.

## Non-decision

NEES does not equate an additive cycle ledger with exact wall-clock time.

Out-of-order execution, dependency chains, instruction throughput, cache/TLB behavior, branch prediction, allocation/GC, synchronization/coherence, and runtime/JIT behavior remain part of the governing total-machine-cost objective.

A lower local ledger is not authority to damage a superior composite optimization.

## Initial platform profile

The first experimental profile binds:

```text
Node 26 / V8 14.6
x86-64
AMD Zen 3
```

The profile is intentionally partial. It establishes the schema and seed operation set rather than claiming to catalog all JavaScript behavior.

## Evidence

- AMD EPYC 7003 microarchitecture documentation establishes Zen 3 and its cache hierarchy.
- uops.info provides current measured instruction latency/throughput/µop evidence for the initial arithmetic operations.
- current V8 source is used where source-level numeric builtins have multiple realization paths.
- 7-cpu Zen 3 measurements provide secondary cache/branch reference values.

## Admission

Quantified accounting is appropriate when the modeled path can be decomposed into operations whose profile binding is specific enough to inform a decision.

## Falsifier

The ledger is incomplete evidence if:

- generated code does not match the assumed mapping;
- an important cost is missing;
- cache/branch/contention assumptions do not match the workload;
- reliable measurement at the governing optimization unit contradicts the model.

In those cases the ledger/profile must be corrected rather than promoted over the stronger evidence.

## Requalification triggers

- Node/V8 family change;
- CPU microarchitecture change;
- generated-code change;
- load-bearing cache/branch/atomic assumption change;
- evidence that a cost-profile entry no longer describes the realized path.
