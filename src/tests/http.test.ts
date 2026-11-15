import request from 'sync-request-curl';
import { beforeEach, describe, expect, test } from 'vitest';

// The server must be running (npm start) before running these tests
const SERVER_URL = 'http://localhost:3000';

// A valid card to reuse in tests
const singleCard = {
  type: 'SINGLE',
  question: 'Capital of France?',
  options: [
    { text: 'Paris', isCorrect: true },
    { text: 'Rome', isCorrect: false },
    { text: 'Berlin', isCorrect: false },
  ],
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear');
});

describe('POST /cards', () => {
  test('success returns 200 and cardId', () => {
    const res = request('POST', SERVER_URL + '/cards', { json: singleCard });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ cardId: 1 });
  });

  test('empty question returns 400', () => {
    const res = request('POST', SERVER_URL + '/cards', { json: { ...singleCard, question: '' } });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});

describe('GET /cards', () => {
  test('empty list when no cards', () => {
    const res = request('GET', SERVER_URL + '/cards');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ cards: [] });
  });

  test('lists created cards', () => {
    const createRes = request('POST', SERVER_URL + '/cards', { json: singleCard });
    const cardId = JSON.parse(createRes.body.toString()).cardId;

    const res = request('GET', SERVER_URL + '/cards');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      cards: [{ cardId: cardId, type: 'SINGLE', question: 'Capital of France?' }],
    });
  });
});

describe('GET /cards/:cardId', () => {
  test('success returns the full card', () => {
    const createRes = request('POST', SERVER_URL + '/cards', { json: singleCard });
    const cardId = JSON.parse(createRes.body.toString()).cardId;

    const res = request('GET', SERVER_URL + '/cards/' + cardId);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      cardId: cardId,
      type: 'SINGLE',
      question: 'Capital of France?',
      options: singleCard.options,
      createdAt: expect.any(Number),
    });
  });

  test('unknown cardId returns 404', () => {
    const res = request('GET', SERVER_URL + '/cards/999');
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});

describe('PUT /cards/:cardId', () => {
  test('success returns {} and changes the card', () => {
    const createRes = request('POST', SERVER_URL + '/cards', { json: singleCard });
    const cardId = JSON.parse(createRes.body.toString()).cardId;

    const res = request('PUT', SERVER_URL + '/cards/' + cardId, {
      json: { ...singleCard, question: 'Capital of Italy?' },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({});

    const getRes = request('GET', SERVER_URL + '/cards/' + cardId);
    expect(JSON.parse(getRes.body.toString()).question).toBe('Capital of Italy?');
  });

  test('unknown cardId returns 404', () => {
    const res = request('PUT', SERVER_URL + '/cards/999', { json: singleCard });
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid input returns 400', () => {
    const createRes = request('POST', SERVER_URL + '/cards', { json: singleCard });
    const cardId = JSON.parse(createRes.body.toString()).cardId;

    const res = request('PUT', SERVER_URL + '/cards/' + cardId, {
      json: { ...singleCard, type: 'ESSAY' },
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});

describe('DELETE /cards/:cardId', () => {
  test('success returns {} and removes the card', () => {
    const createRes = request('POST', SERVER_URL + '/cards', { json: singleCard });
    const cardId = JSON.parse(createRes.body.toString()).cardId;

    const res = request('DELETE', SERVER_URL + '/cards/' + cardId);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({});

    const getRes = request('GET', SERVER_URL + '/cards/' + cardId);
    expect(getRes.statusCode).toBe(404);
  });

  test('unknown cardId returns 404', () => {
    const res = request('DELETE', SERVER_URL + '/cards/999');
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});

describe('POST /cards/:cardId/check', () => {
  test('right answer returns correct true', () => {
    const createRes = request('POST', SERVER_URL + '/cards', { json: singleCard });
    const cardId = JSON.parse(createRes.body.toString()).cardId;

    const res = request('POST', SERVER_URL + '/cards/' + cardId + '/check', { json: { picked: [0] } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ correct: true });
  });

  test('wrong answer returns correct false', () => {
    const createRes = request('POST', SERVER_URL + '/cards', { json: singleCard });
    const cardId = JSON.parse(createRes.body.toString()).cardId;

    const res = request('POST', SERVER_URL + '/cards/' + cardId + '/check', { json: { picked: [1] } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ correct: false });
  });

  test('unknown cardId returns 404', () => {
    const res = request('POST', SERVER_URL + '/cards/999/check', { json: { picked: [0] } });
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid option index returns 400', () => {
    const createRes = request('POST', SERVER_URL + '/cards', { json: singleCard });
    const cardId = JSON.parse(createRes.body.toString()).cardId;

    const res = request('POST', SERVER_URL + '/cards/' + cardId + '/check', { json: { picked: [5] } });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  });
});

describe('DELETE /clear', () => {
  test('returns {} and removes all cards', () => {
    request('POST', SERVER_URL + '/cards', { json: singleCard });

    const res = request('DELETE', SERVER_URL + '/clear');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({});

    const listRes = request('GET', SERVER_URL + '/cards');
    expect(JSON.parse(listRes.body.toString())).toStrictEqual({ cards: [] });
  });
});
