const mockSqlIndex = { query: jest.fn() };
const mockDbIndex = { select: jest.fn() };

const mockNeonIndex = jest.fn(() => mockSqlIndex);
const mockDrizzleIndex = jest.fn(() => mockDbIndex);

jest.mock('@neondatabase/serverless', () => ({
  neon: mockNeonIndex,
}));

jest.mock('drizzle-orm/neon-http', () => ({
  drizzle: mockDrizzleIndex,
}));

jest.mock('../../src/db/schema/public/profiles', () => ({
  profiles: {},
}));

jest.mock('../../src/db/schema/auth/users', () => ({
  users: {},
  authSchema: {},
}));

jest.mock('../../src/db/schema/auth/refresh_tokens', () => ({
  refreshTokens: {},
}));

jest.mock('../../src/db/relations', () => ({}));

describe('db/index', () => {
  let originalDatabaseUrl: string | undefined;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    originalDatabaseUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
    mockNeonIndex.mockReturnValue(mockSqlIndex);
    mockDrizzleIndex.mockReturnValue(mockDbIndex);
  });

  afterEach(() => {
    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  });

  it('should create sql using neon with DATABASE_URL', async () => {
    await import('../../src/db/index');

    expect(mockNeonIndex).toHaveBeenCalledWith(
      'postgresql://test:test@localhost:5432/test_db'
    );
    expect(mockNeonIndex).toHaveBeenCalledTimes(1);
  });

  it('should create db using drizzle with sql and schema', async () => {
    await import('../../src/db/index');

    const expectedSchema: Record<string, unknown> = {
      profiles: {},
      users: {},
      refreshTokens: {},
      authSchema: {},
    };

    const schemaMatcher = expect.objectContaining(expectedSchema) as unknown;
    expect(mockDrizzleIndex).toHaveBeenCalledWith(mockSqlIndex, {
      schema: schemaMatcher,
    });
    expect(mockDrizzleIndex).toHaveBeenCalledTimes(1);
  });

  it('should export sql', async () => {
    const dbModule = await import('../../src/db/index');

    expect(dbModule.sql).toBe(mockSqlIndex);
  });

  it('should export db', async () => {
    const dbModule = await import('../../src/db/index');

    expect(dbModule.db).toBe(mockDbIndex);
  });

  it('should throw error when DATABASE_URL is not defined', async () => {
    delete process.env.DATABASE_URL;

    await expect(import('../../src/db/index')).rejects.toThrow(
      'DATABASE_URL environment variable is not set'
    );
  });
});
