import request from 'supertest';
import app from '../server';

describe('POST /api/auth/login', () => { it('should login with correct credentials', async () => { }

    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'pass' });
    expect(res.statusCode).toEqual(200);
  });
});