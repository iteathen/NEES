# NEES — Node Extreme Execution Standard

**Status:** Draft 0.1 — pre-repository working copy  
**Scope:** Node.js / V8 extreme-performance implementation intent  
**Authority:** none; experimental draft  
**Measurement policy:** intentionally separate from this specification

NEES exists to communicate *how* extreme-performance Node/V8 code is expected to be built.

It is not a style guide, a benchmark standard, or a list of vague performance aspirations. Its purpose is to let a project owner write:

> This subsystem conforms to NEES at execution class E0/E1.

and give a human or coding agent detailed implementation expectations for representation, allocation, data layout, calls, control flow, derived information, JIT stability, concurrency, worker transport, native escape hatches, diagnostics, and deviations.

## Documents

- `SPEC.md` — stable goals, execution classes, rule model, and core requirements.
- `NODE_V8_METHODS.md` — detailed Node/V8 realization methods and replacement patterns.
- `CONFORMANCE.md` — conformance, deviations, version sensitivity, and review requirements.
- `AGENT_USAGE.md` — manager/agent invocation and implementation workflow.
- `REFERENCES.md` — first-draft inspiration and source map.

## Governing idea

For a declared hot path, minimize the complete execution structure between the semantic operation and machine realization:

```text
semantic requirement
    -> narrow representation
    -> prepared data
    -> stable JIT/runtime shape
    -> minimal memory traffic / allocation / coordination
    -> machine execution
```

A richer representation or more general mechanism is acceptable only when it carries independently required semantics or when a narrower realization is unavailable or demonstrably worse.

## Two layers

NEES separates:

1. **Stable execution principles** — semantic and architectural constraints intended to survive Node/V8 releases.
2. **Node/V8 realization methods** — concrete methods that can be revision-sensitive.

This prevents temporary V8 behavior from becoming permanent folklore while still giving agents exact methods to use now.
