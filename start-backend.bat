@echo off
cd /d "%~dp0\quizapp"
echo Starting Spring Boot Server...
echo Current directory: %CD%
mvn spring-boot:run
