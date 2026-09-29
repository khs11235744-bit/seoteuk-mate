param(
  [ValidateSet('local','lite','full')]
  [string]$Mode='local'
)

$ErrorActionPreference='SilentlyContinue'
$Root=$PSScriptRoot
$FlowRoot=Join-Path $env:USERPROFILE 'Documents\ChatGPT\KHS_FLOW_OS_v0.3'
$Ollama=Join-Path $env:LOCALAPPDATA 'Programs\Ollama\ollama.exe'

function Port-Up([int]$Port){
  return [bool](Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
}

if(-not (Port-Up 11434) -and (Test-Path $Ollama)){
  foreach($k in @('OLLAMA_ORIGINS','OLLAMA_FLASH_ATTENTION','OLLAMA_CONTEXT_LENGTH','OLLAMA_NUM_PARALLEL','OLLAMA_MAX_LOADED_MODELS','OLLAMA_KEEP_ALIVE','LLAMA_ARG_FIT_TARGET')){
    $v=[Environment]::GetEnvironmentVariable($k,'User')
    if($v){Set-Item -Path "Env:$k" -Value $v}
  }
  Start-Process -FilePath $Ollama -ArgumentList 'serve' -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

if(-not (Port-Up 13731) -and (Test-Path (Join-Path $FlowRoot 'khs-flow.mjs'))){
  $node=(Get-Command node.exe -ErrorAction SilentlyContinue).Source
  if($node){
    Start-Process -FilePath $node -ArgumentList @((Join-Path $FlowRoot 'khs-flow.mjs'),'server') -WorkingDirectory $FlowRoot -WindowStyle Hidden
    Start-Sleep -Seconds 2
  }
}

if(-not (Port-Up 8767)){
  $py=(Get-Command python.exe -ErrorAction SilentlyContinue).Source
  if(-not $py){$py=(Get-Command python -ErrorAction SilentlyContinue).Source}
  if($py){
    Start-Process -FilePath $py -ArgumentList @((Join-Path $Root 'local-server.py'),'--port','8767') -WorkingDirectory $Root -WindowStyle Hidden
    Start-Sleep -Seconds 2
  }else{
    Write-Host 'Python을 찾지 못했습니다.'
    exit 2
  }
}

$page=if($Mode -eq 'lite'){'lite.html'}elseif($Mode -eq 'full'){'index.html'}else{'local.html'}
Start-Process "http://127.0.0.1:8767/$page"
Write-Host "Seoteuk Mate $Mode started: http://127.0.0.1:8767/$page"
Write-Host 'Ollama:' (Port-Up 11434) 'Flow:' (Port-Up 13731) 'Local bridge:' (Port-Up 8767)
