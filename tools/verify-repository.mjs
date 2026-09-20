import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

// Structural checks only: these do not certify semantic conformance or performance.
const required = ["README.md", "SPEC.md", "NODE_V8_METHODS.md", "CONFORMANCE.md", "AGENT_USAGE.md", "REFERENCES.md", "RUNTIME_PROFILE_NODE26.md", "STALE_ADVICE.md"];
for (const file of required) assert.ok(readFileSync(file, 'utf8').trim(), `${file} is empty`);
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const decoder = new TextDecoder('utf-8', { fatal: true });
for (const file of files) {
  if (!/\.(md|mjs|json|isg|ya?ml)$/.test(file)) continue;
  const text = decoder.decode(readFileSync(file));
  assert.ok(!/^(<{7}|={7}|>{7})(?: |$)/m.test(text), `${file}: unresolved merge marker`);
  if (file.endsWith('.json')) JSON.parse(text);
  if (file.endsWith('.mjs')) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (!file.endsWith('.md')) continue;
  assert.ok(/^#\s+\S/m.test(text), `${file}: missing document title`);
  // Check relative Markdown file links; remote URLs and heading fragments are excluded.
  const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  for (const match of prose.matchAll(/\[[^\]\n]*\]\(([^\s)]+)(?:\s+"[^"\n]*")?\)/g)) {
    const target = match[1].replace(/^<|>$/g, '');
    if (/^(?:[a-z][a-z\d+.-]*:|#|\/)/i.test(target)) continue;
    const path = decodeURIComponent(target.split(/[?#]/)[0]);
    if (path) assert.ok(existsSync(resolve(dirname(file), path)), `${file}: missing link target ${path}`);
  }
}
console.log(`Repository integrity passed (${files.length} tracked files).`);
