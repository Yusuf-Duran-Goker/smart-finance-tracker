const request = require('supertest');
const app = require('../src/server');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');

require('dotenv').config();

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Transaction.deleteMany({});

  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'testtx@test.com',
    password: '123456',
  });
  token = res.body.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await mongoose.connection.close();
});

describe('Transaction API', () => {
  let transactionId;

  it('POST /api/transactions - should create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'expense', amount: 100, category: 'Food', description: 'Test' });

    expect(res.statusCode).toBe(201);
    expect(res.body.amount).toBe(100);
    transactionId = res.body._id;
  });

  it('GET /api/transactions - should return transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PUT /api/transactions/:id - should update a transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 200 });

    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBe(200);
  });

  it('DELETE /api/transactions/:id - should delete a transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Transaction deleted');
  });

  it('POST /api/transactions - should return 400 for invalid type', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'invalid', amount: 100, category: 'Food' });

    expect(res.statusCode).toBe(400);
  });

  it('GET /api/transactions - should return 401 without token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.statusCode).toBe(401);
  });
});
