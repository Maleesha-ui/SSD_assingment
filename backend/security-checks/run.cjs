'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const args = process.argv.slice(2);
let ref;
let only = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ref' && args[i + 1]) ref = args[++i];
  else if (args[i] === '--only' && args[i + 1]) only = args[++i];
  else throw new Error('Usage: node run.cjs [--ref git-ref] [--only filename-fragment]');
}
const files = fs.readdirSync(__dirname)
  .filter(name => name.endsWith('.check.cjs') && name.includes(only))
  .sort().map(name => path.join(__dirname, name));
if (!files.length) throw new Error('No matching checks');
const env = { ...process.env };
if (ref) env.SECURITY_SOURCE_REF = ref;
console.log(`# Controller source: ${env.SECURITY_SOURCE_REF || 'working tree'}`);
console.log('# Scope: isolated controller checks; database, Stripe and email are mocked.');
const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...files], {
  stdio: 'inherit', env,
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
