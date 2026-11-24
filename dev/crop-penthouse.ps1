# Builds public/images/algiers-penthouse.jpg: a 3:2 reframe of the Algiers bay
# photo that shows the harbour and moored boats, so the premium listing card no
# longer repeats the homepage hero shot.
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$source = Join-Path $root 'public\images\hero-algiers.jpg'
$target = Join-Path $root 'public\images\algiers-penthouse.jpg'

$img = [System.Drawing.Image]::FromFile($source)
try {
  $crop = New-Object System.Drawing.Rectangle 800, 181, 736, 491
  $out = New-Object System.Drawing.Bitmap 1180, 787
  try {
    $g = [System.Drawing.Graphics]::FromImage($out)
    try {
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, 1200, 800), $crop, [System.Drawing.GraphicsUnit]::Pixel)
    } finally { $g.Dispose() }

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $params = New-Object System.Drawing.Imaging.EncoderParameters 1
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88
    $out.Save($target, $codec, $params)
  } finally { $out.Dispose() }
} finally { $img.Dispose() }

$file = Get-Item $target
Write-Output ("wrote {0} ({1:N0} bytes)" -f $file.Name, $file.Length)
