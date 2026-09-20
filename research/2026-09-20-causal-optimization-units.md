# Draft 0.4 rationale — Causal optimization units and non-greedy performance reasoning

**Date:** 2026-09-20  
**Status:** research rationale for NEES Draft 0.4

## Problem

Draft 0.3 correctly made total machine cost the NEES-EXTREME objective and rejected "fast enough" as a stopping condition.

A practical failure exposed a remaining ambiguity: an agent could inspect a highly effective composite optimization, find several locally non-ideal subcomponents, apply NEES methods independently to those subcomponents, and destroy the much larger enclosing performance win.

The standard already allowed TRADEOFF dispositions, but it did not force the agent to establish the causal boundary before declaring a local cost avoidable.

## External comparison

A deeper review of JavaScript/Node/V8 performance systems found the relevant ideas distributed across several families rather than unified in one standard.

### V8 performance-agent tooling

The V8 project's current agent tooling uses an evidence-first workflow: profile -> correlate with generated/runtime behavior -> form hypothesis -> test -> validate.

It treats deoptimizations, IC state, generated code, runtime calls, GC, and hardware behavior as evidence to investigate rather than universal source-code rewrite rules.

### Static performance linters

Biome, eslint performance plugins, and small performance analyzers can reliably detect some structural properties: repeated scans, accidental quadratic work, repeated materialization, or sync work inside repeated execution.

They are weaker when the performance meaning depends on V8 realization or enclosing architecture.

A small V8-specific linter prototype demonstrates the danger of hard-coding engine tendencies such as SMI/double transitions or property patterns as unconditional local errors.

### Historical V8 advice

Older Crankshaft-era performance repositories explicitly warn that their advice became obsolete after V8's compiler architecture changed.

This reinforces the NEES separation between stable optimization principles, realization methods, and pinned runtime profiles.

### Benchmark/optimization agents

CodSpeed's autonomous optimization workflow strongly supports baseline measurement, flamegraph-guided hypothesis generation, cross-benchmark regression checking, and hardware/walltime validation.

Its defaults also illustrate why NEES needs its own doctrine: local one-change-at-a-time optimization and diminishing-return stopping thresholds are useful ordinary-engineering policies but cannot be universal requirements for composite NEES-EXTREME work.

## Draft 0.4 conclusions

### Candidate cost is not known avoidable cost

Observed machine work begins as a candidate.

A candidate becomes known avoidable only when an admissible replacement preserves required semantics and constraints, has an established causal role, lowers total machine cost at the governing optimization unit, and does not create an overriding regression on the relevant regression surface.

A locally cheaper alternative is insufficient.

### Governing optimization unit

The governing optimization unit is the smallest enclosing causal structure within which the candidate's performance consequences can be evaluated without omitting load-bearing interactions.

It can be a local operation, but it can also be a loop, recurrence, scheduler, worker system, representation pipeline, or other composite mechanism.

### Composite optimization

A composite optimization derives its advantage from interaction among parts.

A component may be locally inferior while enabling the composite to be globally superior. Such a component may correctly be dispositioned TRADEOFF.

### Detection is not authorization

Static rules, deopt traces, counters, generated-code observations, flamegraphs, and microbenchmarks are evidence. They can establish that a property exists and help explain cost. They do not independently authorize a rewrite.

### Proxy metrics are subordinate

Instruction count, allocation count, branch count, deopt count, Atomics count, cache misses, code size, and microbenchmarks are partial signals.

Where reliable governing-unit evidence exists, the performance decision follows the governing unit rather than a contradictory proxy.

### Maximal effort means maximal search, not maximal intervention

NEES-EXTREME should search aggressively and preserve every plausible cost long enough to disposition honestly. It should not apply every method or force every local component toward an isolated optimum.

The intended loop is: discover candidate -> establish semantic role -> classify causal role -> identify governing optimization unit -> map regression surface -> admit replacement -> qualify enclosing effect -> remove / retain / supersede / defer.

## Expected effect

Draft 0.4 should make NEES harder to misuse as a cargo-cult performance linter while preserving its maximal-effort objective.

It strengthens rather than weakens NEES-EXTREME: the standard remains unwilling to ignore small costs, but now requires evidence that a local "improvement" is actually an improvement at the causal boundary that matters.
