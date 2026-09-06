Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'

# Dark background #030712
$bgColor = [System.Drawing.Color]::FromArgb(0x03, 0x07, 0x12)
$g.Clear($bgColor)

# Subtle grid pattern #111a2e
$gridColor = [System.Drawing.Color]::FromArgb(0x11, 0x1a, 0x2e)
$pen = New-Object System.Drawing.Pen($gridColor, 1)
for ($i = 0; $i -lt $width; $i += 40) { $g.DrawLine($pen, $i, 0, $i, $height) }
for ($j = 0; $j -lt $height; $j += 40) { $g.DrawLine($pen, 0, $j, $width, $j) }

# Snake body - diagonal green squares using RGB directly
$snakeColors = @(
  [System.Drawing.Color]::FromArgb(0x10, 0xb9, 0x81),
  [System.Drawing.Color]::FromArgb(0x34, 0xd3, 0x99),
  [System.Drawing.Color]::FromArgb(0x6e, 0xe7, 0xb7),
  [System.Drawing.Color]::FromArgb(0xa7, 0xf3, 0xd0)
)
for ($k = 0; $k -lt 8; $k++) {
  $x = 200 + $k * 50
  $y = 200 + $k * 30
  $brush = New-Object System.Drawing.SolidBrush($snakeColors[$k % $snakeColors.Count])
  $g.FillRectangle($brush, $x, $y, 36, 36)
  $borderPen = New-Object System.Drawing.Pen($bgColor, 2)
  $g.DrawRectangle($borderPen, $x, $y, 36, 36)
}

# Snake head #10b981
$headColor = [System.Drawing.Color]::FromArgb(0x10, 0xb9, 0x81)
$headBrush = New-Object System.Drawing.SolidBrush($headColor)
$g.FillEllipse($headBrush, 550, 410, 44, 44)

# Eye white
$g.FillEllipse([System.Drawing.Brushes]::White, 568, 425, 8, 8)

# Food red #f43f5e
$foodColor = [System.Drawing.Color]::FromArgb(0xf4, 0x3f, 0x5e)
$foodBrush = New-Object System.Drawing.SolidBrush($foodColor)
$g.FillRectangle($foodBrush, 650, 415, 28, 28)

# Title text
$fontTitle = New-Object System.Drawing.Font('Segoe UI', 80, [System.Drawing.FontStyle]::Bold)
$titleColor = [System.Drawing.Color]::FromArgb(0x10, 0xb9, 0x81)
$brushTitle = New-Object System.Drawing.SolidBrush($titleColor)
$g.DrawString('SNAKE', $fontTitle, $brushTitle, 120, 80)

$xColor = [System.Drawing.Color]::FromArgb(0x6e, 0xe7, 0xb7)
$brushX = New-Object System.Drawing.SolidBrush($xColor)
$g.DrawString('X', $fontTitle, $brushX, 480, 80)

# Subtitle #94a3b8
$fontSub = New-Object System.Drawing.Font('Segoe UI', 24, [System.Drawing.FontStyle]::Regular)
$subColor = [System.Drawing.Color]::FromArgb(0x94, 0xa3, 0xb8)
$brushSub = New-Object System.Drawing.SolidBrush($subColor)
$g.DrawString('Kombo · Power-up · Mode tembus dinding', $fontSub, $brushSub, 120, 180)

# Save
$bmp.Save('D:\web\projects\Game\snake-x\public\og-image.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host 'og-image.png created'