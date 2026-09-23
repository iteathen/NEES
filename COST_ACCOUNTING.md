# NEES Execution Cost Accounting — Draft 0.5

NEES cost accounting provides a reproducible way to turn a declared execution path into a cycle ledger under an explicit Node/V8/CPU profile.

It is **evidence**, not a substitute for end-to-end qualification. Modern CPUs overlap independent work, memory latency depends on cache state, and locally cheaper operations can still weaken a superior composite optimization.

## 1. Purpose

A NEES cost ledger answers:

- what operations are executed;
- how often they execute;
- what each operation costs under the selected profile;
- which costs are exact, ranged, symbolic, or unbounded;
- which assumptions control memory, branch, synchronization, and runtime cost;
- what unresolved terms prevent a closed numeric estimate.

The system exists so performance reasoning can move from "this looks cheap" to an auditable quantitative model.

## 2. Hard invariant

> No operation included in a quantified NEES execution ledger may be silently assigned zero cost because its exact realization is unknown.

Every counted operation MUST resolve to one of:

- **fixed** — one cycle value;
- **range** — bounded minimum and maximum;
- **symbolic** — a named unresolved term or parameterized cost;
- **unbounded** — blocking or externally delayed execution with no finite elapsed-cycle upper bound.

Unknown cost remains visible.

## 3. Profile binding

A quantified ledger MUST identify:

- NEES runtime profile;
- Node/V8 family or exact versions when lowering matters;
- CPU architecture/microarchitecture;
- cost-profile identifier;
- relevant scenario values such as cache level, branch prediction state, or contention class.

Cost profiles are PLATFORM-SENSITIVE and source-to-native mappings are generally V8-SENSITIVE.

Changing Node/V8, architecture, microarchitecture, or a load-bearing lowering assumption triggers requalification of affected entries.

## 4. Operation identifiers

Profiles use semantic machine-cost identifiers such as:

```text
alu.add.u32
alu.imul.u32
control.test.u32
control.branch
memory.load.u32
memory.store.u32
atomic.rmw.u32
```

An adopting project MAY define additional operations. Each added operation MUST carry a cost model and evidence appropriate to its stability class.

Source syntax is not itself the authority. When a JavaScript expression is mapped to a machine-cost operation, that mapping must be supported by current runtime/compiler evidence when load-bearing.

## 5. Function ledger

A function ledger records executed operation counts rather than source-line counts.

Example:

```json
{
  "name": "exampleHotFunction",
  "operations": [
    { "op": "memory.load.u32", "count": 1 },
    { "op": "alu.add.u32", "count": 3 },
    { "op": "alu.and.u32", "count": 2 },
    { "op": "control.test.u32", "count": 1 },
    { "op": "control.branch", "count": 1 }
  ]
}
```

Loops multiply operation counts by executed iterations. Conditional paths count only the path being modeled. Short-circuit behavior must be represented honestly.

## 6. Static serial total

For path `P` under scenario `S`:

```text
C_serial(P,S) = Σ C(operation_i,S)
```

Ranges add by summing their lower and upper bounds.

Symbolic terms remain symbolic.

An unbounded operation marks elapsed-cycle upper bound as unbounded.

This additive result is a deterministic **cost ledger**, not a promise that wall-clock execution equals the sum. Out-of-order execution, instruction-level parallelism, µop fusion, port pressure, cache overlap, speculation, and dependency structure can change elapsed cycles.

## 7. Required reporting views

A quantified E0/E1 function analysis SHOULD report, when meaningful:

- operation counts;
- minimum serial-ledger cycles;
- maximum serial-ledger cycles when bounded;
- hot-L1 scenario;
- hot-L2 scenario;
- branch-predicted and branch-miss scenarios where control matters;
- unresolved symbolic terms;
- unbounded/blocking terms;
- relevant latency / reciprocal-throughput / µop evidence;
- generated-code evidence when source-to-machine mapping is load-bearing.

Later tooling MAY add critical-path and port-pressure analysis. Those refinements do not invalidate the basic operation ledger.

## 8. Memory

Memory cannot be represented by one universal cycle number.

A memory operation MUST either:

- bind to an explicit locality case such as L1/L2/L3;
- use a profile range justified by the architecture;
- remain symbolic.

DRAM, NUMA, TLB, ownership, coherence, and contention effects MUST NOT be hidden inside a cheap ALU estimate.

## 9. Branches

Branch cost MUST distinguish at least:

- predicted path;
- mispredicted path;
- unknown prediction state.

The branch body is accounted separately. A source-level branchless rewrite is not automatically cheaper; its replacement operations and dependency chain must be counted.

## 9.1 Dynamic allocation

Allocation is an admissible quantified operation when its cost is represented honestly.

A dynamic allocation MUST NOT be assigned a cheap constant merely because its source syntax is small. Its model SHOULD preserve the cost-driving parameters that apply to the runtime, including:

- requested bytes;
- object/view construction;
- backing-store allocator path;
- required zero-initialization or zero-page provisioning;
- GC/external-memory accounting;
- page commitment and page faults;
- allocator/runtime state.

When these cannot be reduced to a justified bounded cycle range, the allocation MUST remain a symbolic cycle expression rather than being treated as zero or excluded from the vocabulary.

The first reference profile defines `memory.allocate.typed.u32` as `TYPED_ARRAY_ALLOC_U32(length, typedArrayAllocationPath, pageState, gcState)`.

## 10. Atomics and blocking

Atomics carry memory-ordering, ownership, and coherence cost in addition to the arithmetic operation.

An uncontended locked-RMW reference MUST NOT be presented as the cost of a contended shared path.

Blocking operations such as `Atomics.wait` are represented as unbounded elapsed cost. Active CPU cycles and blocked elapsed time SHOULD be reported separately.

## 11. Relationship to governing optimization units

A lower cycle ledger for a local helper does not establish a NEES improvement.

The governing optimization unit remains authoritative. A candidate may have a larger local ledger but still reduce total machine cost by eliminating:

- more search/work;
- dependent loads;
- cache misses;
- allocation;
- synchronization;
- transport;
- conversions;
- downstream materialization.

The cycle ledger quantifies local and composite work; it does not replace causal qualification.

## 12. Reference implementation

Repository tools:

```sh
node tools/calculate-cost.mjs \
  cost-models/node26-v8-14.6-x86_64-amd-zen3.json \
  examples/cost-ledger-basic.json
```

The example currently resolves to 11 serial-ledger cycles under its L1/predicted-branch scenario.

Repository verification executes the same fixture.

## 13. Initial cost profile

The first experimental profile is:

```text
node26-v8-14.6/x86_64-amd-zen3
```

It is intentionally incomplete as a catalog of all JavaScript behavior. It establishes the schema and seed operation set. New operations are added as adopting scopes need them.

Evidence sources include current V8 source, AMD Zen 3 architecture documentation, uops.info instruction measurements, and cache/branch measurement references recorded in the profile and [REFERENCES.md](REFERENCES.md).

## 14. Admission and falsifier

**Admission:** use quantified cycle accounting when a hot-path comparison can be usefully decomposed into modeled machine/runtime operations under a sufficiently specific profile.

**Mechanism:** replace qualitative operation-cost claims with an explicit, additive, reviewable ledger while preserving uncertainty.

**Falsifier:** if the ledger omits a dominant causal cost, assumes an invalid source-to-machine lowering, or conflicts with reliable governing-unit measurements, it is incomplete evidence and MUST be revised rather than treated as authority.

**Requalification triggers:** Node/V8 family change, CPU microarchitecture change, generated-code change, material cache/branch/atomic assumption change, or evidence that a profile entry no longer represents the emitted path.
