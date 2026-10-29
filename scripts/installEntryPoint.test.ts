import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

/** Real Bash/PTY execution with system preparation, downloads and account changes replaced by inert fixtures. */
const INSTALLER = resolve('public/install.sh');
const temporaryDirectories: string[] = [];

afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

/** Runs the public entry point exactly as a piped download, without changing the test host. */
function runInstaller(overrides: Record<string, string | undefined> = {}, terminal = true) {
    const directory = mkdtempSync(join(tmpdir(), 'ptbk-install-test-'));
    temporaryDirectories.push(directory);
    const log = join(directory, 'events');
    const environment = join(directory, 'bash-env');
    writeFileSync(environment, `
source() {
    if [[ "$1" == /etc/os-release ]]; then
        ID="\${INSTALL_TEST_OS:-ubuntu}"; VERSION_ID=24.04
    else builtin source "$@"; fi
}
uname() { printf '%s\\n' "\${INSTALL_TEST_ARCH:-x86_64}"; }
id() { printf '%s\\n' "\${INSTALL_TEST_UID:-0}"; }
systemctl() { return "\${INSTALL_TEST_SYSTEMD_STATUS:-0}"; }
node() { printf 'unexpected-node\\n' >> "$INSTALL_TEST_LOG"; return 99; }
npm() { printf 'unexpected-npm\\n' >> "$INSTALL_TEST_LOG"; return 99; }
sudo() {
    [[ -t 0 ]] || return 98
    printf 'sudo:%s\\n' "$*" >> "$INSTALL_TEST_LOG"
    if [[ "$1" == -v ]]; then return "\${INSTALL_TEST_SUDO_STATUS:-0}"; fi
    "$@"
}
curl() {
    printf 'download:%s\\n' "$*" >> "$INSTALL_TEST_LOG"
    local output=''
    while (( $# )); do
        if [[ "$1" == -o ]]; then output="$2"; break; fi
        shift
    done
    printf 'temporary:%s\\n' "$output" >> "$INSTALL_TEST_LOG"
    printf '%s\\n' '#!/usr/bin/env bash' '[[ -t 0 ]] || exit 97' 'printf "prepared\\n" >> "$INSTALL_TEST_LOG"' 'exit "\${INSTALL_TEST_PREPARE_STATUS:-0}"' > "$output"
    return "\${INSTALL_TEST_DOWNLOAD_STATUS:-0}"
}
runuser() {
    [[ -t 0 ]] || return 96
    printf 'handoff:%s\\n' "$*" >> "$INSTALL_TEST_LOG"
}
`);
    const env = {
        ...process.env,
        BASH_ENV: environment,
        SHELL: '/bin/bash',
        INSTALL_TEST_SOURCE: INSTALLER,
        INSTALL_TEST_LOG: log,
        ...overrides,
    };
    const result = terminal
        ? spawnSync('script', ['-q', '-e', '-c', 'cat "$INSTALL_TEST_SOURCE" | bash', '/dev/null'], { env, encoding: 'utf8', timeout: 15000 })
        : spawnSync('bash', [INSTALLER], { env, encoding: 'utf8', timeout: 15000 });
    const events = existsSync(log) ? readFileSync(log, 'utf8') : '';
    const downloadedPath = /^temporary:(.+)$/m.exec(events)?.[1];
    if (downloadedPath) expect(existsSync(dirname(downloadedPath))).toBe(false);
    return { ...result, events };
}

describe.skipIf(process.platform !== 'linux')('attended VPS shell entry point', () => {
    it.each(['0', '1000'])('installs before handing the real terminal to the engine account (uid %s)', uid => {
        const result = runInstaller({ INSTALL_TEST_UID: uid });
        expect(result.error).toBeUndefined();
        expect(result.status, result.stdout + result.stderr).toBe(0);
        expect(result.events).toContain('https://raw.githubusercontent.com/webgptorg/promptbook/reborn/2026-10/deploy/ubuntu/install.sh');
        expect(result.events.indexOf('prepared')).toBeLessThan(result.events.indexOf('handoff:'));
        expect(result.events).toContain('handoff:--login promptbook --command cd "$HOME/projects/my-agenda"');
        expect(result.events).toContain('if [ -f ptbk.json ]; then exec ptbk; else exec ptbk init --path "$PWD"; fi');
        expect(result.events).not.toContain('unexpected-');
        if (uid === '1000') expect(result.events).toContain('sudo:-v');
    });

    it('does not run a partially downloaded installer or initialize after a failed download', () => {
        const result = runInstaller({ INSTALL_TEST_DOWNLOAD_STATUS: '22' });
        expect(result.status).toBe(22);
        expect(result.events).not.toContain('prepared');
        expect(result.events).not.toContain('handoff:');
    });

    it('does not initialize after system preparation fails', () => {
        const result = runInstaller({ INSTALL_TEST_PREPARE_STATUS: '33' });
        expect(result.status).toBe(33);
        expect(result.events).toContain('prepared');
        expect(result.events).not.toContain('handoff:');
    });

    it.each([
        { INSTALL_TEST_OS: 'debian' },
        { INSTALL_TEST_ARCH: 'aarch64' },
        { INSTALL_TEST_SYSTEMD_STATUS: '1' },
        { INSTALL_TEST_UID: '1000', INSTALL_TEST_SUDO_STATUS: '1' },
    ])('rejects unsupported/unavailable setup before downloading: %o', overrides => {
        const result = runInstaller(overrides);
        expect(result.status).toBe(1);
        expect(result.events).not.toContain('download:');
        expect(result.events).not.toContain('handoff:');
    });

    it('requires an attended terminal before changing the host', () => {
        const result = runInstaller({}, false);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('ssh -t');
        expect(result.events).toBe('');
    });
});
