$targetDir = "C:\Users\rudra\nodejs"
$zipFile = "C:\Users\rudra\node.zip"
$tmpDir = "C:\Users\rudra\node_extract"

if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Write-Host "Downloading Node.js..."
Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip" -OutFile $zipFile
Write-Host "Extracting Node.js..."
Expand-Archive -Path $zipFile -DestinationPath $tmpDir -Force
Copy-Item -Path "$tmpDir\node-v20.18.0-win-x64\*" -Destination $targetDir -Recurse -Force
Remove-Item -Path $tmpDir -Recurse -Force
Remove-Item -Path $zipFile -Force
Write-Host "Node.js installed successfully in $targetDir"
