param(
    [Parameter(Mandatory = $true)]
    [string]$ResultsDirectory,

    [Parameter(Mandatory = $true)]
    [string]$Title
)

$trxFile = Get-ChildItem -Path $ResultsDirectory -Recurse -Filter '*.trx' -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $trxFile) {
    Write-Host "No TRX file found in $ResultsDirectory."
    return
}

if (-not $env:GITHUB_STEP_SUMMARY) {
    Write-Host 'GITHUB_STEP_SUMMARY is not set. Skipping summary output.'
    return
}

function Get-SuiteName {
    param([string]$TestTitle)

    switch ($TestTitle) {
        'Unit Tests' { 'Unit' }
        'Integration Tests' { 'Integration' }
        default { $TestTitle }
    }
}

function Add-TestSummaryRow {
    param(
        [string]$Suite,
        [int]$Passed,
        [int]$Failed,
        [int]$Total,
        [switch]$Bold
    )

    if ($Bold) {
        "| **$Suite** | **$Passed** | **$Failed** | **$Total** |" >> $env:GITHUB_STEP_SUMMARY
        return
    }

    "| $Suite | $Passed | $Failed | $Total |" >> $env:GITHUB_STEP_SUMMARY
}

[xml]$trx = Get-Content -LiteralPath $trxFile.FullName -Raw
$counters = $trx.TestRun.ResultSummary.Counters
$suiteName = Get-SuiteName -TestTitle $Title
$summaryFile = Join-Path 'artifacts' 'test-summary.json'
$passed = [int]$counters.passed
$failed = [int]$counters.failed
$total = [int]$counters.total
$result = [ordered]@{
    suite = $suiteName
    passed = $passed
    failed = $failed
    total = $total
}

if ($suiteName -eq 'Unit') {
    $result | ConvertTo-Json | Set-Content -LiteralPath $summaryFile

    '## Test Summary' >> $env:GITHUB_STEP_SUMMARY
    '' >> $env:GITHUB_STEP_SUMMARY
    '| Suite | Passed | Failed | Total |' >> $env:GITHUB_STEP_SUMMARY
    '| ----- | -----: | -----: | ----: |' >> $env:GITHUB_STEP_SUMMARY
    Add-TestSummaryRow -Suite $suiteName -Passed $passed -Failed $failed -Total $total
    return
}

if (Test-Path -LiteralPath $summaryFile) {
    $unitResult = Get-Content -LiteralPath $summaryFile -Raw | ConvertFrom-Json
    Add-TestSummaryRow -Suite $suiteName -Passed $passed -Failed $failed -Total $total
    Add-TestSummaryRow `
        -Suite 'Total' `
        -Passed ([int]$unitResult.passed + $passed) `
        -Failed ([int]$unitResult.failed + $failed) `
        -Total ([int]$unitResult.total + $total) `
        -Bold
    return
}

'## Test Summary' >> $env:GITHUB_STEP_SUMMARY
'' >> $env:GITHUB_STEP_SUMMARY
'| Suite | Passed | Failed | Total |' >> $env:GITHUB_STEP_SUMMARY
'| ----- | -----: | -----: | ----: |' >> $env:GITHUB_STEP_SUMMARY
Add-TestSummaryRow -Suite $suiteName -Passed $passed -Failed $failed -Total $total
