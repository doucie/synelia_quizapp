$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Locate Edge
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe" }
if (-not (Test-Path $edge)) { throw "Edge introuvable" }

$outDir = Join-Path (Get-Location) 'captures\png'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Echelle (1 = taille naturelle ; >1 = supersampling pour le rendu print)
$scale = 2.0

# Liste des figures à capturer. Les dimensions tightes sont calculées par le JS
# (autoFitCapture dans links.js) et publiées dans document.title sous la forme
# "BBOX:WxH" ; on les lit via le DevTools Protocol (remote debugging).
# fixed = pas d'auto-fit, capture à dimensions fournies.
$figures = @(
  @{ file='architecture.html' },
  @{ file='use_cases.html' },
  @{ file='class_diagram.html' },
  @{ file='mcd_cible_portrait.html' },
  @{ file='mld_cible_portrait.html' },
  @{ file='mpd_cible_portrait.html' },
  @{ file='sat.html' },
  @{ file='mct.html' },
  @{ file='sequences.html'; fixed=@{w=1320; h=2800} },
  @{ file='organisation_synelia.html' }
)

function Get-FreeTcpPort {
  $l = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $l.Start(); $p = $l.LocalEndpoint.Port; $l.Stop(); return $p
}

function Read-BboxViaDevtools {
  param([string]$Exe, [string]$Uri, [string]$UserData)
  $port = Get-FreeTcpPort
  $proc = Start-Process -FilePath $Exe -ArgumentList @(
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    "--user-data-dir=$UserData",
    "--remote-debugging-port=$port",
    '--window-size=4000,8000',
    $Uri
  ) -PassThru -WindowStyle Hidden
  try {
    $bbox = $null
    for ($i = 0; $i -lt 120; $i++) {
      Start-Sleep -Milliseconds 250
      try {
        $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json" -TimeoutSec 1 -ErrorAction Stop
      } catch { continue }
      # Cherche un onglet dont le titre est BBOX:WxH (priorité), peu importe l'url.
      $tab = $tabs | Where-Object { $_.type -eq 'page' -and $_.title -match '^BBOX:\d+x\d+$' } | Select-Object -First 1
      if ($tab -and $tab.title -match '^BBOX:(\d+)x(\d+)$') {
        $bbox = @{ w = [int]$matches[1]; h = [int]$matches[2] }
        break
      }
    }
    return $bbox
  } finally {
    try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
  }
}

function Invoke-EdgeShot {
  param([string]$Exe, [string[]]$EdgeArgs)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try { & $Exe @EdgeArgs 2>&1 | Out-Null } catch {}
  $ErrorActionPreference = $prev
}

foreach ($entry in $figures) {
  $file = $entry.file
  $src = Join-Path (Get-Location) $file
  if (-not (Test-Path $src)) { Write-Host "SKIP $file (manquant)"; continue }
  $uri = ([Uri]$src).AbsoluteUri + '?capture=1'
  $out = Join-Path $outDir ([IO.Path]::ChangeExtension($file, '.png'))

  if ($entry.fixed) {
    $bbox = @{ w = $entry.fixed.w; h = $entry.fixed.h }
  } else {
    $userData1 = Join-Path $env:TEMP ("edge-dev-" + [Guid]::NewGuid())
    $bbox = Read-BboxViaDevtools -Exe $edge -Uri $uri -UserData $userData1
    Remove-Item -Recurse -Force $userData1 -ErrorAction SilentlyContinue
  }
  if (-not $bbox) {
    Write-Host "  $file : bbox introuvable, capture sautée"
    continue
  }
  $W = [int]$bbox.w
  $H = [int]$bbox.h

  $userData2 = Join-Path $env:TEMP ("edge-shot-" + [Guid]::NewGuid())
  $shotArgs = @(
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    "--user-data-dir=$userData2",
    "--force-device-scale-factor=$scale",
    "--window-size=$W,$H",
    "--screenshot=$out",
    '--virtual-time-budget=3000',
    $uri
  )
  Write-Host ("Capture {0,-32} bbox {1}x{2} (raster {3}x{4})" -f $file, $W, $H, ([int]($W*$scale)), ([int]($H*$scale)))
  Invoke-EdgeShot -Exe $edge -EdgeArgs $shotArgs
  Remove-Item -Recurse -Force $userData2 -ErrorAction SilentlyContinue
  if (Test-Path $out) {
    $sz = (Get-Item $out).Length
    Write-Host ("  OK ({0:N0} octets)" -f $sz)
  } else {
    Write-Host "  ECHEC"
  }
}

Write-Host ''
Write-Host 'Done.'
