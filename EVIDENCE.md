# Evidence status

This repository follows the shared [iteathen evidence and validation policy](https://github.com/iteathen/.github/blob/main/EVIDENCE_POLICY.md).

## Current posture

NEES is an experimental performance-engineering standard. Its specification, runtime profiles, research notes, and repository verification establish project-controlled normative/document integrity and research provenance. They do not prove that a conforming subsystem is faster.

NEES already separates conformance from performance qualification; this evidence classification makes that separation explicit.

## Registered claims

| Claim | Evidence class | Status |
| --- | --- | --- |
| `NEES-SPEC-001` — Draft 0.4 is the current experimental repository authority for NEES execution/conformance intent | **INTERNAL-QUALIFICATION** | repository authority / document integrity |
| `NEES-PERF-001` — NEES conformance by itself proves a performance improvement | **UNVALIDATED** | explicitly rejected as a general inference |

Machine-readable records: [`evidence/claims.json`](evidence/claims.json).

## What current evidence establishes

The repository can establish the current NEES rules, runtime-profile provenance, referenced research, and whether a declared scope satisfies the repository's conformance/document requirements.

## What it does not establish

Conformance does not establish speedup, optimality, lower total machine cost, or superiority to an alternative implementation. Those require evidence at the adopting subsystem's governing optimization unit.

## Path to stronger evidence

A performance claim should preserve the exact adopting project revision, NEES profile, baseline/candidate semantics, workload, hardware, Node/V8/runtime, raw measurements, uncertainty/noise treatment, and the causal boundary at which the benefit is claimed.

## Non-mutation rule

NEES evidence may analyze and measure an adopting subsystem. An evidence-only campaign must not rewrite the subsystem merely to produce a favorable benchmark; implementation changes belong to the adopting project's separately authorized optimization work.
