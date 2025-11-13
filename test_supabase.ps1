$SUP_URL = "https://hztkspqunxeauawqcikw.supabase.co"
$ANON = "sb_publishable_rZtJ7xTLTI8ubfk2jRBYNw_EW2HNI7B"

$uri = "$SUP_URL/rest/v1/profiles?select=*&limit=1"

$headers = @{
    "apikey" = $ANON
    "Authorization" = "Bearer $ANON"
}

try {
    Write-Host "Testing Supabase connection..."
    Write-Host "URL: $uri"
    Write-Host "---"
    
    $response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers -TimeoutSec 5
    
    Write-Host "SUCCESS! Response:"
    Write-Host ($response | ConvertTo-Json -Depth 5)
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    Write-Host "Full Exception: $($_.Exception | ConvertTo-Json -Depth 3)"
    
    if ($_.Exception.Response) {
        Write-Host "HTTP Status: $($_.Exception.Response.StatusCode)"
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    }
}
