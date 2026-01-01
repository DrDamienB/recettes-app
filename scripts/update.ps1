###############################################################################
# Script de mise à jour automatique pour l'application Recettes (Windows)
# Usage: .\scripts\update.ps1 [-Force] [-NoBackup]
###############################################################################

param(
    [switch]$Force,
    [switch]$NoBackup
)

$ErrorActionPreference = "Stop"

# Configuration
$ContainerName = "recettes-app"
$BackupDir = "C:\Docker\backups\recettes-app"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

###############################################################################
# Fonctions
###############################################################################

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

# Vérifier si Docker est en cours d'exécution
function Test-DockerRunning {
    try {
        docker ps | Out-Null
        return $true
    }
    catch {
        Write-Error-Custom "Docker n'est pas en cours d'exécution"
        exit 1
    }
}

# Vérifier si le conteneur existe
function Test-Container {
    $containers = docker ps -a --format '{{.Names}}'
    if ($containers -notcontains $ContainerName) {
        Write-Error-Custom "Le conteneur $ContainerName n'existe pas"
        exit 1
    }
}

# Sauvegarder la base de données
function Backup-Database {
    if ($NoBackup) {
        Write-Warning-Custom "Sauvegarde désactivée (-NoBackup)"
        return
    }

    Write-Step "Sauvegarde de la base de données"

    # Créer le dossier de backup s'il n'existe pas
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }

    # Copier la base de données
    try {
        docker cp "${ContainerName}:/data/recettes.sqlite" "$BackupDir\recettes_$Timestamp.sqlite"
    }
    catch {
        Write-Warning-Custom "Impossible de sauvegarder la base (peut-être vide)"
    }

    # Garder seulement les 10 dernières sauvegardes
    Get-ChildItem "$BackupDir\recettes_*.sqlite" |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip 10 |
        Remove-Item -Force

    Write-Success "Base de données sauvegardée"
}

# Vérifier s'il y a des mises à jour
function Test-Updates {
    Write-Step "Vérification des mises à jour disponibles"

    $scriptPath = Split-Path -Parent $PSScriptRoot
    Set-Location $scriptPath

    # Récupérer les dernières modifications
    git fetch origin main

    # Comparer avec la version locale
    $local = git rev-parse HEAD
    $remote = git rev-parse origin/main

    if ($local -eq $remote) {
        if ($Force) {
            Write-Warning-Custom "Aucune mise à jour, mais -Force activé"
            return $true
        }
        else {
            Write-Success "Application déjà à jour"
            exit 0
        }
    }

    Write-Success "Mises à jour disponibles"
    Write-Host ""
    git log --oneline HEAD..origin/main
    Write-Host ""

    return $true
}

# Mettre à jour le code
function Update-Code {
    Write-Step "Récupération du nouveau code"

    $scriptPath = Split-Path -Parent $PSScriptRoot
    Set-Location $scriptPath

    git pull origin main

    Write-Success "Code mis à jour"
}

# Reconstruire et redémarrer
function Rebuild-Container {
    Write-Step "Reconstruction de l'image Docker"

    $scriptPath = Split-Path -Parent $PSScriptRoot
    Set-Location $scriptPath

    # Arrêter le conteneur
    try {
        docker stop $ContainerName
    }
    catch {
        Write-Warning-Custom "Le conteneur n'était pas en cours d'exécution"
    }

    # Reconstruire sans cache
    docker-compose build --no-cache

    Write-Success "Image reconstruite"
}

# Démarrer le nouveau conteneur
function Start-Container {
    Write-Step "Démarrage du conteneur"

    $scriptPath = Split-Path -Parent $PSScriptRoot
    Set-Location $scriptPath

    docker-compose up -d

    # Attendre que le conteneur soit healthy
    Write-Step "Vérification de l'état du conteneur"

    $maxAttempts = 30
    $attempt = 0

    while ($attempt -lt $maxAttempts) {
        try {
            $health = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
            if ($health -eq "healthy") {
                Write-Success "Conteneur démarré et opérationnel"
                return
            }
        }
        catch {
            # Continuer
        }

        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $attempt++
    }

    Write-Host ""
    Write-Error-Custom "Le conteneur n'est pas devenu healthy après 60 secondes"
    Write-Warning-Custom "Vérifiez les logs: docker logs $ContainerName"
    exit 1
}

# Nettoyer les anciennes images
function Clean-OldImages {
    Write-Step "Nettoyage des anciennes images"

    docker image prune -f | Out-Null

    Write-Success "Nettoyage effectué"
}

###############################################################################
# Exécution principale
###############################################################################

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Mise à jour - Application Recettes       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Test-DockerRunning
Test-Container
Backup-Database
Test-Updates
Update-Code
Rebuild-Container
Start-Container
Clean-OldImages

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ Mise à jour terminée avec succès       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "L'application est accessible sur: http://localhost:3007"
Write-Host "Logs: docker logs -f $ContainerName"
Write-Host ""
