import request from 'supertest';
import app from '../../src/app';

describe('POST /api/auth/login', () => {
  it('should fail with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(
      (response.body as { error: { message: string } }).error
    ).toHaveProperty('message');
  });

  it('should fail without email and password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
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
      .post('/api/auth/login')
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
});

describe('POST /api/auth/refresh', () => {
  it('should fail without refresh token', async () => {
    const response = await request(app).post('/api/auth/refresh').expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(
      (response.body as { error: { message: string } }).error
    ).toHaveProperty('message');
  });
});

describe('POST /api/auth/logout', () => {
  it('should respond successfully even without token', async () => {
    const response = await request(app).post('/api/auth/logout').expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
  });
});
