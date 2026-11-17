$pythonCandidates = @(
    "$env:LOCALAPPDATA\Python\bin\python.exe",
    "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\python.exe",
    "$PSScriptRoot\..\.venv\Scripts\python.exe",
    "$PSScriptRoot\.venv\Scripts\python.exe",
    "python"
)
$pyExe = "python"
foreach ($cand in $pythonCandidates) {
    if (Test-Path $cand) {
        $pyExe = $cand
        break
    }
}

Set-Location -Path "$PSScriptRoot\backend"
& $pyExe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
