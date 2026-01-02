@echo off
echo Ejecutando migraciones de Drizzle...
echo.

REM Ajusta estos valores según tu instalación de PostgreSQL
set PGUSER=postgres
set PGPASSWORD=Pixies4ever!
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=aprender-auth

echo Conectando a la base de datos aprender-auth...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f run-migrations.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Migraciones ejecutadas exitosamente!
) else (
    echo.
    echo Error al ejecutar las migraciones.
    echo Verifica que PostgreSQL esté corriendo y que las credenciales sean correctas.
)

pause

