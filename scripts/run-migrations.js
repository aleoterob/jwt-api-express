const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, 'run-migrations.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Dividir el SQL en statements individuales
const statements = sql
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith('--'));

console.log('Ejecutando migraciones...\n');

// Ejecutar cada statement
statements.forEach((statement, index) => {
  try {
    console.log(`Ejecutando statement ${index + 1}/${statements.length}...`);
    // Aquí necesitarías usar un cliente de PostgreSQL
    // Por ahora, solo mostramos lo que se ejecutaría
    console.log(statement.substring(0, 100) + '...\n');
  } catch (error) {
    console.error(`Error en statement ${index + 1}:`, error.message);
  }
});

console.log('\nPara ejecutar las migraciones, usa:');
console.log('psql -U postgres -d aprender-auth -f scripts/run-migrations.sql');
console.log(
  '\nO ejecuta manualmente el contenido de run-migrations.sql en pgAdmin o DBeaver'
);
