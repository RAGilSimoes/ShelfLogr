import request from 'supertest';

import app from './app.js';
import { describe, expect, test, afterAll, beforeAll } from 'vitest';

import { pool } from './db.js';

import { MIN_PASSWORD_SIZE, MIN_USERNAME_SIZE } from '@shelflogr/shared';

describe('GET /', () => {
  test('GET / route should pass', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
  });
});

const testEmail = 'john.doe@gmail.com';
const testPassword = 'johndoe1';
const testUsername = 'John Doe';

beforeAll(async () => {
  await pool.query('DELETE FROM "user" WHERE email = $1', [testEmail]);
});

describe('POST /api/register', () => {
  test('POST /api/register with valid credentials and new user should pass', async () => {
    const response = await request(app).post('/api/register').send({
      email: testEmail,
      password: testPassword,
      username: testUsername,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.message).toBe('Success');
  });

  test('POST /api/register with invalid email but new user should fail', async () => {
    const response = await request(app).post('/api/register').send({
      email: 'johndoe.com',
      password: testPassword,
      username: testUsername,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid credentials');
  });

  test('POST /api/register with invalid password but new user should fail', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        email: testEmail,
        password: 'p'.repeat(MIN_PASSWORD_SIZE - 1),
        username: testUsername,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid credentials');
  });

  test('POST /api/register with invalid username but new user should fail', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        email: testEmail,
        password: testPassword,
        username: 'p'.repeat(MIN_USERNAME_SIZE - 1),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid credentials');
  });

  test('POST /api/register with valid credentials but existing user should fail', async () => {
    const invalidRegister = await request(app).post('/api/register').send({
      email: testEmail,
      password: testPassword,
      username: testUsername,
    });

    expect(invalidRegister.statusCode).toBe(409);
    expect(invalidRegister.body.error).toBe('Username or email already in use');
  });
});

afterAll(async () => {
  await pool.end();
});
