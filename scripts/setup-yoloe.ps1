$ErrorActionPreference = 'Stop'
$runtimePath = Join-Path $PSScriptRoot '../runtime/yoloe'
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    throw 'Install uv first: winget install --id astral-sh.uv -e'
}
& uv sync --project $runtimePath --locked --python 3.11
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& uv run --project $runtimePath --locked python (Join-Path $runtimePath 'backend.py') check
exit $LASTEXITCODE
