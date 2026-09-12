Write-Host "1. Testing Exotel Status Endpoint..."
$status = Invoke-RestMethod -Uri "http://localhost:5000/api/integrations/exotel/status" -Method GET
$status | ConvertTo-Json

Write-Host "`n2. Testing Outbound Exotel Call..."
$body = @{
    phone = "+919844328475"
    message = "Hello. This is Recovera regarding your upcoming clinical consultation."
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:5000/api/integrations/exotel/test-call" -Method POST -ContentType "application/json" -Body $body
    Write-Host "SUCCESS:"
    $res | ConvertTo-Json
} catch {
    Write-Host "EXOTEL RESPONSE / ERROR:"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    } else {
        Write-Host $_.Exception.Message
    }
}
