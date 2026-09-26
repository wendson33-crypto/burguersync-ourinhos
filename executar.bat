@echo off
chcp 65001 > nul
title BurguerSync Ourinhos - Servidor de Desenvolvimento Local

echo ================================================================
echo   🍔 BurguerSync Ourinhos - Hamburgueria Artesanal & KDS Realtime
echo ================================================================
echo.

echo [*] Verificando ambiente Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js nao foi encontrado no PATH. Instale o Node.js v18+ para prosseguir.
    pause
    exit /b 1
)

echo [*] Validando credenciais do ambiente (.env)...
node execution/validate-env.js
if %errorlevel% neq 0 (
    echo [X] Falha na validacao das variaveis de ambiente.
    pause
    exit /b 1
)

echo.
echo [*] Executando testes automatizados de integridade...
node execution/test-runner.js
if %errorlevel% neq 0 (
    echo [!] Aviso: Houve falha em alguns testes. Continuando inicializacao...
)

echo.
echo [*] Inicializando servidor local em http://localhost:3000 ...
echo [*] Pressione CTRL+C para encerrar o servidor a qualquer momento.
echo.

node execution/server.js

pause
