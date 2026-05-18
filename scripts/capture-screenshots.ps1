$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$screenshotDir = Join-Path $repoRoot "docs\screenshots"
New-Item -ItemType Directory -Force -Path $screenshotDir | Out-Null

$chromeCandidates = @(
  $env:CHROME_PATH,
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { $_ -and (Test-Path $_) }

if ($chromeCandidates.Count -eq 0) {
  throw "Could not find Chrome or Edge. Set CHROME_PATH to a Chromium-compatible browser executable."
}

$browser = $chromeCandidates[0]

try {
  Invoke-WebRequest -UseBasicParsing -TimeoutSec 15 -Uri "http://localhost:7001/health" | Out-Null
  Invoke-WebRequest -UseBasicParsing -TimeoutSec 20 -Uri "http://localhost:7001/fx/usd-brl/latest" | Out-Null
  Invoke-WebRequest -UseBasicParsing -TimeoutSec 20 -Uri "http://localhost:7001/fx/usd-brl/history?range=7D" | Out-Null
} catch {
  Write-Warning "Could not warm backend data before screenshots: $($_.Exception.Message)"
}

$captures = @(
  @{
    Name = "desktop"
    Url = "http://localhost:7000"
    WindowSize = "1440,2200"
    Output = "reaisify-desktop.png"
  },
  @{
    Name = "mobile"
    Url = "http://localhost:7000"
    WindowSize = "430,1800"
    Output = "reaisify-mobile.png"
  },
  @{
    Name = "admin"
    Url = "http://localhost:7000/#/admin"
    WindowSize = "1440,1200"
    Output = "reaisify-admin.png"
  }
)

foreach ($capture in $captures) {
  $outputPath = Join-Path $screenshotDir $capture.Output
  Write-Host "Capturing $($capture.Name) -> $outputPath"
  & $browser `
    --headless=new `
    --disable-gpu `
    --no-sandbox `
    --hide-scrollbars `
    --timeout=30000 `
    "--window-size=$($capture.WindowSize)" `
    "--screenshot=$outputPath" `
    $capture.Url | Out-Null
}

Write-Host "Screenshots updated in $screenshotDir"
