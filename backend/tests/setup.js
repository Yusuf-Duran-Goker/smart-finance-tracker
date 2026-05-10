const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

module.exports = { request, app };
