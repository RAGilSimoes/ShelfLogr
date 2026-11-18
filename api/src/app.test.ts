import request from 'supertest';

import app from './app.js';
import { describe, expect, test, afterAll } from 'vitest';

import { pool } from './db.js';

describe('GET /', () => {
  test('GET / route should pass', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await pool.end();
});
