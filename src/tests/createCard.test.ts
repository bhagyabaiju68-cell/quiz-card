import { beforeEach, describe, expect, test } from 'vitest';
import { clear, data } from '../dataStore.ts';
import { createCard } from '../cards.ts';
import type { CardType, ChoiceOption } from '../types.ts';

// Valid options to reuse in tests
const singleOptions: ChoiceOption[] = [
  { text: 'Paris', isCorrect: true },
  { text: 'Rome', isCorrect: false },
  { text: 'Berlin', isCorrect: false },
];

const multipleOptions: ChoiceOption[] = [
  { text: '2', isCorrect: true },
  { text: '3', isCorrect: false },
  { text: '4', isCorrect: true },
];

// Makes n options, only the first one correct
function makeOptions(n: number): ChoiceOption[] {
  const options: ChoiceOption[] = [];
  for (let i = 0; i < n; i++) {
    options.push({ text: 'Option ' + i, isCorrect: i === 0 });
  }
  return options;
}

beforeEach(() => {
  clear();
});

describe('createCard', () => {
  describe('success', () => {
    test('creates a SINGLE card and returns cardId 1', () => {
      const result = createCard({ type: 'SINGLE', question: 'Capital of France?', options: singleOptions });
      expect(result).toStrictEqual({ cardId: 1 });

      expect(data.cards.length).toStrictEqual(1);
      expect(data.cards[0]).toStrictEqual({
        cardId: 1,
        type: 'SINGLE',
        question: 'Capital of France?',
        options: singleOptions,
        createdAt: expect.any(Number),
      });
    });

    test('creates a MULTIPLE card', () => {
      const result = createCard({ type: 'MULTIPLE', question: 'Even numbers?', options: multipleOptions });
      expect(result).toStrictEqual({ cardId: 1 });
      expect(data.cards[0].type).toStrictEqual('MULTIPLE');
    });

    test('cardIds go up: 1, 2, 3', () => {
      expect(createCard({ type: 'SINGLE', question: 'Q1', options: singleOptions })).toStrictEqual({ cardId: 1 });
      expect(createCard({ type: 'SINGLE', question: 'Q2', options: singleOptions })).toStrictEqual({ cardId: 2 });
      expect(createCard({ type: 'MULTIPLE', question: 'Q3', options: multipleOptions })).toStrictEqual({ cardId: 3 });
    });

    test('accepts edge lengths: 1 and 200 char question, 2 and 8 options, 1 and 100 char option', () => {
      expect(createCard({ type: 'SINGLE', question: 'Q', options: makeOptions(2) })).toStrictEqual({ cardId: 1 });
      expect(createCard({ type: 'SINGLE', question: 'a'.repeat(200), options: makeOptions(8) })).toStrictEqual({ cardId: 2 });

      const edgeOptions: ChoiceOption[] = [
        { text: 'a', isCorrect: true },
        { text: 'b'.repeat(100), isCorrect: false },
      ];
      expect(createCard({ type: 'SINGLE', question: 'Q', options: edgeOptions })).toStrictEqual({ cardId: 3 });
    });
  });

  describe('errors', () => {
    test('invalid type', () => {
      const result = createCard({ type: 'TRUE_FALSE' as CardType, question: 'Q?', options: singleOptions });
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('question empty or over 200 chars', () => {
      expect(createCard({ type: 'SINGLE', question: '', options: singleOptions }))
        .toStrictEqual({ error: expect.any(String) });
      expect(createCard({ type: 'SINGLE', question: 'a'.repeat(201), options: singleOptions }))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('fewer than 2 or more than 8 options', () => {
      expect(createCard({ type: 'SINGLE', question: 'Q?', options: makeOptions(1) }))
        .toStrictEqual({ error: expect.any(String) });
      expect(createCard({ type: 'SINGLE', question: 'Q?', options: makeOptions(9) }))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('empty option / option over 100 chars', () => {
      const emptyOption: ChoiceOption[] = [
        { text: '', isCorrect: true },
        { text: 'Rome', isCorrect: false },
      ];
      const longOption: ChoiceOption[] = [
        { text: 'a'.repeat(101), isCorrect: true },
        { text: 'Rome', isCorrect: false },
      ];
      expect(createCard({ type: 'SINGLE', question: 'Q?', options: emptyOption }))
        .toStrictEqual({ error: expect.any(String) });
      expect(createCard({ type: 'SINGLE', question: 'Q?', options: longOption }))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('duplicate options', () => {
      const duplicates: ChoiceOption[] = [
        { text: 'Paris', isCorrect: true },
        { text: 'Paris', isCorrect: false },
      ];
      expect(createCard({ type: 'SINGLE', question: 'Q?', options: duplicates }))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('SINGLE with 0 or 2 isCorrect', () => {
      const noneCorrect: ChoiceOption[] = [
        { text: 'a', isCorrect: false },
        { text: 'b', isCorrect: false },
        { text: 'c', isCorrect: false },
      ];
      const twoCorrect: ChoiceOption[] = [
        { text: 'a', isCorrect: true },
        { text: 'b', isCorrect: true },
        { text: 'c', isCorrect: false },
      ];
      expect(createCard({ type: 'SINGLE', question: 'Q?', options: noneCorrect }))
        .toStrictEqual({ error: expect.any(String) });
      expect(createCard({ type: 'SINGLE', question: 'Q?', options: twoCorrect }))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('MULTIPLE with 0 isCorrect', () => {
      const noneCorrect: ChoiceOption[] = [
        { text: 'a', isCorrect: false },
        { text: 'b', isCorrect: false },
      ];
      expect(createCard({ type: 'MULTIPLE', question: 'Q?', options: noneCorrect }))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('MULTIPLE with every option isCorrect', () => {
      const allCorrect: ChoiceOption[] = [
        { text: 'a', isCorrect: true },
        { text: 'b', isCorrect: true },
        { text: 'c', isCorrect: true },
      ];
      expect(createCard({ type: 'MULTIPLE', question: 'Q?', options: allCorrect }))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('a failed create does not save anything', () => {
      createCard({ type: 'SINGLE', question: '', options: singleOptions });
      expect(data.cards).toStrictEqual([]);
      expect(createCard({ type: 'SINGLE', question: 'Q?', options: singleOptions })).toStrictEqual({ cardId: 1 });
    });
  });
});
