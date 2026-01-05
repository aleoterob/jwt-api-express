/// <reference types="jest" />
import 'dotenv/config';

// Establecer NODE_ENV a 'test' si no está definido
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Configurar DATABASE_URL para tests si no está definido
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
}

// Configurar JWT_SECRET para tests si no está definido
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET =
    'test-jwt-secret-key-for-testing-purposes-only-minimum-64-chars-required-12345678901234567890';
}

// Configurar timeouts globales para Jest (10 segundos por defecto)
// Esto ayuda a evitar timeouts en tests de integración con Supertest
if (typeof jest !== 'undefined' && jest.setTimeout) {
  jest.setTimeout(10000);
}
