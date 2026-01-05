import request from 'supertest';
import app from '../../src/app';

describe('GET /api/user', () => {
  it('should require authentication', async () => {
    const response = await request(app).get('/api/user').expect(401);

    expect(response.status).toBe(401);
  });
});

describe('GET /api/user/stats', () => {
  it('should require authentication', async () => {
    const response = await request(app).get('/api/user/stats').expect(401);

    expect(response.status).toBe(401);
  });
});

describe('GET /api/user/id/:id', () => {
  it('should require authentication', async () => {
    const response = await request(app).get('/api/user/id/test-id').expect(401);

    expect(response.status).toBe(401);
  });
});

describe('GET /api/user/email/:email', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/user/email/test@example.com')
      .expect(401);

    expect(response.status).toBe(401);
  });
});

describe('POST /api/user', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/user')
      .send({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      })
      .expect(401);

    expect(response.status).toBe(401);
  });
});

describe('POST /api/user/register', () => {
  it('should fail without email and password', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(
      (response.body as { error: { message: string } }).error
    ).toHaveProperty('message');
  });

  it('should fail with invalid email', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        email: 'invalid-email',
        password: 'password123',
      })
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(
      (response.body as { error: { message: string } }).error
    ).toHaveProperty('message');
  });

  it('should fail with password too short', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        email: 'test@example.com',
        password: '12345',
      })
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(
      (response.body as { error: { message: string } }).error
    ).toHaveProperty('message');
  });
});

describe('PUT /api/user/:id', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .put('/api/user/test-id')
      .send({
        email: 'test@example.com',
      })
      .expect(401);

    expect(response.status).toBe(401);
  });
});

describe('PATCH /api/user/:id', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .patch('/api/user/test-id')
      .send({
        email: 'test@example.com',
      })
      .expect(401);

    expect(response.status).toBe(401);
  });
});

describe('DELETE /api/user/:id', () => {
  it('should require authentication', async () => {
    const response = await request(app).delete('/api/user/test-id').expect(401);

    expect(response.status).toBe(401);
  });
});
