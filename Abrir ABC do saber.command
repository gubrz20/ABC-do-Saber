#!/bin/zsh
set -eu
cd -- "$(dirname -- "$0")"
ABC_NODE="$(command -v node || true)"
if [[ -z "$ABC_NODE" && -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]]; then
  ABC_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if /usr/bin/curl -fsS --max-time 2 http://127.0.0.1:4173/ 2>/dev/null | /usr/bin/grep -q 'ABC do saber'; then
  open 'http://127.0.0.1:4173/#inicio'
  exit 0
fi
if [[ -z "$ABC_NODE" ]]; then
  print 'Instale Node.js 22 ou superior para abrir o projeto.'
  read '?Pressione Enter para fechar.'
  exit 1
fi
"$ABC_NODE" server.mjs &
ABC_SERVER_PID=$!
trap 'kill "$ABC_SERVER_PID" 2>/dev/null || true' EXIT INT TERM
for ABC_ATTEMPT in {1..20}; do
  if /usr/bin/curl -fsS --max-time 1 http://127.0.0.1:4173/ >/dev/null 2>&1; then
    open 'http://127.0.0.1:4173/#inicio'
    break
  fi
  sleep 0.2
done
print 'ABC do saber aberto. Mantenha este terminal aberto durante o uso.'
wait "$ABC_SERVER_PID"
