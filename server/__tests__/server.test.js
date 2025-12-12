// Tests for server endpoints using supertest and jest ESM mocking

import { jest } from '@jest/globals';
import request from 'supertest';

// Mock utils (five letter words) before importing app
await jest.unstable_mockModule('../utils.js', () => ({
  default: ['apple', 'hello', 'world'],
}));

const { default: app } = await import('../server.js');

test('GET /api/words/random returns a word', async () => {
  const res = await request(app).get('/api/words/random');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('word');
  expect(typeof res.body.word).toBe('string');
});

test('POST /api/words/validate returns true for known five-letter word', async () => {
  const res = await request(app)
    .post('/api/words/validate')
    .send({ word: 'apple' })
    .set('Accept', 'application/json');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ valid: true });
});

test('POST /api/words/validate returns false for unknown word', async () => {
  const res = await request(app)
    .post('/api/words/validate')
    .send({ word: 'zzzzz' })
    .set('Accept', 'application/json');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ valid: false });
});
