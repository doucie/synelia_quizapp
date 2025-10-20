@echo off
echo ========================================
echo  Demarrage du serveur Spring Boot
echo  Projet: Quiz Application
echo ========================================
echo.

cd quizapp

echo [1/3] Verification du dossier uploads...
if not exist "uploads\cv" (
    echo Creation du dossier uploads/cv...
    mkdir uploads\cv
    echo Dossier cree avec succes!
) else (
    echo Dossier uploads/cv existe deja.
)
echo.

echo [2/3] Nettoyage et compilation...
call mvnw clean compile
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo ERREUR: La compilation a echoue!
    echo ========================================
    pause
    exit /b 1
)
echo.

echo [3/3] Demarrage du serveur...
echo.
echo ========================================
echo  Serveur demarre sur http://localhost:8081
echo  Appuyez sur Ctrl+C pour arreter
echo ========================================
echo.

call mvnw spring-boot:run

pause
