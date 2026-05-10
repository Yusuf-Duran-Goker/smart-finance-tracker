const request = require('supertest');
const app = require('../src/server');
const mongoose = require('mongoose');
const User = require('../src/models/User');

require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth API', () => {
  const userData = {
    name: 'Test User',
    email: 'testauth@test.com',
    password: '123456',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      const res = await request(app).post('/api/auth/register').send(userData);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe(userData.email);
    });

    it('should return 400 if email already in use', async () => {
      const res = await request(app).post('/api/auth/register').send(userData);
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...userData, email: 'notanemail' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Valid email is required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: 'wrongpassword',
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return user data with valid token', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });
      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(userData.email);
    });
  });
});
