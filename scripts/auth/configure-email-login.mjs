import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://missing.invalid');
const project = /^([a-z0-9]+)\.supabase\.co$/.exec(url.hostname)?.[1];
if (!token || !project) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and an authorized SUPABASE_ACCESS_TOKEN in the environment.');
const endpoint = 'https://api.supabase.com/v1/projects/' + project + '/config/auth';
const fields = ['mailer_subjects_magic_link', 'mailer_subjects_confirmation', 'mailer_templates_magic_link_content', 'mailer_templates_confirmation_content', 'uri_allow_list'];
async function configuration(method = 'GET', body) {
    const response = await fetch(endpoint, {
        method, signal: AbortSignal.timeout(15000),
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error('Supabase Auth configuration request failed: HTTP ' + response.status);
    return response.json();
}
const before = await configuration();
const hosts = JSON.parse(await readFile(resolve(root, 'lib/domains/publicDomainHosts.json'), 'utf8'));
const required = [...Object.values(hosts).flatMap((host) => [host, 'www.' + host]), 'new.ptbk.io']
    .map((host) => 'https://' + host + '/api/auth/email**');
if (before.uri_allow_list != null && typeof before.uri_allow_list !== 'string') {
    throw new Error('Unexpected redirect allow-list format; no changes made.');
}
const previous = (before.uri_allow_list || '').split(',').map((v) => v.trim()).filter(Boolean);
const template = await readFile(resolve(root, 'config/supabase-email-otp.html'), 'utf8');
const patch = {
    mailer_subjects_magic_link: 'Váš přihlašovací odkaz a kód',
    mailer_subjects_confirmation: 'Váš přihlašovací odkaz a kód',
    mailer_templates_magic_link_content: template,
    mailer_templates_confirmation_content: template,
    uri_allow_list: [...new Set([...previous, ...required])].join(','),
};
const changed = fields.filter((key) => before[key] !== patch[key]);
console.log(JSON.stringify({ project, changedFields: changed, addedRedirects: required.filter((v) => !previous.includes(v)).length }));
if (!process.argv.includes('--apply') || !changed.length) process.exit(0);
const backupDirectory = resolve(root, '.tmp/auth-email');
await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
const backup = resolve(backupDirectory, 'before-' + new Date().toISOString().replaceAll(':', '-') + '.json');
await writeFile(backup, JSON.stringify(Object.fromEntries(fields.map((key) => [key, before[key]])), null, 2), { mode: 0o600, flag: 'wx' });
const latest = await configuration();
if (fields.some((key) => before[key] !== latest[key])) throw new Error('Auth settings changed concurrently; inspect again before applying.');
await configuration('PATCH', patch);
const verified = await configuration();
if (fields.some((key) => verified[key] !== patch[key])) throw new Error('Auth configuration readback did not match; inspect the saved backup.');
console.log(JSON.stringify({ project, applied: true, readbackVerified: true }));
