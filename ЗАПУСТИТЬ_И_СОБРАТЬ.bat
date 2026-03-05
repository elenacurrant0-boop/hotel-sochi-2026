@echo off
chcp 65001 >nul
title Сборка Финмодели Отеля Сочи 2026
color 0A

echo.
echo ============================================
echo   ФИНМОДЕЛЬ ОТЕЛЯ СОЧИ 2026
echo   Автоматическая сборка для публикации
echo ============================================
echo.

:: Проверяем Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] Node.js не установлен!
    echo.
    echo Скачайте и установите Node.js:
    echo   https://nodejs.org  (кнопка LTS - зелёная)
    echo.
    echo После установки Node.js запустите этот файл снова.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js найден:
node --version
echo.

:: Устанавливаем зависимости
echo [1/3] Устанавливаем зависимости (первый раз ~2 минуты)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] Не удалось установить зависимости
    pause
    exit /b 1
)
echo [OK] Зависимости установлены
echo.

:: Собираем проект
echo [2/3] Собираем проект...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ОШИБКА] Ошибка сборки
    pause
    exit /b 1
)
echo [OK] Проект собран
echo.

:: Открываем папку dist
echo [3/3] Готово! Открываю папку с готовыми файлами...
explorer dist
echo.

color 0B
echo ============================================
echo   ПАПКА dist\ ГОТОВА К ПУБЛИКАЦИИ
echo ============================================
echo.
echo Что делать дальше:
echo.
echo   1. Зайдите на сайт: https://netlify.com/drop
echo   2. ПЕРЕТАЩИТЕ папку "dist" в браузер
echo   3. Через 30 секунд получите ссылку!
echo.
echo   Ссылку отправьте коллегам.
echo   Код доступа для руководства: OWNER2026
echo   Код для демо-просмотра:      DEMO2026
echo.
echo ============================================
pause
