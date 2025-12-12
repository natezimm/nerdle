import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Mock five-letter words
await jest.unstable_mockModule('../utils.js', () => ({
  default: ['apple', 'hello', 'world'],
}));

const { default: router } = await import('../routes/wordRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/words', router);

test('GET /api/words/random via router returns a word', async () => {
  const res = await request(app).get('/api/words/random');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('word');
});

test('POST /api/words/validate via router validates words case-insensitively', async () => {
  const res1 = await request(app)
    .post('/api/words/validate')
    .send({ word: 'Apple' })
    .set('Accept', 'application/json');
  expect(res1.status).toBe(200);
  expect(res1.body).toEqual({ valid: true });

  const res2 = await request(app)
    .post('/api/words/validate')
    .send({ word: 'unknown' })
    .set('Accept', 'application/json');
  expect(res2.status).toBe(200);
  expect(res2.body).toEqual({ valid: false });
});
