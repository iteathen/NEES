import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function usage() {
  console.error('usage: node tools/calculate-cost.mjs <cost-profile.json> <ledger.json>');
  process.exit(2);
}

const [, , profileArg, ledgerArg] = process.argv;
if (!profileArg || !ledgerArg) usage();

const profile = JSON.parse(readFileSync(resolve(profileArg), 'utf8'));
const ledger = JSON.parse(readFileSync(resolve(ledgerArg), 'utf8'));

function bounded(min, max = min, symbolic = [], unbounded = false) {
  return { min, max, symbolic, unbounded };
}

function add(a, b) {
  return {
    min: a.min + b.min,
    max: a.max == null || b.max == null ? null : a.max + b.max,
    symbolic: [...a.symbolic, ...b.symbolic],
    unbounded: a.unbounded || b.unbounded,
  };
}

function scale(v, count) {
  return {
    min: v.min * count,
    max: v.max == null ? null : v.max * count,
    symbolic: v.symbolic.map((term) => ({ ...term, multiplier: (term.multiplier ?? 1) * count })),
    unbounded: v.unbounded && count > 0,
  };
}

function evaluate(model, params, path = 'cost') {
  if (!model || typeof model !== 'object') throw new Error(`${path}: missing cost model`);
  switch (model.kind) {
    case 'fixed':
      if (!Number.isFinite(model.cycles) || model.cycles < 0) throw new Error(`${path}: invalid fixed cycles`);
      return bounded(model.cycles);
    case 'range':
      if (!Number.isFinite(model.min) || !Number.isFinite(model.max) || model.min < 0 || model.max < model.min) {
        throw new Error(`${path}: invalid range`);
      }
      return bounded(model.min, model.max);
    case 'sum': {
      if (!Array.isArray(model.items)) throw new Error(`${path}: sum.items must be an array`);
      return model.items.reduce((acc, item, index) => add(acc, evaluate(item, params, `${path}.items[${index}]`)), bounded(0));
    }
    case 'select': {
      const value = params[model.parameter];
      if (value != null && model.cases && Object.hasOwn(model.cases, String(value))) {
        return evaluate(model.cases[String(value)], params, `${path}.cases.${value}`);
      }
      if (model.default) return evaluate(model.default, params, `${path}.default`);
      return bounded(0, null, [{ name: `select:${model.parameter}`, multiplier: 1 }]);
    }
    case 'symbolic':
      return bounded(model.min ?? 0, model.max ?? null, [{ name: model.name ?? path, multiplier: 1 }]);
    case 'unbounded':
      return bounded(model.min ?? 0, null, [], true);
    default:
      throw new Error(`${path}: unsupported cost model kind ${JSON.stringify(model.kind)}`);
  }
}

function normalizeCount(value, where) {
  if (value == null) return 1;
  if (!Number.isInteger(value) || value < 0) throw new Error(`${where}: count must be a nonnegative integer`);
  return value;
}

function summarizeFunction(fn, scenario) {
  if (!fn || typeof fn.name !== 'string' || !Array.isArray(fn.operations)) throw new Error('invalid function ledger');
  let total = bounded(0);
  const counts = {};
  for (let index = 0; index < fn.operations.length; index++) {
    const item = fn.operations[index];
    const op = profile.operations?.[item.op];
    if (!op) throw new Error(`${fn.name}.operations[${index}]: unknown operation ${JSON.stringify(item.op)}`);
    const count = normalizeCount(item.count, `${fn.name}.operations[${index}]`);
    counts[item.op] = (counts[item.op] ?? 0) + count;
    const params = { ...(scenario ?? {}), ...(item.params ?? {}) };
    total = add(total, scale(evaluate(op.cost, params, `${item.op}.cost`), count));
  }
  return {
    name: fn.name,
    minCycles: total.min,
    maxCycles: total.max,
    exact: !total.unbounded && total.max != null && total.min === total.max && total.symbolic.length === 0,
    unbounded: total.unbounded,
    symbolicTerms: total.symbolic,
    operationCounts: counts,
  };
}

if (ledger.profile && ledger.profile !== profile.profile_id) {
  throw new Error(`ledger profile ${ledger.profile} does not match cost profile ${profile.profile_id}`);
}
if (!Array.isArray(ledger.functions)) throw new Error('ledger.functions must be an array');

const result = {
  schema_version: '0.1.0',
  profile: profile.profile_id,
  scenario: ledger.scenario ?? {},
  functions: ledger.functions.map((fn) => summarizeFunction(fn, ledger.scenario ?? {})),
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
