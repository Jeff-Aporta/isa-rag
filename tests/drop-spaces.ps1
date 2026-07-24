$login = Invoke-WebRequest -Method POST -Uri "https://worker-isa-rag.jeffaporta.workers.dev/api/auth/login" -TimeoutSec 15 -UseBasicParsing -ContentType "application/json" -Body '{"username":"jagudeloe","password":"admn123"}'
$tok = ($login.Content | ConvertFrom-Json).token
foreach ($id in @('spc_6cbd3d16e8c3','spc_3c32aa78e90e')) {
  try {
    $r = Invoke-WebRequest -Method DELETE -Uri ("https://worker-isa-rag.jeffaporta.workers.dev/api/spaces/$id") -TimeoutSec 30 -UseBasicParsing -Headers @{"Authorization"="Bearer $tok"}
    Write-Output ("DEL $id -> " + $r.StatusCode)
  } catch {
    Write-Output ("ERR $id -> " + $_.Exception.Message)
  }
}
