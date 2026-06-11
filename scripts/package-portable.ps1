# 构建并打包便携版（无需 Node 等运行时依赖）
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$releaseName = 'photo-watermark-tools-portable'
$outDir = Join-Path (Join-Path $root 'release') $releaseName
$zipPath = "$outDir.zip"
$templates = Join-Path $PSScriptRoot 'templates'

Write-Host ">> 构建前端资源..." -ForegroundColor Yellow
Set-Location $root
pnpm run build -- --base ./

Write-Host ">> 准备便携包目录..." -ForegroundColor Yellow
if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force }
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

Copy-Item -Path (Join-Path $root 'dist\*') -Destination $outDir -Recurse -Force
Copy-Item -Path (Join-Path $root 'scripts\server.ps1') -Destination $outDir -Force
Copy-Item -Path (Join-Path $templates '*') -Destination $outDir -Force

# offline build: strip Google Fonts CDN links
$indexHtml = Join-Path (Join-Path (Join-Path $root 'release') $releaseName) 'index.html'
if (Test-Path -LiteralPath $indexHtml) {
    $html = [IO.File]::ReadAllText($indexHtml)
    $html = $html -replace '(?s)\s*<link rel="preconnect"[^>]*>\s*', "`n"
    $html = $html -replace '\s*<link href="https://fonts\.googleapis\.com[^"]*" rel="stylesheet" />\s*', "`n"
    [IO.File]::WriteAllText($indexHtml, $html)
}

Write-Host ">> 压缩为 zip..." -ForegroundColor Yellow
$releaseDir = Join-Path $root 'release'
if (-not (Test-Path $releaseDir)) { New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path $outDir -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "  打包完成!" -ForegroundColor Green
Write-Host "  文件夹: $outDir"
Write-Host "  压缩包: $zipPath"
Write-Host ""
