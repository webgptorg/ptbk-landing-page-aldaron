#!/usr/bin/env bash
# Attended VPS entry point. System preparation stays in the engine's shared installer.
set -Eeuo pipefail
umask 077

if [[ "${1:-}" == --help ]]; then
    printf 'Usage: curl -fsSL https://www.ptbk.io/install.sh | bash\nUbuntu 24.04 x86-64 with systemd; root or sudo; an interactive SSH terminal.\nInstalls prerequisites and Promptbook, then opens ptbk init as promptbook.\n'
    exit 0
fi
if (( $# != 0 )); then
    printf 'This entry point takes no arguments.\n' >&2
    exit 1
fi

if ! { [[ -t 1 ]] && ( : </dev/tty ) 2>/dev/null; }; then
    printf 'Open an interactive SSH terminal (ssh -t user@host) and run the command there.\n' >&2
    exit 1
fi
if [[ ! -r /etc/os-release ]]; then
    printf 'This installer supports Ubuntu 24.04 x86-64 with systemd.\n' >&2
    exit 1
fi
source /etc/os-release
if [[ "${ID:-}" != ubuntu || "${VERSION_ID:-}" != 24.04 || "$(uname -m)" != x86_64 ]]; then
    printf 'This installer supports Ubuntu 24.04 x86-64 only. No changes were made.\n' >&2
    exit 1
fi
if ! systemctl show --property=Version --value >/dev/null 2>&1; then
    printf 'This installer needs a running systemd host. No changes were made.\n' >&2
    exit 1
fi

privilege_command=()
if [[ "$(id -u)" != 0 ]]; then
    if ! command -v sudo >/dev/null 2>&1; then
        printf 'Run as root or an account with sudo access.\n' >&2
        exit 1
    fi
    sudo -v </dev/tty
    privilege_command=(sudo)
fi

installer_directory="$(mktemp -d)"
trap 'rm -rf -- "$installer_directory"' EXIT
installer_source='https://raw.githubusercontent.com/webgptorg/promptbook/reborn/2026-10/deploy/ubuntu/install.sh'

if command -v curl >/dev/null 2>&1; then
    curl --fail --silent --show-error --location --retry 3 "$installer_source" -o "$installer_directory/install.sh"
elif command -v wget >/dev/null 2>&1; then
    wget --quiet --output-document="$installer_directory/install.sh" "$installer_source"
else
    printf 'Download requires curl or wget. No system changes were made.\n' >&2
    exit 1
fi
test -s "$installer_directory/install.sh"
bash -n "$installer_directory/install.sh"
"${privilege_command[@]}" bash "$installer_directory/install.sh" </dev/tty

# A piped download must not become the wizard's stdin. Authentication is never logged here.
# Repeated setup opens the existing project's ordinary entry point without reinitializing it.
"${privilege_command[@]}" runuser --login promptbook --command \
    'cd "$HOME/projects/my-agenda" && if [ -f ptbk.json ]; then exec ptbk; else exec ptbk init --path "$PWD"; fi' </dev/tty
