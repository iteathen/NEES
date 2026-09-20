# AGENTS.md — NEES maintenance contract

This repository defines the Node Extreme Execution Standard.

NEES is a performance **implementation-intent** standard. It is not a benchmark leaderboard, a generic JavaScript style guide, or a place to preserve optimization folklore.

## Before changing normative guidance

Read:

1. [SPEC.md](SPEC.md)
2. [NODE_V8_METHODS.md](NODE_V8_METHODS.md)
3. the affected runtime profile, currently [RUNTIME_PROFILE_NODE26.md](RUNTIME_PROFILE_NODE26.md)
4. [STALE_ADVICE.md](STALE_ADVICE.md)
5. [CONFORMANCE.md](CONFORMANCE.md)
6. [REFERENCES.md](REFERENCES.md)

## Authority layering

Keep these layers distinct:

```text
SPEC.md
    stable semantic/architectural invariants

NODE_V8_METHODS.md
    prescriptive realization recipes with admission/falsifier

RUNTIME_PROFILE_*.md
    current Node/V8/platform facts

STALE_ADVICE.md
    known non-rules / obsolete or over-generalized advice

research/
    evidence, reassessments, negative results
```

Do not move an engine-version fact into the stable core merely to make a rule stronger.

## Research requirement

Before adding or strengthening a V8-SENSITIVE, NODE-STABLE, PLATFORM-SENSITIVE, or EXPERIMENTAL rule:

- inspect current primary Node/V8/ECMAScript sources;
- identify the target runtime/profile;
- state the runtime mechanism;
- state an admission condition;
- state a falsifier or counter-condition;
- record a requalification trigger;
- search for current counterexamples/negative results.

Historical sources can explain origin but do not prove current realization.

## Preserve the meaning of EXTREME

NEES-EXTREME means maximal effort to reduce total machine cost after semantics and load-bearing constraints are fixed.

Do not weaken this into:

- optimize only the current bottleneck;
- ignore changes below an arbitrary percentage threshold;
- stop because the code is already fast;
- equate fewer instructions with fewer cycles;
- require every micro-edit to be independently benchmarked.

Cost magnitude controls priority, not legitimacy.

Maximal effort governs search coverage and disposition, not mandatory intervention. A detector finding or locally cheaper form is not sufficient authority to mutate an enclosing optimization; the agent must establish causal role and the governing optimization unit first.

First-time NEES-EXTREME adoption requires a complete declared hot-scope baseline audit. Subsequent work inherits the resulting debt/disposition record and should not be forced to repeat the whole audit unless the scope or assumptions materially change.

A normative change that permits known avoidable E0/E1 work to disappear from the optimization record merely because it is small MUST be treated as a semantic weakening of NEES-EXTREME and requires explicit owner direction.

A normative change MAY improve how cost is measured, costed out, superseded, or prioritized without weakening this doctrine.

## Protect composite optimizations

NEES agents MUST NOT become locally greedy.

A component that is locally slower or carries an apparently avoidable branch, allocation, metadata field, synchronization event, representation cost, or other machine work may still be part of a superior **composite realization** when that local cost enables a larger structural saving elsewhere.

Before changing such a component, identify the smallest enclosing causal optimization that owns the performance effect and determine whether the local cost is:

- independent avoidable work;
- an enabling/amortization cost;
- a coupled cost whose removal shifts work elsewhere;
- a deliberate TRADEOFF;
- or unresolved.

Local conformance evidence, a microbenchmark win, or one improved counter MUST NOT override a larger regression in the enclosing realization.

When the benefit arises from interaction among multiple parts, preserve and qualify those parts as one composite optimization. A locally inferior part may remain when replacing it would increase total machine cost of the composite.

Known local debt still remains visible. Protecting a composite optimization is not permission to hide inefficient work; it constrains future replacements to preserve or improve the larger benefit.

A maintenance change that encourages agents to apply NEES methods independently without examining cross-component effects is a regression in the agent contract.

## No cargo-cult rules

Do not add rules whose entire justification is one of:

- lower level is faster;
- native/WASM/FFI is faster;
- monomorphic is faster;
- for loops are faster;
- TypedArrays are faster;
- zero allocation is faster;
- branchless is faster;
- lock-free is faster;
- Node core does it.

Turn the claim into an explicit mechanism or leave it unverified.

Likewise, do not dismiss an explicit mechanism merely because its expected isolated effect is small. Record it as lower-priority debt until removed, costed out, superseded, proved unavoidable, or deliberately deviated.

## Incidents and negative results are first-class

When research falsifies a plausible method:

- preserve the negative result;
- update [STALE_ADVICE.md](STALE_ADVICE.md) when the misconception can recur;
- narrow the method rather than hiding the failure.

When a recurring performance defect is found, add a detector/checklist item where practical.

## Semantics and safety

NEES MUST NOT trade away correctness, safety, ownership, identity, restoration, permission, ABI, or lifecycle contracts for speed.

Unsafe or experimental mechanisms such as raw FFI require stronger documentation, not weaker semantics.

## Qualification cadence

NEES itself MUST NOT impose full test/profile/benchmark qualification after every optimized line or local edit.

For implementation work governed by NEES:

- reason and implement through a coherent change set;
- reuse inherited profile/method evidence;
- run targeted checks during development only when their answer can change the next step or protect a required correctness invariant;
- treat the completed pull request or equivalent coherent change set as the default qualification boundary;
- perform the applicable correctness, conformance, structural, runtime/JIT, and performance qualification before promotion.

Do not bias NEES toward tiny micro-optimization patches simply because they are easier to measure independently.

Qualification evidence for a changed subcomponent MUST be interpreted at the smallest enclosing causal boundary that owns the claimed performance benefit. A local improvement that breaks a stronger composite optimization is not a NEES improvement.

## Repository workflow

Use branches and pull requests for normative changes.

Before proposing a change run:

```sh
node tools/verify-repository.mjs
```

The verifier checks repository/document integrity only. It does not certify semantic correctness, performance, or NEES conformance.

A review of a normative change must cite evidence. A bare "LGTM", "faster", or "more optimized" is not sufficient.
