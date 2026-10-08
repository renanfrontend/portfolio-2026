# Gera um WAV por trecho de narração com uma voz do Windows (OneCore), sem serviços externos.
# Uso: powershell -File tts.ps1 -Json narration.json -OutDir pasta [-Voice Daniel] [-Rate 1.05]
# narration.json: [{ "id": "intro", "ssml": "<speak ...>...</speak>" }, ...]
param(
  [Parameter(Mandatory = $true)][string]$Json,
  [Parameter(Mandatory = $true)][string]$OutDir,
  [string]$Voice = "Daniel",
  [double]$Rate = 1.12
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]

# Espera uma operação assíncrona do WinRT (IAsyncOperation<T>) no PowerShell 5.1.
$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() |
  Where-Object { $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } |
  Select-Object -First 1
function Await($operation, [Type]$resultType) {
  $task = $asTaskGeneric.MakeGenericMethod($resultType).Invoke($null, @($operation))
  $task.Wait(-1) | Out-Null
  return $task.Result
}

$synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
$selected = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.DisplayName -like "*$Voice*" -and $_.Language -eq "pt-BR" } | Select-Object -First 1
if (-not $selected) { throw "Voz '$Voice' (pt-BR) não encontrada." }
$synth.Voice = $selected
$synth.Options.SpeakingRate = $Rate

New-Item -ItemType Directory -Force $OutDir | Out-Null
$items = Get-Content $Json -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($item in $items) {
  $stream = Await ($synth.SynthesizeSsmlToStreamAsync($item.ssml)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
  $size = [uint32]$stream.Size
  $reader = New-Object Windows.Storage.Streams.DataReader ($stream.GetInputStreamAt(0))
  $null = Await ($reader.LoadAsync($size)) ([uint32])
  $bytes = New-Object byte[] $size
  $reader.ReadBytes($bytes)
  [IO.File]::WriteAllBytes((Join-Path $OutDir "$($item.id).wav"), $bytes)
  Write-Output "$($item.id).wav $size bytes"
}
