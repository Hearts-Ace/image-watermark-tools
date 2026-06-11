param([int]$PreferredPort = 38472)

function Find-AvailablePort([int]$StartPort) {
    for ($port = $StartPort; $port -lt ($StartPort + 50); $port++) {
        $tcp = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
        try {
            $tcp.Start()
            $tcp.Stop()
            return $port
        } catch {
            continue
        }
    }
    throw "No available port in range $StartPort - $($StartPort + 49)"
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = Find-AvailablePort -StartPort $PreferredPort

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
    $listener.Start()
} catch {
    Write-Host ""
    Write-Host "  Failed to start server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Try closing other apps or run as administrator." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

$url = "http://127.0.0.1:$Port/"
Write-Host ""
Write-Host "  Photo Watermark Tools is running" -ForegroundColor Green
Write-Host "  URL: $url" -ForegroundColor Cyan
Write-Host "  Page title should be: Photo Watermark & Border" -ForegroundColor DarkGray
Write-Host "  Close this window to stop" -ForegroundColor DarkGray
Write-Host ""

Start-Process $url

$mimes = @{
    '.html' = 'text/html; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.webp' = 'image/webp'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2' = 'font/woff2'
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }

        $relative = $path.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
        $filePath = Join-Path $root $relative

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [IO.Path]::GetExtension($filePath).ToLower()
            $mime = $mimes[$ext]
            if (-not $mime) { $mime = 'application/octet-stream' }

            $bytes = [IO.File]::ReadAllBytes($filePath)
            $response.StatusCode = 200
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
