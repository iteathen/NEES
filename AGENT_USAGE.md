# NEES Agent Usage Contract — Draft 0.2

## 1. Manager invocation

A project owner should be able to state:

```text
Implement this subsystem under NEES-EXTREME.
Runtime profile: node26-v8-14.6.
E0: solveNode, transition, undo.
E2: branch publication / claim.
COLD: diagnostics and configuration.
Preserve the semantic owner at <path>.
```

That instruction means the agent MUST consult:

- [SPEC.md](SPEC.md);
- [NODE_V8_METHODS.md](NODE_V8_METHODS.md);
- the selected runtime profile;
- [STALE_ADVICE.md](STALE_ADVICE.md);

before designing E0-E2 implementation changes.

## 2. Required workflow

### Before mutation

1. identify the semantic quantity actually required;
2. identify the execution class;
3. identify the owning boundary that can establish invariants once;
4. inspect the current representation and runtime boundary;
5. identify required vs accidental generality;
6. identify the dominant cost class;
7. select candidate NEES methods;
8. state admission condition and falsifier for each realization-sensitive method;
9. identify capacity/lifetime/failure behavior;
10. identify runtime/platform assumptions;
11. check the stale-advice firewall for the proposed tactic.

### During implementation

1. preserve exact semantics;
2. eliminate work structurally before micro-optimizing it;
3. move cold work outward rather than hiding it;
4. keep hot APIs narrow/prepared where the domain permits;
5. preserve ownership and failure behavior;
6. use existing optimized builtins until a narrower replacement is admitted;
7. keep V8/platform-specific tricks local and documented;
8. avoid stacking unrelated speculative optimizations into one causal experiment unless structural synthesis is the requested objective.

### After implementation

Report:

```text
Semantic owner:
NEES class:
Runtime profile:
Rules/methods applied:
Mechanism class:
Admission:
Representation:
Allocation/lifetime:
Derived information:
Complexity:
JIT/runtime assumptions:
Builtin/native boundary:
Concurrency/transport:
Capacity/failure:
Falsifier:
Deviations:
Unresolved realization questions:
```

## 3. Stale-advice firewall

Before writing or repeating a remembered JavaScript performance rule, ask:

- Is this a stable semantic rule or an engine tactic?
- Is it still true on the selected Node/V8 profile?
- Does Node core use the pattern for performance, or for primordial/security semantics?
- Is there a current builtin that already implements the operation better?
- Is the claimed cost actually present in this workload?
- Is a recent negative result known?

If current primary evidence is unavailable, mark the tactic UNVERIFIED rather than turning it into a requirement.

## 4. Design questions agents MUST answer

### Semantic structure

- What exact information does the consumer observe?
- What information is carried only because of the current API shape?
- Has an upstream stage already proved a stronger fact?
- Can deterministic/degenerate structure be collapsed before scheduling/general work?

### Representation

- Is the current representation more general than the consumer needs?
- Is an intermediate materialized only to be projected away?
- Does equality use semantic coordinates or only address/hash/object identity?
- Is text/object identity actually semantic, or merely an external encoding?

### Repeated work

- Is anything derived twice from immutable state?
- Is static finite information reconstructed?
- Does a loop restart a scan that could carry position?
- Is structured data serialized and rescanned?
- Can exact output size be derived once?

### Allocation and lifetime

- What is allocated on successful E0/E1 execution?
- Is the allocation semantic product or avoidable scratch?
- Can it be eliminated instead of pooled?
- If pooled/reused, what owns release/reset and what prevents aliasing?
- Does storage grow/rehash/copy inside the hot recurrence?

### V8 realization

- Is the hot feedback stable or still growing?
- Are object shapes/elements kinds stable where material?
- Is a source-level claim actually visible in generated/runtime behavior?
- Is an optimization dependent on a historical V8 rule?
- Could the change cross an inlining/code-size threshold?
- Is a builtin already specialized for the operation?

### Iteration

- Is a counted loop needed for numeric indexing/fusion/early-exit?
- Does a higher-level loop actually allocate or invoke callbacks in a material way?
- Is Node-core avoidance of a builtin caused by primordial/tamper semantics rather than speed?
- Are we rewriting syntax without removing work?

### Concurrency

- Does useful local work require synchronous shared coordination?
- Is visibility incorrectly tied to execution?
- What fields can race?
- What Atomics establish publication/liveness?
- Are writes concentrated on one contended word/cache line?
- Is worker creation/transport amortized?
- Is payload ownership shared, transferred, cloned, copied, or indexed?

### Native/builtin boundary

- Is there an existing Node/V8 builtin that performs the primitive directly?
- What data must cross into/out of native code?
- Does result materialization dominate anyway?
- Would batching make a native crossing worthwhile?
- Does Node-API stability matter?
- Is a Fast API path actually eligible and reached?
- If using FFI, what ABI/pointer/lifetime/permission contract makes it safe enough?

## 5. Forbidden reasoning shortcuts

Agents MUST NOT justify an E0-E2 implementation with only:

- "V8 probably optimizes this";
- "this is idiomatic JavaScript";
- "this is lower level";
- "TypedArrays are faster";
- "Map is O(1)";
- "monomorphic is fastest";
- "for loops are faster";
- "lock-free is fast";
- "branchless is fast";
- "zero allocations";
- "native is faster";
- "WASM is faster";
- "FFI is faster";
- "no benchmark showed a problem";
- "the hash is unique enough";
- "the object is small";
- "it allocates only once per node/task";
- "Node core does this" without identifying why.

The implementation argument must name the semantic boundary and actual execution structure removed or preserved.

## 6. Current-source rule

For a V8-SENSITIVE claim, the agent SHOULD prefer sources in this order:

1. selected runtime's Node/V8 docs/source;
2. generated/runtime evidence on the target;
3. recent production evidence;
4. maintained secondary guidance.

If a source predates major compiler architecture changes and no current confirmation exists, treat it as historical context.

## 7. Owner intent cannot be diluted

If the owner declares a scope NEES-EXTREME, an agent may not silently downgrade it to maintainability-first or idiomatic-JS-first implementation because stricter analysis is inconvenient.

This does not permit cargo-cult low-level code. NEES-EXTREME requires stronger admission evidence, not more tricks.

When a NEES requirement conflicts with semantics, security, or a proven runtime constraint, record a deviation and escalate the decision rather than redefining the goal.

## 8. Local project profiles

Projects SHOULD keep load-bearing semantic requirements adjacent to the code and reference NEES for reusable performance intent.

Example:

```text
OWNER-PROTECTED E0
Conforms: NEES-EXTREME
Runtime: node26-v8-14.6
Local invariants:
- first-win precedence
- exact undo restoration
- q hash is locator only
Local stricter rules:
- no text identity inside solver E0
- no per-node dynamic aggregate allocation
```

A local stricter rule can ban a mechanism NEES generally permits when the domain supports the restriction.

NEES does not replace domain-specific invariants.
