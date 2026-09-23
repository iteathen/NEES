import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const output = execFileSync(process.execPath, [
  'tools/calculate-cost.mjs',
  'cost-models/node26-v8-14.6-x86_64-amd-zen3.json',
  'examples/cost-ledger-basic.json',
], { encoding: 'utf8' });
const result = JSON.parse(output);
assert.equal(result.profile, 'node26-v8-14.6/x86_64-amd-zen3');
assert.equal(result.functions.length, 1);
const fn = result.functions[0];
assert.equal(fn.name, 'exampleHotFunction');
assert.equal(fn.minCycles, 11);
assert.equal(fn.maxCycles, 11);
assert.equal(fn.exact, true);
assert.equal(fn.unbounded, false);
assert.deepEqual(fn.symbolicTerms, []);
console.log('NEES cost accounting verified');
