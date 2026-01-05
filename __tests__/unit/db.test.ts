const mockSqlDb = { query: jest.fn() };

const mockNeonDb = jest.fn(() => mockSqlDb);
const mockDrizzleDb = jest.fn(() => ({}));

jest.mock('@neondatabase/serverless', () => ({
  neon: mockNeonDb,
}));

jest.mock('drizzle-orm/neon-http', () => ({
  drizzle: mockDrizzleDb,
}));

describe('db', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
    jest.clearAllMocks();
    mockNeonDb.mockReturnValue(mockSqlDb);
    mockDrizzleDb.mockReturnValue({});
  });

  it('should create a neon connection with DATABASE_URL', async () => {
    await import('../../src/db');

    expect(mockNeonDb).toHaveBeenCalledWith(process.env.DATABASE_URL);
    expect(mockNeonDb).toHaveBeenCalledTimes(1);
  });

  it('should create a drizzle instance with the neon connection', async () => {
    await import('../../src/db');

    expect(mockDrizzleDb).toHaveBeenCalledWith(mockSqlDb);
    expect(mockDrizzleDb).toHaveBeenCalledTimes(1);
  });

  it('should export db', async () => {
    const dbModule = await import('../../src/db');

    expect(dbModule.db).toBeDefined();
  });
});
