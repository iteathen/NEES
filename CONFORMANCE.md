# NEES Conformance and Deviations — Draft 0.1

## 1. What conformance means

A subsystem conforms to NEES only when:

1. its execution scope and class are declared;
2. applicable MUST/MUST NOT rules are satisfied or explicitly deviated;
3. applicable Node/V8 realization methods were considered at the correct abstraction boundary;
4. stronger project semantics override performance methods where required;
5. version-sensitive methods identify runtime assumptions.

NEES conformance is an implementation-intent claim, not a speed claim.

## 2. Scope declaration

A conforming subsystem MUST declare:

```text
NEES: Draft 0.1
Execution classes: E0/E1/E2/...
Runtime profile: Node <major/family>, V8 <family>
Semantic owner: <spec/module/doc>
Hot entry points: <functions/modules>
Cold boundaries: <functions/modules>
```

A file MAY contain multiple execution classes, but the boundaries must be obvious.

## 3. Rule disposition

For every applicable rule, review uses one of:

- **CONFORMS** — implementation follows the rule/method.
- **NOT-APPLICABLE** — rule does not apply; reason stated.
- **DEVIATION** — rule intentionally not followed; deviation record required.
- **UNVERIFIED** — evidence is insufficient; conformance cannot be claimed.

"Looks fast", "idiomatic", "probably optimized by V8", and "tests pass" are not dispositions.

## 4. Deviation record

A MUST/MUST NOT deviation requires:

```text
Rule:
Scope:
Exact operation:
Required/default method:
Chosen method:
Semantic reason:
Why default method is unsuitable:
Frequency:
Representation/lifetime implications:
Node/V8 assumptions:
Failure/capacity behavior:
Review owner:
Revisit trigger:
```

If the deviation relies on current V8 behavior, it MUST include a runtime-version revisit trigger.

## 5. Evidence required from agents

An agent changing E0-E2 code MUST explain, for the changed operation:

- representation before/after;
- allocation/lifetime before/after;
- repeated derivations removed/added;
- call-site type/shape implications;
- storage growth/capacity path;
- concurrency/atomic/shared-memory implications where applicable;
- semantic preconditions used for specialization;
- cold/hot boundary movement;
- applicable version-sensitive assumptions.

This explanation is required even when no benchmark is run.

## 6. Review style

A NEES review MUST cite concrete code/representation evidence.

A bare verdict such as "approved", "fast", "optimized", or "no issue" is insufficient.

The reviewer SHOULD answer each applicable category:

```text
Representation
Allocation/lifetime
Derived information
Complexity/repeated work
Control-flow placement
JIT stability
Memory/data locality
Concurrency/coordination
Native boundary
Diagnostics
Version sensitivity
```

## 7. Deterministic detectors

Where practical, a project SHOULD convert recurring NEES failures into deterministic checks.

Examples:

- allocation count;
- object-shape signature count;
- operation-counter growth at N vs 2N;
- number of full scans;
- number of materialization/conversion events;
- queue/atomic operation count;
- hot-path growth attempts;
- fallback count;
- source-derived fact reconstruction count.

Wall-clock measurement is not required for a structural detector.

A detector is evidence only for the property it observes. It does not replace reasoning about properties it cannot see.

## 8. Incident learning

When a material performance defect is traced to a recurring implementation shape, the owning project SHOULD produce at least one of:

1. a new/clarified NEES method;
2. a deterministic detector;
3. a regression fixture;
4. a reviewer checklist item.

This keeps the standard grounded in lived failures rather than generic folklore.

## 9. Runtime revisions

A Node/V8 major change does not invalidate STABLE rules.

It DOES trigger review of V8-SENSITIVE methods used by the subsystem.

A version-sensitive method can remain when semantics are unchanged and the assumed realization remains valid enough for the owning profile.

Projects SHOULD pin the exact runtime profile used for critical releases.

## 10. Conformance levels

Draft 0.1 defines three declaration levels.

### NEES-CORE

Conforms to stable core/boundary/representation/complexity requirements.

### NEES-NODE

NEES-CORE plus Node worker/memory/native-boundary methods.

### NEES-EXTREME

NEES-NODE plus all applicable E0/E1 allocation, JIT-stability, storage-sealing, numeric-representation, and coordination requirements.

Projects MAY add stricter local rules.

## 11. Non-goals

NEES does not require:

- eliminating all Objects/Arrays/Strings/Maps/Sets;
- using TypedArrays everywhere;
- writing native code;
- writing branchless code;
- micro-optimizing cold setup;
- sacrificing semantic correctness;
- choosing a lower-level form when the high-level operation is already the best machine realization.

The rule is:

> Do not carry unnecessary computational, representational, allocation, coordination, or runtime generality through a declared hot path.
