$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Path)

# ── Helpers ────────────────────────────────────────────────────────────────
function Read-Utf8 {
  param([string]$Path)
  $bytes = [System.IO.File]::ReadAllBytes($Path)
  $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  $bom = ''
  if ($text.Length -gt 0 -and $text[0] -eq [char]0xFEFF) { $bom = "`uFEFF"; $text = $text.Substring(1) }
  return @{ Text = $text; Bom = $bom }
}
function Write-Utf8 { param([string]$Path,[string]$Text,[string]$Bom='')
  [System.IO.File]::WriteAllText($Path, $Bom + $Text, [System.Text.UTF8Encoding]::new($true))
}
function Set-CanvasSize { param([string]$Text,[int]$Width,[int]$Height)
  $newCanvas = '<div class="canvas" style="width:' + $Width + 'px; height:' + $Height + 'px; margin: 0 auto;"'
  return [regex]::Replace($Text, '<div class="canvas"\s+style="[^"]*"', $newCanvas, 1)
}
function Set-Positions { param([string]$Text,[hashtable]$Positions)
  foreach ($key in $Positions.Keys) {
    $p = $Positions[$key]
    $style = 'style="top:' + $p.top + 'px; left:' + $p.left + 'px; width:' + $p.width + 'px;"'
    $pattern = 'data-entity="' + [regex]::Escape($key) + '"\s+style="[^"]*"'
    $replacement = 'data-entity="' + $key + '" ' + $style
    $Text = [regex]::Replace($Text, $pattern, $replacement, 1)
  }
  return $Text
}
function Set-Anchors { param([string]$Text,[array]$Anchors)
  $marker = '/* Anchors fixed from layout export */'
  if ($Text.IndexOf($marker) -ge 0) {
    $Text = [regex]::Replace($Text,
      '<script>\s*/\* Anchors fixed from layout export \*/[\s\S]*?</script>\s*', '', 1)
  }
  if ($null -eq $Anchors -or $Anchors.Count -eq 0) { return $Text }
  $lines = @('<script>', $marker,
    '(function(){ var L = window.LINKS || []; var apply = function(i,e,s){ if(!L[i])return; if(e==="A") L[i].fromAnchor=s; else L[i].toAnchor=s; };')
  foreach ($a in $Anchors) { $lines += ('  apply(' + $a.idx + ',"' + $a.end + '","' + $a.side + '");') }
  $lines += '})();'; $lines += '</script>'
  $block = ($lines -join "`n") + "`n"
  $linksTag = '<script src="links.js"></script>'
  if ($Text.Contains($linksTag)) { return $Text.Replace($linksTag, $block + $linksTag) }
  return $Text
}
function Update-Figure {
  param([string]$Path,[hashtable]$Positions,[array]$Anchors,[int]$Width,[int]$Height)
  $r = Read-Utf8 -Path $Path
  $t = Set-CanvasSize -Text $r.Text -Width $Width -Height $Height
  $t = Set-Positions  -Text $t       -Positions $Positions
  $t = Set-Anchors    -Text $t       -Anchors $Anchors
  Write-Utf8 -Path $Path -Text $t -Bom $r.Bom
  $nA = if ($null -eq $Anchors) { 0 } else { @($Anchors).Count }
  Write-Host ("Updated {0} ({1}x{2}, {3} ent, {4} anc)" -f $Path,$Width,$Height,$Positions.Count,$nA)
}

# ── Layouts: portraits + sat + mct ─────────────────────────────────────────

$mcdPortraitPos = @{
  user=@{left=840;top=50;width=200}; bgroup=@{left=1330;top=210;width=200};
  perm=@{left=1280;top=20;width=200}; ptpl=@{left=100;top=1810;width=200};
  pstage=@{left=130;top=1320;width=230}; notifrule=@{left=30;top=1030;width=200};
  grille=@{left=1070;top=1790;width=210}; crit=@{left=1080;top=1550;width=230};
  campaign=@{left=780;top=1780;width=200}; form=@{left=780;top=1250;width=200};
  formv=@{left=480;top=840;width=200}; question=@{left=1000;top=1020;width=200};
  answer=@{left=850;top=840;width=200}; source=@{left=360;top=1720;width=200};
  appli=@{left=470;top=1500;width=210}; prog=@{left=140;top=430;width=220};
  quizatt=@{left=580;top=600;width=210}; canswer=@{left=1000;top=600;width=210};
  decision=@{left=870;top=390;width=210}; askcand=@{left=530;top=1060;width=210};
  candint=@{left=1380;top=1370;width=210}; interview=@{left=1370;top=980;width=210};
  ipart=@{left=1280;top=350;width=210}; eval=@{left=1410;top=590;width=210};
  evalitem=@{left=1090;top=1270;width=210}; notif=@{left=330;top=70;width=210};
  maillog=@{left=0;top=770;width=220}; audit=@{left=510;top=200;width=220}
}
$mcdPortraitAnchors = @(
  @{idx=5;end='B';side='left'},
  @{idx=15;end='A';side='bottom'},@{idx=15;end='B';side='top'},
  @{idx=17;end='B';side='left'},
  @{idx=23;end='A';side='right'},
  @{idx=25;end='B';side='right'},
  @{idx=31;end='A';side='bottom'},@{idx=31;end='B';side='top'},
  @{idx=32;end='A';side='right'},@{idx=32;end='B';side='left'},
  @{idx=33;end='B';side='top'},
  @{idx=35;end='A';side='bottom'},@{idx=35;end='B';side='top'},
  @{idx=36;end='A';side='top'},
  @{idx=37;end='A';side='bottom'},@{idx=37;end='B';side='right'},
  @{idx=38;end='A';side='right'},@{idx=38;end='B';side='bottom'}
)

$mldPortraitPos = @{
  user=@{left=860;top=10;width=200}; bgroup=@{left=1300;top=380;width=200};
  ubg=@{left=1030;top=230;width=200}; perm=@{left=1420;top=0;width=200};
  ptpl=@{left=180;top=1910;width=200}; pstage=@{left=90;top=1690;width=230};
  notifrule=@{left=70;top=1280;width=200}; grille=@{left=1290;top=1670;width=210};
  crit=@{left=1010;top=1470;width=230}; campaign=@{left=650;top=1820;width=200};
  campform=@{left=900;top=1700;width=200}; form=@{left=640;top=1450;width=200};
  formv=@{left=640;top=940;width=200}; fq=@{left=910;top=1080;width=200};
  question=@{left=1100;top=880;width=200}; answer=@{left=870;top=760;width=200};
  source=@{left=540;top=1610;width=200}; appli=@{left=370;top=1170;width=210};
  prog=@{left=240;top=510;width=220}; quizatt=@{left=620;top=600;width=210};
  canswer=@{left=1020;top=450;width=210}; decision=@{left=800;top=240;width=210};
  askcand=@{left=310;top=1460;width=210}; candint=@{left=1360;top=1400;width=210};
  interview=@{left=1380;top=980;width=210}; ipart=@{left=1410;top=480;width=210};
  eval=@{left=1170;top=1160;width=210}; evalitem=@{left=880;top=1270;width=210};
  notif=@{left=490;top=0;width=210}; maillog=@{left=60;top=820;width=220};
  audit=@{left=410;top=240;width=220}; emailtpl=@{left=0;top=1080;width=220}
}
$mldPortraitAnchors = @(
  @{idx=6;end='A';side='top'},@{idx=6;end='B';side='bottom'},
  @{idx=7;end='A';side='left'},@{idx=7;end='B';side='right'},
  @{idx=8;end='A';side='bottom'},@{idx=8;end='B';side='top'},
  @{idx=14;end='B';side='bottom'},
  @{idx=15;end='B';side='top'},
  @{idx=18;end='A';side='bottom'},@{idx=19;end='A';side='top'},
  @{idx=21;end='A';side='bottom'},@{idx=21;end='B';side='top'},
  @{idx=22;end='A';side='top'},@{idx=22;end='B';side='bottom'},
  @{idx=23;end='A';side='left'},
  @{idx=25;end='A';side='bottom'},@{idx=25;end='B';side='top'},
  @{idx=27;end='A';side='bottom'},@{idx=27;end='B';side='top'},
  @{idx=29;end='B';side='right'},
  @{idx=32;end='A';side='top'},@{idx=32;end='B';side='right'},
  @{idx=36;end='A';side='bottom'},@{idx=36;end='B';side='top'},
  @{idx=37;end='A';side='bottom'},@{idx=37;end='B';side='right'},
  @{idx=38;end='A';side='top'},
  @{idx=39;end='B';side='left'},
  @{idx=40;end='A';side='top'},
  @{idx=41;end='A';side='bottom'},@{idx=41;end='B';side='top'},
  @{idx=42;end='A';side='bottom'},
  @{idx=44;end='A';side='bottom'},@{idx=44;end='B';side='top'}
)

$mpdPortraitPos = @{
  ptpl=@{left=200;top=1490;width=200}; pstage=@{left=400;top=1180;width=230};
  notifrule=@{left=20;top=1240;width=200}; crit=@{left=990;top=1290;width=230};
  grille=@{left=1020;top=1590;width=210}; campaign=@{left=610;top=1460;width=200};
  campform=@{left=730;top=1180;width=200}; form=@{left=580;top=980;width=200};
  formv=@{left=580;top=710;width=200}; question=@{left=1150;top=520;width=200};
  answer=@{left=830;top=730;width=200}; fq=@{left=870;top=1040;width=200};
  appli=@{left=300;top=650;width=210}; prog=@{left=90;top=250;width=220};
  quizatt=@{left=680;top=250;width=210}; canswer=@{left=1030;top=270;width=210};
  decision=@{left=380;top=130;width=210}; candint=@{left=1270;top=1470;width=210};
  interview=@{left=1600;top=770;width=210}; ipart=@{left=1360;top=240;width=210};
  eval=@{left=1370;top=620;width=210}; evalitem=@{left=1140;top=1070;width=210};
  maillog=@{left=10;top=680;width=220}; audit=@{left=760;top=0;width=220};
  emailtpl=@{left=10;top=990;width=220}; appcfg=@{left=1360;top=30;width=220};
  smtp=@{left=1100;top=10;width=220}
}
$mpdPortraitAnchors = @(
  @{idx=1;end='A';side='right'},
  @{idx=2;end='A';side='top'},@{idx=2;end='B';side='bottom'},
  @{idx=3;end='A';side='bottom'},
  @{idx=4;end='A';side='bottom'},@{idx=4;end='B';side='top'},
  @{idx=12;end='A';side='right'},@{idx=12;end='B';side='top'},
  @{idx=13;end='A';side='top'},@{idx=13;end='B';side='bottom'},
  @{idx=14;end='A';side='bottom'},@{idx=14;end='B';side='top'},
  @{idx=15;end='A';side='left'},@{idx=15;end='B';side='right'},
  @{idx=16;end='A';side='bottom'},@{idx=16;end='B';side='top'},
  @{idx=18;end='A';side='bottom'},@{idx=18;end='B';side='top'},
  @{idx=19;end='A';side='left'},@{idx=19;end='B';side='right'},
  @{idx=20;end='A';side='left'},@{idx=20;end='B';side='right'},
  @{idx=22;end='A';side='right'},
  @{idx=23;end='A';side='bottom'},@{idx=23;end='B';side='top'},
  @{idx=26;end='A';side='bottom'},@{idx=26;end='B';side='top'},
  @{idx=27;end='A';side='bottom'},@{idx=27;end='B';side='top'},
  @{idx=28;end='A';side='top'},
  @{idx=29;end='A';side='left'},@{idx=29;end='B';side='top'}
)

$satPos = @{
  'h-time'=@{left=20;top=20;width=130};   'h-cand'=@{left=180;top=20;width=220};
  'h-syst'=@{left=430;top=20;width=220};  'h-recr'=@{left=680;top=20;width=220};
  'h-eval'=@{left=930;top=20;width=180};  'h-adm'=@{left=1140;top=20;width=180};
  'p0'=@{left=20;top=110;width=130};      't0-adm'=@{left=1140;top=110;width=180};
  't0-recr'=@{left=680;top=110;width=220};'p1'=@{left=20;top=260;width=130};
  't1-cand'=@{left=180;top=260;width=220};'t1-syst'=@{left=430;top=260;width=220};
  'p2'=@{left=20;top=410;width=130};      't2-open'=@{left=430;top=420;width=220};
  't2-cand'=@{left=180;top=410;width=220};'t2-score'=@{left=430;top=540;width=220};
  'p3'=@{left=20;top=680;width=130};      't3-recr-read'=@{left=680;top=680;width=220};
  't3-recr-dec'=@{left=680;top=790;width=220};'t3-syst'=@{left=430;top=790;width=220};
  'p4'=@{left=20;top=930;width=130};      't4-recr-plan'=@{left=680;top=930;width=220};
  't4-syst-notif'=@{left=430;top=930;width=220};'t4-cand-resp'=@{left=180;top=1050;width=220};
  't4-eval'=@{left=930;top=1180;width=180};'t4-syst-aggr'=@{left=430;top=1180;width=220};
  'p5'=@{left=20;top=1340;width=130};     't5-recr'=@{left=680;top=1340;width=220};
  't5-syst'=@{left=430;top=1340;width=220};'p6'=@{left=20;top=1490;width=130};
  't6-recr'=@{left=680;top=1490;width=220};'t6-syst'=@{left=430;top=1490;width=220};
  'p7'=@{left=20;top=1660;width=130};     't7-syst'=@{left=430;top=1660;width=220};
  't7-adm'=@{left=1140;top=1660;width=180}
}
$satAnchors = @(
  @{idx=1;end='B';side='top'},
  @{idx=2;end='A';side='top'},@{idx=2;end='B';side='top'},
  @{idx=3;end='A';side='bottom'},
  @{idx=4;end='A';side='top'},@{idx=4;end='B';side='top'},
  @{idx=5;end='A';side='bottom'},
  @{idx=6;end='B';side='top'},
  @{idx=11;end='B';side='top'},
  @{idx=12;end='B';side='left'},
  @{idx=14;end='B';side='top'},
  @{idx=15;end='A';side='left'},@{idx=15;end='B';side='right'},
  @{idx=16;end='A';side='bottom'},@{idx=16;end='B';side='top'},
  @{idx=18;end='A';side='right'},@{idx=18;end='B';side='left'},
  @{idx=19;end='A';side='right'},@{idx=19;end='B';side='right'},
  @{idx=20;end='A';side='left'},@{idx=20;end='B';side='left'},
  @{idx=21;end='A';side='left'},@{idx=21;end='B';side='left'},
  @{idx=22;end='A';side='left'},@{idx=22;end='B';side='left'},
  @{idx=23;end='A';side='left'},@{idx=23;end='B';side='left'},
  @{idx=24;end='A';side='bottom'},@{idx=24;end='B';side='top'}
)

$mctPos = @{
  't1-e1'=@{left=60;top=30;width=230};   't1-e2'=@{left=330;top=30;width=230};
  't1-e3'=@{left=600;top=30;width=230};  't1-e4'=@{left=870;top=30;width=230};
  't1-s'=@{left=400;top=170;width=320};  't1-op'=@{left=140;top=280;width=880};
  't1-r1'=@{left=140;top=520;width=260}; 't1-r2'=@{left=430;top=520;width=260};
  't1-r3'=@{left=720;top=520;width=300};
  't2-e1'=@{left=60;top=710;width=230};  't2-e2'=@{left=330;top=710;width=230};
  't2-e3'=@{left=600;top=710;width=230}; 't2-s'=@{left=340;top=850;width=320};
  't2-op'=@{left=140;top=960;width=880}; 't2-r1'=@{left=140;top=1240;width=260};
  't2-r2'=@{left=430;top=1240;width=260};'t2-r3'=@{left=720;top=1240;width=300};
  't3-e1'=@{left=60;top=1430;width=230}; 't3-e2'=@{left=330;top=1430;width=230};
  't3-e3'=@{left=600;top=1430;width=230};'t3-e4'=@{left=870;top=1430;width=230};
  't3-s'=@{left=400;top=1570;width=380}; 't3-op'=@{left=140;top=1680;width=880};
  't3-r1'=@{left=140;top=1920;width=280};'t3-r2'=@{left=450;top=1920;width=280};
  't3-r3'=@{left=760;top=1920;width=280};
  't4-e1'=@{left=60;top=2110;width=230}; 't4-e2'=@{left=330;top=2110;width=230};
  't4-e3'=@{left=620;top=2110;width=230};'t4-s'=@{left=340;top=2250;width=320};
  't4-op'=@{left=1140;top=0;width=300};  't4-r1'=@{left=1260;top=400;width=300};
  't4-r2'=@{left=1120;top=500;width=300};'t4-r3'=@{left=1190;top=650;width=300};
  't5-e1'=@{left=1160;top=770;width=300};'t5-e2'=@{left=1140;top=880;width=300};
  't5-s'=@{left=1170;top=1010;width=240};'t5-op'=@{left=1140;top=1110;width=300};
  't5-r1'=@{left=1140;top=1390;width=300};'t5-r2'=@{left=1140;top=1510;width=300};
  'audit-e'=@{left=1140;top=1650;width=300};'audit-op'=@{left=1140;top=1770;width=300};
  'audit-r'=@{left=1140;top=1990;width=300}
}
$mctAnchors = @(
  @{idx=0;end='A';side='bottom'},
  @{idx=2;end='A';side='bottom'},@{idx=2;end='B';side='top'},
  @{idx=3;end='A';side='bottom'},
  @{idx=5;end='B';side='left'},
  @{idx=7;end='A';side='right'},@{idx=7;end='B';side='right'},
  @{idx=9;end='A';side='bottom'},
  @{idx=11;end='A';side='bottom'},
  @{idx=13;end='A';side='bottom'},@{idx=13;end='B';side='top'},
  @{idx=15;end='A';side='bottom'},@{idx=15;end='B';side='top'},
  @{idx=17;end='A';side='bottom'},
  @{idx=18;end='A';side='bottom'},@{idx=18;end='B';side='top'},
  @{idx=20;end='A';side='bottom'},
  @{idx=22;end='B';side='left'},
  @{idx=24;end='B';side='right'},
  @{idx=28;end='A';side='right'},@{idx=28;end='B';side='right'},
  @{idx=29;end='A';side='top'},@{idx=29;end='B';side='bottom'},
  @{idx=30;end='A';side='right'},@{idx=30;end='B';side='right'},
  @{idx=32;end='A';side='right'},@{idx=32;end='B';side='right'},
  @{idx=36;end='A';side='left'},@{idx=36;end='B';side='left'},
  @{idx=37;end='A';side='right'},@{idx=37;end='B';side='right'},
  @{idx=38;end='A';side='left'},@{idx=38;end='B';side='left'},
  @{idx=39;end='A';side='right'},@{idx=39;end='B';side='right'},
  @{idx=42;end='A';side='bottom'},
  @{idx=46;end='A';side='right'},@{idx=46;end='B';side='right'}
)

# Apply
Update-Figure -Path 'mcd_cible_portrait.html' -Positions $mcdPortraitPos -Anchors $mcdPortraitAnchors -Width 1620 -Height 2460
Update-Figure -Path 'mld_cible_portrait.html' -Positions $mldPortraitPos -Anchors $mldPortraitAnchors -Width 1620 -Height 2760
Update-Figure -Path 'mpd_cible_portrait.html' -Positions $mpdPortraitPos -Anchors $mpdPortraitAnchors -Width 1820 -Height 1860
Update-Figure -Path 'sat.html' -Positions $satPos -Anchors $satAnchors -Width 1480 -Height 1900
Update-Figure -Path 'mct.html' -Positions $mctPos -Anchors $mctAnchors -Width 1680 -Height 2380

# ── Class diagram: copy positions from MCD portrait via key mapping ──────
$mcdToClass = @{
  'user'='user'; 'perm'='entperm'; 'ptpl'='ptpl'; 'pstage'='pstage';
  'campaign'='campaign'; 'form'='form'; 'formv'='formver';
  'question'='question'; 'answer'='answer'; 'source'='source';
  'appli'='appli'; 'prog'='progress'; 'quizatt'='attempt';
  'canswer'='canswer'; 'decision'='decision';
  'candint'='cinterview'; 'interview'='interview';
  'eval'='evaluation'; 'notif'='notif'; 'audit'='audit'
}
$classPos = @{}
foreach ($k in $mcdToClass.Keys) {
  $target = $mcdToClass[$k]
  $p = $mcdPortraitPos[$k]
  if ($p) { $classPos[$target] = @{ left=$p.left; top=$p.top; width=$p.width } }
}
# Extras not in MCD: campcrud, formq, override — placed in free zones
$classPos['campcrud'] = @{ left=1300; top=1820; width=210 }
$classPos['formq']    = @{ left=1100;  top=1100; width=210 }
$classPos['override'] = @{ left=1300; top=130;  width=210 }

Update-Figure -Path 'class_diagram.html' -Positions $classPos -Anchors @() -Width 1620 -Height 2460

# ── Use cases ──────────────────────────────────────────────────────────────
$useCasesPos = @{
  'a-cand'=@{left=20;top=200;width=130}; 'a-recr'=@{left=1330;top=200;width=130};
  'a-adm'=@{left=20;top=850;width=130}; 'a-sadm'=@{left=1330;top=850;width=130};
  'uc-postuler'=@{left=245;top=95;width=200}; 'uc-verifier'=@{left=495;top=165;width=200};
  'uc-quiz'=@{left=245;top=235;width=200}; 'uc-suivre'=@{left=495;top=305;width=200};
  'uc-repondre'=@{left=245;top=375;width=200}; 'uc-demander'=@{left=495;top=445;width=200};
  'uc-camp'=@{left=815;top=95;width=200}; 'uc-form'=@{left=1065;top=95;width=210};
  'uc-publier'=@{left=815;top=165;width=200}; 'uc-source'=@{left=1065;top=165;width=210};
  'uc-suivi'=@{left=815;top=235;width=200}; 'uc-corriger'=@{left=1065;top=235;width=210};
  'uc-planif'=@{left=815;top=305;width=200}; 'uc-evaluer'=@{left=1065;top=305;width=210};
  'uc-decider'=@{left=815;top=375;width=200}; 'uc-annuler'=@{left=1065;top=375;width=210};
  'uc-partager'=@{left=940;top=445;width=220};
  'uc-users'=@{left=245;top=575;width=200}; 'uc-roles'=@{left=495;top=575;width=210};
  'uc-perm'=@{left=245;top=645;width=200}; 'uc-ref'=@{left=495;top=645;width=210};
  'uc-questions'=@{left=245;top=715;width=200}; 'uc-mail'=@{left=495;top=715;width=210};
  'uc-import'=@{left=370;top=785;width=240};
  'uc-smtp'=@{left=815;top=575;width=200}; 'uc-global'=@{left=1065;top=575;width=210};
  'uc-supadmin'=@{left=815;top=645;width=200}; 'uc-audit'=@{left=1065;top=645;width=210};
  'uc-template'=@{left=940;top=715;width=220};
  'uc-dash'=@{left=335;top=975;width=230}; 'uc-notif'=@{left=910;top=975;width=230};
  'uc-filtre'=@{left=335;top=1050;width=230}; 'uc-stats'=@{left=910;top=1050;width=230};
  'uc-export'=@{left=620;top=1125;width=240}
}
$useCasesAnchors = @(
  @{idx=13;end='B';side='right'},
  @{idx=19;end='A';side='left'}, @{idx=20;end='B';side='left'},
  @{idx=21;end='B';side='bottom'}, @{idx=22;end='A';side='right'},
  @{idx=23;end='B';side='bottom'},
  @{idx=25;end='B';side='left'}, @{idx=26;end='A';side='right'}, @{idx=26;end='B';side='bottom'},
  @{idx=27;end='A';side='top'},
  @{idx=32;end='B';side='right'}, @{idx=33;end='B';side='bottom'},
  @{idx=34;end='A';side='left'}, @{idx=34;end='B';side='right'}
)
Update-Figure -Path 'use_cases.html' -Positions $useCasesPos -Anchors $useCasesAnchors -Width 1480 -Height 1300

# ── Organisation Synelia ──────────────────────────────────────────────────
$orgPos = @{
  'pk'=@{left=560;top=40;width=300}; 'dg'=@{left=560;top=150;width=300};
  'sg'=@{left=60;top=290;width=280}; 'dint'=@{left=380;top=290;width=280};
  'dt'=@{left=700;top=290;width=280}; 'dc'=@{left=1020;top=290;width=280};
  'exp1'=@{left=30;top=470;width=200}; 'exp2'=@{left=250;top=470;width=200};
  'exp3'=@{left=470;top=470;width=200}; 'exp4'=@{left=690;top=470;width=200};
  'exp5'=@{left=910;top=470;width=200}; 'exp6'=@{left=1130;top=470;width=200};
  'u1'=@{left=60;top=640;width=260}; 'u2'=@{left=360;top=640;width=260};
  'u3'=@{left=660;top=640;width=260}; 'u4'=@{left=960;top=640;width=280};
  'loc1'=@{left=120;top=810;width=200}; 'loc2'=@{left=360;top=810;width=200};
  'loc3'=@{left=600;top=810;width=200}; 'loc4'=@{left=840;top=810;width=280};
  'qa'=@{left=380;top=960;width=680}
}
$orgAnchors = @(
  @{idx=1;end='B';side='top'},
  @{idx=2;end='A';side='bottom'}, @{idx=2;end='B';side='top'},
  @{idx=4;end='B';side='top'}, @{idx=5;end='A';side='right'}
)
Update-Figure -Path 'organisation_synelia.html' -Positions $orgPos -Anchors $orgAnchors -Width 1440 -Height 1080

Write-Host ''
Write-Host 'Done.'
