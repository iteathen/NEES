# NEES Agent Usage Contract — Draft 0.1

## 1. Manager invocation

A project owner should be able to state:

```text
Implement this subsystem under NEES-EXTREME.
E0: solveNode, transition, undo.
E2: branch publication / claim.
COLD: diagnostics and configuration.
Preserve the semantic owner at <path>.
```

That instruction means the agent MUST consult both `SPEC.md` and `NODE_V8_METHODS.md` before designing the implementation.

## 2. Required agent workflow

Before mutation:

1. identify the semantic quantity actually required;
2. identify the declared execution class;
3. inspect the current representation and runtime boundary;
4. identify required vs accidental generality;
5. select corresponding NEES method recipes;
6. list semantic invariants that make specialization legal;
7. identify V8-sensitive assumptions;
8. identify capacity/lifetime/failure behavior.

During implementation:

1. preserve exact semantics;
2. move cold work outward rather than hiding it;
3. keep hot APIs scalar/indexed/prepared where applicable;
4. avoid convenience objects/closures/collections that violate the declared class;
5. keep version-sensitive tricks local and documented;
6. avoid stacking unrelated speculative optimizations into one causal change unless the owner requests synthesis.

After implementation, report:

```text
Semantic owner:
NEES class:
Rules applied:
Representation:
Allocation/lifetime:
Derived information:
JIT/runtime assumptions:
Concurrency:
Capacity/failure:
Deviations:
Unresolved realization questions:
```

## 3. Design questions agents MUST ask

### Representation

- What exact information does the consumer observe?
- Is the current representation more general than that?
- Is an intermediate materialized only to be projected away?
- Does equality use semantic coordinates or merely address/hash/object identity?

### Repeated work

- Is anything derived twice from immutable state?
- Is static finite information reconstructed?
- Does a loop restart a scan that could carry position?
- Is structured data serialized and then reparsed/scanned?

### Allocation

- What is allocated on successful E0/E1 execution?
- Can it be scalar, scratch, arena, or prepared data?
- Does lexical placement create context/closure allocation even on the common path?
- Does storage grow/rehash/copy inside the hot recurrence?

### V8 realization

- Are call sites type/shape stable?
- Are object shapes stable?
- Are arrays packed/type-stable where arrays are used?
- Are numeric carriers widened/boxed unnecessarily?
- Does a helper/boundary inhibit specialization/inlining?
- Is the rule V8-version-sensitive?

### Control flow

- Can an exact fact terminate before canonicalization/transformation/allocation?
- Can one discriminator dispatch once instead of repeated checks?
- Has an upstream fact already excluded cases still represented downstream?

### Concurrency

- Does useful local work require synchronous shared coordination?
- Is visibility incorrectly tied to execution?
- Are Atomics concentrated on one contended word/cache line?
- Can shared work be represented as indexed numeric state?
- Are worker-local and portable identities being confused?

### Native boundary

- Is there an existing V8/Node/native builtin that performs the primitive more directly?
- Would native crossing remove more work than it introduces?
- Can operations be batched?
- Is a Fast API/FFI/N-API/WASM boundary appropriate?

## 4. Forbidden reasoning shortcuts

Agents MUST NOT justify a hot implementation with only:

- "V8 probably optimizes this";
- "this is idiomatic JavaScript";
- "TypedArrays are faster";
- "Map is O(1)";
- "lock-free is fast";
- "fewer source lines";
- "native is faster";
- "no benchmark showed a problem";
- "the hash is unique enough";
- "the object is small";
- "it allocates only once per node/task" when node/task frequency is the hot multiplier.

The implementation argument must identify actual representation and execution structure.

## 5. Owner intent cannot be diluted

If the owner declares a scope NEES-EXTREME, an agent may not silently downgrade it to maintainability-first or idiomatic-JS-first implementation because stricter methods are inconvenient.

When a NEES requirement conflicts with semantics or a proven runtime constraint, record a deviation and escalate that choice rather than redefining the goal.

## 6. Local project rules

Projects SHOULD keep load-bearing semantic requirements adjacent to code and reference NEES for reusable performance intent.

Example:

```text
OWNER-PROTECTED E0
Conforms: NEES-EXTREME
Local invariants:
- first-win precedence
- exact undo restoration
- hash is locator only
```

NEES does not replace domain-specific invariants.
