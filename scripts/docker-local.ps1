param(
    [ValidateSet('up', 'down', 'status')]
    [string]$Action = 'up',
    [switch]$NoBuild
)

$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskEnvPath = Join-Path $taskRoot '.env.docker.local'

function New-LocalSecret {
    $taskBytes = New-Object byte[] 48
    $taskGenerator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $taskGenerator.GetBytes($taskBytes) } finally { $taskGenerator.Dispose() }
    return [Convert]::ToBase64String($taskBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

if (!(Test-Path -LiteralPath $taskEnvPath)) {
    $taskLines = @()
    $taskRootEnv = Join-Path $taskRoot '.env'
    if (Test-Path -LiteralPath $taskRootEnv) {
        $taskLines += Get-Content -LiteralPath $taskRootEnv
    }
    foreach ($taskFrontendFile in @('achanvear.frontend/.env', 'achanvear.frontend/.env.local')) {
        $taskFrontendPath = Join-Path $taskRoot $taskFrontendFile
        if (Test-Path -LiteralPath $taskFrontendPath) {
            $taskLines += Get-Content -LiteralPath $taskFrontendPath | Where-Object { $_ -match '^NEXT_PUBLIC_' }
        }
    }
    $taskLines += @(
        'DB_URL=jdbc:postgresql://postgres:5432/achanvear',
        'FLYWAY_URL=jdbc:postgresql://postgres:5432/achanvear',
        'DB_USERNAME=postgres',
        "DB_PASSWORD=$(New-LocalSecret)",
        'POSTGRES_DB=achanvear',
        "JWT_SECRET=$(New-LocalSecret)",
        'APP_FRONTEND_URL=http://localhost:3001',
        'CORS_ALLOWED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001,http://localhost:3000,http://127.0.0.1:3000',
        'NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1',
        'POSTGRES_PORT=55439', 'REDIS_PORT=6380', 'AI_AGENT_PORT=8001',
        'BACKEND_PORT=8081', 'FRONTEND_PORT=3001',
        'BACKEND_IMAGE=achanvear-backend:local', 'AI_AGENT_IMAGE=achanvear-ai-agent:local'
    )
    [System.IO.File]::WriteAllLines($taskEnvPath, [string[]]$taskLines, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host 'Local environment created. Credentials are stored in the ignored .env.docker.local file.'
}

$taskComposeArgs = @('--project-directory', $taskRoot, '--env-file', $taskEnvPath,
    '-p', 'achanvear-local', '-f', (Join-Path $taskRoot 'docker-compose.yml'),
    '-f', (Join-Path $taskRoot 'docker-compose.local.yml'), '--profile', 'local-db')

switch ($Action) {
    'up' {
        $taskUpArgs = @('up', '-d', '--wait', '--wait-timeout', '180')
        if (!$NoBuild) { $taskUpArgs += '--build' }
        & docker compose @taskComposeArgs @taskUpArgs
    }
    'down' { & docker compose @taskComposeArgs down }
    'status' { & docker compose @taskComposeArgs ps }
}
if ($LASTEXITCODE -ne 0) { throw "Docker Compose failed with exit code $LASTEXITCODE" }
