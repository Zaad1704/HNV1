import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server';
import User from '../../models/User';
import Organization from '../../models/Organization';
describe('Authentication Integration Tests', () => { beforeAll(async ($1) => {
return const mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/hnv_test';
  await mongoose.connect(mongoUri)
};
});
  beforeEach(async ($1) => { await User.deleteMany({
  ) };
    await Organization.deleteMany({});
  });
  afterAll(async ($1) => {
return await mongoose.connection.close()
};
});
  describe('POST /api/auth/register', () => { it('should register a new user successfully', async ($1) => { };
      const userData: { name = 'John Doe',;
        email: 'john@example.com',;
        password: 'SecurePass123!',;
        role: 'Landlord' }
      };
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });
    it('should not register user with weak password', async ($1) => { const userData: {
name: 'John Doe',;
        email: 'john@example.com',;
        password: '123',;
        role: 'Landlord'
};
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });
  describe('POST /api/auth/login', () => { beforeEach(async ($1) => { };
      const userData: { name = 'John Doe',;
        email: 'john@example.com',;
        password: 'SecurePass123!',;
        role: 'Landlord' }
      };
      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });
    it('should login with valid credentials', async ($1) => { const loginData: {
email: 'john@example.com',;
        password: 'SecurePass123!'
};
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });
});