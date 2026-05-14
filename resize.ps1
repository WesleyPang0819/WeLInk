$sourceImage = "C:\Users\user\.gemini\antigravity\brain\tempmediaStorage\media__1778769795462.png"
$publicDir = "c:\Users\user\Downloads\WeLInk-main\WeLInk-main\public"

if (!(Test-Path $publicDir)) {
    New-Item -ItemType Directory -Force -Path $publicDir
}

Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile($sourceImage)

function Resize-Image($size, $filename) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $size, $size)
    $g.Dispose()
    $bmp.Save("$publicDir\$filename", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

Resize-Image 16 "favicon-16.png"
Resize-Image 32 "favicon-32.png"
Resize-Image 180 "apple-touch-icon.png"
Resize-Image 192 "icon-192.png"
Resize-Image 512 "icon-512.png"
Resize-Image 512 "maskable-icon-512.png"

$bmp = New-Object System.Drawing.Bitmap(32, 32)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, 32, 32)
$g.Dispose()
$bmp.Save("$publicDir\favicon.ico", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

$img.Dispose()
