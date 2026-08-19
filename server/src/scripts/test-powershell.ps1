Write-Host "1. Testing Simple TwiML Endpoint..."
$twiml = Invoke-RestMethod -Uri "http://localhost:5000/api/integrations/twilio/simple-twiml" -Method GET
Write-Host $twiml

Write-Host "`n2. Testing Simple Outbound Twilio Call (Recipient #1: Amruta)..."
$body = @{
    recipientIndex = 1
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:5000/api/integrations/twilio/test-call" -Method POST -ContentType "application/json" -Body $body
    Write-Host "SUCCESS:"
    $res | ConvertTo-Json
} catch {
    Write-Host "TWILIO ERROR RESPONSE:"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    } else {
        Write-Host $_.Exception.Message
    }
}
