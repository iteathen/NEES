# NEES Conformance and Deviations — Draft 0.2

## 1. What conformance means

A subsystem conforms to NEES only when:

1. its execution scope and class are declared;
2. applicable MUST/MUST NOT rules are satisfied or explicitly deviated;
3. applicable realization methods were considered at the correct abstraction boundary;
4. stronger project semantics override performance methods where required;
5. version-sensitive methods identify their runtime/platform assumptions;
6. E0/E1 realization-sensitive choices state an admission mechanism and falsifier.

NEES conformance is an implementation-intent claim, not a speed claim.

A conforming implementation can still be slower than an alternative. Performance promotion remains a separate qualification step.

## 2. Scope declaration

A conforming subsystem MUST declare enough context to reconstruct its performance intent.

Minimum declaration:

```text
NEES: Draft 0.2
Conformance level: NEES-CORE | NEES-NODE | NEES-EXTREME
Execution classes: E0/E1/E2/E3/COLD as applicable
Runtime profile: <profile id>
Node: <major or exact version>
V8: <family or exact process.versions.v8 where relevant>
OS/arch: <when platform-sensitive>
Semantic owner: <spec/module/doc>
Hot entry points: <functions/modules>
Cold/preparation boundaries: <functions/modules>
```

A file MAY contain multiple execution classes, but the ownership boundary between them must be explicit.

## 3. Rule disposition

For every applicable normative rule, review uses one of:

- **CONFORMS** — implementation follows the rule/method.
- **NOT-APPLICABLE** — rule does not apply; reason stated.
- **DEVIATION** — rule intentionally not followed; deviation record required.
- **UNVERIFIED** — evidence is insufficient; conformance cannot be claimed.

"Looks fast", "idiomatic", "probably optimized by V8", "native", "typed", "lock-free", and "tests pass" are not dispositions.

## 4. Mechanism class

For each material E0-E2 performance decision, identify the primary mechanism class:

- **SEMANTIC** — stronger facts reduce the required state/work.
- **COMPLEXITY** — fewer asymptotic operations.
- **DERIVATION** — repeated work is computed once/reused.
- **ALLOCATION-LIFETIME** — less allocation, retention, promotion, reset, or ownership work.
- **REPRESENTATION** — narrower/fewer conversions/less machine state.
- **JIT-ENGINE** — V8 feedback, lowering, boxing, inlining, elements kind, deoptimization.
- **BUILTIN-NATIVE** — optimized builtin, addon, Fast API, FFI, WASM, SIMD.
- **CONCURRENCY** — less coordination, contention, wakeup, transport, or duplication.
- **LOCALITY** — lower cache/TLB/memory traffic or better data layout.
- **SECURITY-INTEGRITY** — tamper-resistance, permission, lifetime, or safety requirement that constrains realization.
- **DIAGNOSTIC** — observation cost is moved/sampled/reduced.

A project MAY use multiple classes, but it SHOULD NOT mislabel a security or semantic constraint as generic V8 performance advice.

## 5. Realization record

Every V8-SENSITIVE or PLATFORM-SENSITIVE E0/E1 method MUST have a realization record, either adjacent to the code/design or in a project performance authority.

```text
NEES method:
Execution class:
Mechanism class:
Semantic owner:
Admission condition:
Expected removed work / preserved runtime property:
Node:
V8:
OS/architecture:
Fallback/general path:
Falsifier:
Requalification trigger:
Evidence:
```

Examples of acceptable evidence:

- current Node/V8 primary documentation/source;
- optimization/deoptimization trace on target runtime;
- generated-code inspection;
- deterministic operation/allocation/transport counters;
- controlled negative/positive experiment;
- current production-project result with matching runtime/workload constraints.

Training-memory folklore is not evidence.

## 6. Deviation record

A MUST/MUST NOT deviation requires:

```text
Rule:
Scope:
Exact operation:
Required/default method:
Chosen method:
Semantic reason:
Why default method is unsuitable:
Execution frequency:
Representation/lifetime implications:
Node/V8/platform assumptions:
Failure/capacity behavior:
Security/permission implications:
Review owner:
Revisit trigger:
```

If the deviation depends on current engine behavior, it MUST include a runtime-version revisit trigger.

## 7. Evidence required from implementation agents

An agent changing E0-E2 code MUST report the changed operation in terms of:

- semantic quantity required;
- representation before/after;
- allocations and lifetime before/after;
- repeated derivations removed/added;
- complexity class and repeated-scan behavior;
- call-site type/shape/elements-kind implications where relevant;
- builtin/native boundary implications;
- storage growth/capacity path;
- transport/ownership/synchronization implications;
- semantic preconditions used for specialization;
- cold/hot boundary movement;
- version-sensitive assumptions;
- admission condition and falsifier.

This explanation is required even when no wall-clock benchmark is run.

## 8. Evidence hierarchy

When sources disagree, use this order unless there is a documented reason not to:

1. current semantic specification and current Node/V8 primary source;
2. direct evidence from the declared runtime;
3. current Node core implementation/benchmark evidence;
4. current production-project evidence that matches the problem shape;
5. maintained expert/agent guidance;
6. historical documents.

A newer secondary source does not override a primary source merely because it is newer. Conversely, an old primary implementation article may no longer describe current realization. State the mismatch.

## 9. Negative controls and falsification

A performance claim is stronger when the observation mechanism is shown to see the property under test.

For a structural detector:

- demonstrate that a deliberately bad/control variant changes the detector when practical.

For a runtime measurement:

- include a baseline or same-build null/control run;
- report noise/variance when it can overlap the effect;
- do not promote a change whose instrument cannot distinguish it from noise.

For a V8/JIT claim:

- verify the relevant function/path actually reaches the assumed optimized state when that assumption is load-bearing.

## 10. Deterministic detectors

Projects SHOULD convert recurring NEES failures into deterministic checks where practical.

Examples:

- allocation/materialization count;
- object-shape signature count;
- operation growth at N vs 2N;
- number of full scans/re-derivations;
- encoding/conversion count;
- queue/atomic/wakeup count;
- hot-path growth attempts;
- fallback count;
- Fast API/Fast FFI hit/fallback count;
- bytes cloned/transferred/shared;
- source-derived fact reconstruction count.

A deterministic detector is evidence only for the property it observes.

## 11. Incident learning

When a material performance defect is traced to a recurring implementation shape, the owning project SHOULD produce at least one of:

1. a new or clarified NEES method;
2. a stale-advice entry;
3. a deterministic detector;
4. a regression fixture;
5. a reviewer checklist item;
6. a runtime-profile correction.

This keeps NEES grounded in lived failures rather than generic folklore.

## 12. Runtime revisions

A Node/V8 major change does not invalidate STABLE rules.

It DOES trigger review of V8-SENSITIVE methods used by the subsystem.

A platform change triggers review of PLATFORM-SENSITIVE methods.

An experimental Node API version change triggers review of methods that depend on that API even within the same Node major.

Projects SHOULD record the exact production runtime tuple when performance is release-critical.

## 13. Conformance levels

### NEES-CORE

Conforms to stable semantic, representation, complexity, boundary, and evidence requirements.

### NEES-NODE

NEES-CORE plus applicable Node worker/Buffer/transport/native-boundary/runtime-profile methods.

### NEES-EXTREME

NEES-NODE plus all applicable E0/E1 allocation, representation, JIT stability, capacity, locality, and coordination requirements.

NEES-EXTREME does not mean "use every low-level technique". It means every applicable low-level decision is explicit and evidence-gated.

## 14. Non-goals

NEES does not require:

- eliminating all Objects/Arrays/Strings/Maps/Sets/Promises;
- using TypedArrays everywhere;
- making every call monomorphic;
- replacing for-of with counted loops;
- pooling all allocations;
- using native code;
- writing branchless code;
- avoiding try/catch;
- micro-optimizing cold setup;
- sacrificing semantic correctness;
- choosing a lower-level form when the existing builtin is already the best realization.

The governing rule is:

> Do not carry unnecessary computational, representational, allocation, coordination, or runtime generality through a declared hot path, and do not replace a good runtime realization with folklore.
