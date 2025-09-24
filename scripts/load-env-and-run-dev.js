/* Load .env, .env.local or .env.production into process.env and run `next dev`.
   This script is a small helper for Windows dev environments where `cross-env` or shell
   variable loading is inconvenient.
*/

const fs = require('fs');
const path = require('path');

function loadEnvFile(file) {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) return;
    const text = fs.readFileSync(p, 'utf8');
    for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        // unquote
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = val;
    }
}

// Priority: .env -> .env.production -> .env.local
loadEnvFile('.env');
loadEnvFile('.env.production');
loadEnvFile('.env.local');

// Spawn next dev
const { spawn } = require('child_process');
const child = spawn('npx', ['next', 'dev'], { stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code));
