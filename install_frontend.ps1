$env:PATH = "C:\Users\rudra\nodejs;" + $env:PATH
Write-Host "Node path: $(Get-Command node | Select-Object -ExpandProperty Source)"
Write-Host "NPM path: $(Get-Command npm | Select-Object -ExpandProperty Source)"
Set-Location -Path "c:\Users\rudra\OneDrive\Desktop\CareerOS\frontend"
npm install
npm run build
