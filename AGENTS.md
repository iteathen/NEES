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

## Incidents and negative results are first-class

When research falsifies a plausible method:

- preserve the negative result;
- update [STALE_ADVICE.md](STALE_ADVICE.md) when the misconception can recur;
- narrow the method rather than hiding the failure.

When a recurring performance defect is found, add a detector/checklist item where practical.

## Semantics and safety

NEES MUST NOT trade away correctness, safety, ownership, identity, restoration, permission, ABI, or lifecycle contracts for speed.

Unsafe or experimental mechanisms such as raw FFI require stronger documentation, not weaker semantics.

## Repository workflow

Use branches and pull requests for normative changes.

Before proposing a change run:

```sh
node tools/verify-repository.mjs
```

The verifier checks repository/document integrity only. It does not certify semantic correctness, performance, or NEES conformance.

A review of a normative change must cite evidence. A bare "LGTM", "faster", or "more optimized" is not sufficient.
