# Packaging script for HopeFairy distribution zips (website / admin portal / APIs)
param(
    [string]$DistDir = "c:\xampp\htdocs\hope\dist_zips"
)

Write-Host "=== HopeFairy Distribution Packaging ===" -ForegroundColor Cyan
Write-Host "frontend.zip = website (/out) | backend.zip = admin portal (backend/dist) | apis.zip = Laravel API" -ForegroundColor DarkGray

if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

# Zips a folder with forward-slash entry names (Linux/cPanel extractors need them; .NET on
# Windows PowerShell writes backslashes). $Exclude: regexes matched against the relative path.
# $Replace: relative path -> file to store instead (e.g. a production .env).
function New-DeployZip {
    param([string]$Source, [string]$Zip, [string[]]$Exclude = @(), [hashtable]$Replace = @{})
    if (Test-Path $Zip) { Remove-Item $Zip -Force }
    $root = (Resolve-Path $Source).Path.TrimEnd('\') + '\'
    $archive = [System.IO.Compression.ZipFile]::Open($Zip, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        Get-ChildItem -LiteralPath $Source -Recurse -File -Force | ForEach-Object {
            $rel = $_.FullName.Substring($root.Length).Replace('\', '/')
            foreach ($rx in $Exclude) { if ($rel -match $rx) { return } }
            $from = if ($Replace.ContainsKey($rel)) { $Replace[$rel] } else { $_.FullName }
            [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $from, $rel, [System.IO.Compression.CompressionLevel]::Optimal)
        }
    } finally { $archive.Dispose() }
}

# 1. Database Backup -> database.sql
Write-Host "1. Checking database backup (database.sql)..." -ForegroundColor Yellow
$dbDump = Join-Path $DistDir "database.sql"
try {
    & "C:\xampp\mysql\bin\mysqldump.exe" -u root hopefairy > $dbDump
    Write-Host "   Database backup updated: $dbDump" -ForegroundColor Green
} catch {
    Write-Host "   MySQL dump error: $_" -ForegroundColor Red
}


# 2. Frontend Main Web Build -> frontend.zip & hope.zip
Write-Host "2. Packaging Frontend Main Web Build (frontend.zip & hope.zip)..." -ForegroundColor Yellow
$hopeZip = Join-Path $DistDir "hope.zip"
$frontendZip = Join-Path $DistDir "frontend.zip"
$backendZip = Join-Path $DistDir "backend.zip"

if (Test-Path $hopeZip) { Remove-Item $hopeZip -Force }
if (Test-Path $frontendZip) { Remove-Item $frontendZip -Force }
if (Test-Path $backendZip) { Remove-Item $backendZip -Force }

$frontendOut = "c:\xampp\htdocs\hope\frontend\out"
$hopeOut = "c:\xampp\htdocs\hope\out"
if (Test-Path $hopeOut) {
    New-DeployZip -Source $hopeOut -Zip $frontendZip
    Copy-Item $frontendZip $hopeZip -Force
    Write-Host "   Website build zipped: $frontendZip" -ForegroundColor Green
    Write-Host "   Website build mirror: $hopeZip" -ForegroundColor Green
} elseif (Test-Path $frontendOut) {
    New-DeployZip -Source $frontendOut -Zip $frontendZip
    Copy-Item $frontendZip $hopeZip -Force
    Write-Host "   Frontend build zipped: $frontendZip" -ForegroundColor Green
}

# 3. Admin Portal Build -> backend.zip (contains the backend/ folder: extract into public_html)
Write-Host "3. Packaging Admin Portal Build (backend.zip)..." -ForegroundColor Yellow
$backendDist = "c:\xampp\htdocs\hope\backend\dist"
if (-not (Test-Path (Join-Path $backendDist "backend\index.html"))) {
    Write-Host "   Admin build missing - run 'npm run build' in c:\xampp\htdocs\hope first." -ForegroundColor Red
} else {
    New-DeployZip -Source $backendDist -Zip $backendZip
    Write-Host "   Admin portal zipped (backend/ folder): $backendZip" -ForegroundColor Green
}
# 4. APIs (Laravel REST API) -> apis.zip and api.zip (Native Windows ZIP)
Write-Host "4. Packaging Laravel APIs (apis.zip & api.zip)..." -ForegroundColor Yellow
$apisZip = Join-Path $DistDir "apis.zip"
$apiZip = Join-Path $DistDir "api.zip"
if (Test-Path $apisZip) { Remove-Item $apisZip -Force }
if (Test-Path $apiZip) { Remove-Item $apiZip -Force }

$apisDir = "c:\xampp\htdocs\hope\apis"
# Machine-specific files never ship: framework caches hold this PC's absolute paths, plus local
# compiled views, sessions and logs. The server builds its own. The live .env goes out with debug off.
$prodEnv = Join-Path $env:TEMP "hopefairy-prod.env"
(Get-Content (Join-Path $apisDir ".env")) -replace '^APP_DEBUG=.*', 'APP_DEBUG=false' | Set-Content -Path $prodEnv -Encoding ascii
New-DeployZip -Source $apisDir -Zip $apisZip -Replace @{ '.env' = $prodEnv } -Exclude @(
    '^bootstrap/cache/[^/]+\.php$',
    '^storage/framework/(views|sessions)/(?!\.gitignore$)[^/]+$',
    '^storage/framework/cache/data/',
    '^storage/logs/.+\.log$',
    '^node_modules/',
    '^\.git/'
)
Remove-Item $prodEnv -Force
Copy-Item $apisZip $apiZip -Force
Write-Host "   Laravel APIs zipped (no local caches, APP_DEBUG=false): $apisZip" -ForegroundColor Green

# Remove any old confusing archive names from dist_zips
$oldZips = @(
    "backend_production_build.zip",
    "backend_source_code.zip",
    "apis_production_build.zip",
    "apis_source_code.zip",
    "frontend_build.zip",
    "backend_build.zip",
    "database_backup.sql"
)
foreach ($old in $oldZips) {
    $oldPath = Join-Path $DistDir $old
    if (Test-Path $oldPath) {
        Remove-Item $oldPath -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "`nAll clean distribution archives in $DistDir are fully updated!" -ForegroundColor Cyan
Get-ChildItem -Path $DistDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
