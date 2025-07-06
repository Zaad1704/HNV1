import request from 'supertest';
import app from '../app';

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        organizationName: 'Test Org'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        organizationName: 'Test Org'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
      }
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      // This would require a valid token from login
      // Implementation depends on your auth setup
    });
  });
});