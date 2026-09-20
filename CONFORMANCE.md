# NEES Conformance and Deviations — Draft 0.4

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
NEES: Draft 0.4
Conformance level: NEES-CORE | NEES-NODE | NEES-EXTREME
Execution classes: E0/E1/E2/E3/COLD as applicable
Runtime profile: <profile id>
Node: <major or exact version>
V8: <family or exact process.versions.v8 where relevant>
OS/arch: <when platform-sensitive>
Semantic owner: <spec/module/doc>
Governing optimization unit(s): <smallest enclosing causal performance boundary>
Regression surface: <shared callers/workloads/resources plausibly affected>
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

For each E0-E2 performance decision that changes, retains, or deliberately defers hot execution structure, identify the primary mechanism class:

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

## 4.1 Causal role

Before a NEES-EXTREME E0-E2 candidate is described as avoidable, record its relationship to the enclosing optimization:

- **STANDALONE** — changing it does not materially alter a larger optimization;
- **ENABLING** — its local cost enables a larger saving;
- **COUPLED** — changing it shifts cost or behavior elsewhere in the enclosing realization;
- **UNKNOWN** — evidence is insufficient.

Causal role and cost disposition are separate. An ENABLING operation may be TRADEOFF; a STANDALONE operation may be REMOVED or COSTED-OUT.

A static finding, counter reduction, or microbenchmark win MUST NOT classify a cost as known avoidable without considering causal role.

## 5. Realization record

Every V8-SENSITIVE or PLATFORM-SENSITIVE E0/E1 method MUST have a realization record, either adjacent to the code/design or in a project performance authority.

```text
NEES method:
Execution class:
Mechanism class:
Semantic owner:
Governing optimization unit:
Causal role: STANDALONE | ENABLING | COUPLED | UNKNOWN
Regression surface:
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

## 6. NEES-EXTREME maximal-effort disposition

A NEES-EXTREME scope MUST preserve the disposition of observed or reasonably suspected E0-E2 candidate cost, including causal role where it can affect the enclosing optimization.

### Candidate-cost qualification

The existence of machine work is not sufficient to prove that the work is avoidable.

For each material candidate, determine its semantic role, causal role, governing optimization unit, regression surface, admissible replacement if any, and whether that replacement lowers total machine cost at the governing unit.

Until those questions are answered, the candidate remains **UNVERIFIED-DEBT** or another honest unresolved disposition. Do not silently upgrade "looks removable" into "known avoidable."

### Initial baseline audit

The first claim of NEES-EXTREME conformance for a declared scope MUST perform a baseline cost audit over the complete declared E0-E2 hot scope, not only the most recent diff.

That baseline establishes the durable optimization-debt/disposition surface inherited by later work.

Subsequent coherent PRs MAY limit fresh audit work to:

- the affected causal neighborhood;
- newly introduced execution mechanisms;
- inherited debt touched or invalidated by the change;
- requalification triggers crossed by the runtime/platform change.

This preserves maximal effort without re-auditing the entire system after every edit.

The affected hot-path review uses these dispositions:

- **REQUIRED** — required by semantics or another load-bearing constraint.
- **TRADEOFF** — retained because removing it increases greater total machine cost elsewhere.
- **UNAVOIDABLE-PROFILE** — unavoidable under the selected Node/V8/platform realization.
- **COSTED-OUT** — a qualified alternative is equal or worse in total machine cost.
- **REMOVED** — eliminated by the completed change.
- **SUPERSEDED** — eliminated because a structural change removes the mechanism.
- **UNVERIFIED-DEBT** — a plausible avoidable cost remains unresolved.
- **DEVIATION** — known avoidable cost is deliberately retained.

The following are not valid dispositions:

- "already fast";
- "not the bottleneck";
- "too small to matter";
- "idiomatic";
- "cleaner";
- "probably optimized";
- "no benchmark complained".

### Optimization-debt record

A NEES-EXTREME project MUST keep known unresolved E0/E1 optimization debt durable enough that a later agent does not rediscover it from scratch.

The record MAY live in code-local performance authority, issue tracking, a conformance report, or another durable project surface.

Each debt item SHOULD record:

```text
site / operation:
execution class:
governing optimization unit:
causal role:
regression surface:
cost mechanism:
current evidence:
current disposition:
why retained or unresolved:
runtime/profile:
candidate replacement or question:
revisit trigger:
owner / authority:
```

A **known avoidable** E0/E1 cost that is deliberately retained is a DEVIATION; it MUST NOT be reported as plain CONFORMS.

A merely suspected cost may remain UNVERIFIED-DEBT while the scope otherwise conforms, provided it is visible and the project has not falsely claimed that the mechanism is required or free.

### Cost magnitude

Cost magnitude determines work ordering, not whether an item exists.

A project MAY defer a 0.05% candidate behind a 20% structural problem. It MUST NOT erase the smaller candidate merely because a larger bottleneck exists.

### Maximal-effort stopping rule

A NEES-EXTREME review may close a qualification unit when the completed change is promotable and all observed affected-scope costs have an honest disposition.

It need not prove global optimality or exhaust every hypothetical rewrite.

It MUST NOT use "fast enough" as the reason to stop examining a known avoidable cost.

## 7. Deviation record

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

## 8. Evidence required from implementation agents

An agent changing E0-E2 code MUST report the changed operation in terms of:

- semantic quantity required;
- governing optimization unit;
- causal role of changed/retained local cost;
- regression surface;
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
- admission condition and falsifier;
- machine-cost dimensions affected;
- remaining known/suspected optimization debt in the affected E0-E2 neighborhood.

This explanation is required even when no wall-clock benchmark is run.

## 9. Evidence phases and qualification boundary

NEES distinguishes three evidence phases.

### Inherited evidence

Evidence already established by:

- the selected runtime profile;
- a previously qualified NEES method;
- an unchanged semantic invariant;
- a previously qualified project-local realization record.

Inherited evidence MAY be reused until a stated requalification trigger is crossed.

### Development evidence

Evidence used to choose and continue implementation:

- semantic derivation;
- source and representation inspection;
- complexity reasoning;
- known runtime-profile facts;
- focused counters or checks run because their answer changes the next design step.

Development evidence is not required to include a full benchmark, full regression suite, generated-code audit, or negative-control experiment after every edit.

### Qualification evidence

Evidence gathered to decide whether the completed change is promotable.

The default qualification unit is a coherent completed pull request or equivalent complete change set.

Performance qualification MUST evaluate the change at the governing optimization unit that owns the claimed benefit. Local microbenchmarks, counters, static findings, and generated-code properties are supporting evidence unless the local operation is itself the governing unit.

When multiple components form a composite optimization, qualify the composite as a unit. A locally adverse component does not fail qualification merely because its isolated metric is worse when the composite lowers total machine cost.

The qualification SHOULD also inspect the identified regression surface so a target win does not silently move greater cost into shared callers, other workloads, code size, memory pressure, GC, JIT state, coordination, or another affected resource.

Before promotion, the qualification unit MUST receive the applicable project-required:

- semantic/correctness qualification;
- NEES conformance review;
- structural/deterministic detectors;
- runtime/JIT evidence when a realization claim is load-bearing;
- performance qualification when the project requires a performance claim or gate;
- regression and negative controls where they are material to the claim.

NEES MUST NOT require those full qualification activities after every optimized line, helper, or individual method application.

A targeted development check is encouraged when its result can falsify a premise or alter the next implementation decision. Ritual testing that cannot affect the next decision is not a NEES requirement.

The qualification unit SHOULD be structurally coherent. Do not split one architectural optimization into artificially tiny patches solely to make each intermediate delta independently measurable.

## 10. Evidence hierarchy

When sources disagree, use this order unless there is a documented reason not to:

1. current semantic specification and current Node/V8 primary source;
2. direct evidence from the declared runtime;
3. current Node core implementation/benchmark evidence;
4. current production-project evidence that matches the problem shape;
5. maintained expert/agent guidance;
6. historical documents.

A newer secondary source does not override a primary source merely because it is newer. Conversely, an old primary implementation article may no longer describe current realization. State the mismatch.

### Performance-evidence hierarchy

For a performance decision, prefer evidence closest to the actual causal objective:

1. reliable measurement of the required workload at the governing optimization unit;
2. enclosing subsystem or representative end-to-end measurement;
3. local operation/microbenchmark measurement;
4. runtime/hardware explanatory evidence such as generated code, deopts, counters, flamegraphs, cache behavior, allocation or GC signals;
5. static/source indicators.

Lower levels are often essential for explaining **why** performance changed. They do not automatically override a reliable contradictory result at a higher causal level.

If higher-level evidence is too noisy, unavailable, or prohibitively expensive, record that limitation explicitly rather than assuming the proxy and objective are equivalent.

## 11. Negative controls and falsification

At the qualification boundary, a performance claim is stronger when the observation mechanism is shown to see the property under test.

Negative controls and falsification are qualification tools; NEES does not require recreating them after each development edit.

For a structural detector:

- demonstrate that a deliberately bad/control variant changes the detector when practical.

For a runtime measurement:

- include a baseline or same-build null/control run;
- report noise/variance when it can overlap the effect;
- do not promote a change whose instrument cannot distinguish it from noise.

For a V8/JIT claim:

- verify the relevant function/path actually reaches the assumed optimized state when that assumption is load-bearing.

## 12. Deterministic detectors

Projects SHOULD convert recurring NEES failures into deterministic checks where practical.

A detector SHOULD be classified by what it can actually prove:

- **PROVEN-STRUCTURAL** — directly observes a runtime-independent structural property;
- **PROFILE-SENSITIVE** — performance meaning depends on the selected Node/V8/platform profile;
- **CONTEXTUAL** — value depends on enclosing architecture/workload;
- **EXPERIMENTAL** — hypothesis not yet established generally.

Only a detector whose observed property is itself a project requirement, or whose performance implication has been qualified at the governing optimization unit, should normally become an unconditional performance hard gate.

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

## 13. Incident learning

When a material performance defect is traced to a recurring implementation shape, the owning project SHOULD produce at least one of:

1. a new or clarified NEES method;
2. a stale-advice entry;
3. a deterministic detector;
4. a regression fixture;
5. a reviewer checklist item;
6. a runtime-profile correction.

This keeps NEES grounded in lived failures rather than generic folklore.

## 14. Runtime revisions

A Node/V8 major change does not invalidate STABLE rules.

It DOES trigger review of V8-SENSITIVE methods used by the subsystem.

A platform change triggers review of PLATFORM-SENSITIVE methods.

An experimental Node API version change triggers review of methods that depend on that API even within the same Node major.

Projects SHOULD record the exact production runtime tuple when performance is release-critical.

## 15. Conformance levels

### NEES-CORE

Conforms to stable semantic, representation, complexity, boundary, and evidence requirements.

### NEES-NODE

NEES-CORE plus applicable Node worker/Buffer/transport/native-boundary/runtime-profile methods.

### NEES-EXTREME

NEES-NODE plus all applicable E0/E1 allocation, representation, JIT stability, capacity, locality, coordination, and maximal-effort machine-cost requirements.

NEES-EXTREME does not mean "use every low-level technique". It means candidate hot-path cost is systematically discovered and dispositioned, causal role and governing optimization units are respected, realization-sensitive decisions are evidence-gated, superior composite optimizations are preserved, small costs remain visible as debt, and "fast enough" is not a stopping condition.

## 16. Non-goals

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

For NEES-EXTREME, add:

> Minimize total machine cost. Treat every known avoidable hot-path cost as work to remove, cost out, structurally supersede, prove unavoidable, or preserve explicitly as debt/deviation.
