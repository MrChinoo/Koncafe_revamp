# Raster companions for site/favicon.svg. Run from the repository root on Windows.
Add-Type -AssemblyName System.Drawing

$assetDirectory = Join-Path (Resolve-Path -LiteralPath site).Path ''

function New-Icon([int] $size, [string] $fileName) {
  $scale = [single]($size / 64.0)
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $background = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#24251f'))
  $cream = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#fffaf0'))
  $accent = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#ce7d52'))
  $rounded = [System.Drawing.Drawing2D.GraphicsPath]::new()

  try {
    $diameter = 34 * $scale
    $edge = $size - $diameter
    $rounded.AddArc(0, 0, $diameter, $diameter, 180, 90)
    $rounded.AddArc($edge, 0, $diameter, $diameter, 270, 90)
    $rounded.AddArc($edge, $edge, $diameter, $diameter, 0, 90)
    $rounded.AddArc(0, $edge, $diameter, $diameter, 90, 90)
    $rounded.CloseFigure()
    $graphics.FillPath($background, $rounded)

    $coordinates = @(
      @(17, 15), @(25, 15), @(25, 33), @(43, 15), @(54, 15),
      @(34, 35), @(55, 49), @(43, 49), @(25, 36), @(25, 49), @(17, 49)
    )
    $points = [System.Drawing.PointF[]]($coordinates | ForEach-Object {
      [System.Drawing.PointF]::new([single]($_[0] * $scale), [single]($_[1] * $scale))
    })
    $graphics.FillPolygon($cream, $points)
    $graphics.FillEllipse($accent, 47 * $scale, 9 * $scale, 8 * $scale, 8 * $scale)

    $destination = Join-Path $assetDirectory $fileName
    $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $rounded.Dispose()
    $background.Dispose()
    $cream.Dispose()
    $accent.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

New-Icon 32 'favicon-32.png'
New-Icon 180 'apple-touch-icon.png'
New-Icon 192 'icon-192.png'
New-Icon 512 'icon-512.png'
