import { beforeEach, describe, expect, test } from 'vitest';
import { clear, data } from '../dataStore.ts';
import { createCard, getCard, listCard, editCard, deleteCard, checkAnswer } from '../cards.ts';
import type { CardType, ChoiceOption, NewCardInput } from '../types.ts';

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
const singleCard: NewCardInput = { type: 'SINGLE', question: 'Capital of France?', options: singleOptions };
const multipleCard: NewCardInput = { type: 'MULTIPLE', question: 'Even numbers?', options: multipleOptions };

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

    test('accepts edge lengths: 1 and 100 char question, 2 and 8 options, 1 and 100 char option', () => {
      expect(createCard({ type: 'SINGLE', question: 'Q', options: makeOptions(2) })).toStrictEqual({ cardId: 1 });
      expect(createCard({ type: 'SINGLE', question: 'a'.repeat(100), options: makeOptions(8) })).toStrictEqual({ cardId: 2 });

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

    test('question empty or over 100 chars', () => {
      expect(createCard({ type: 'SINGLE', question: '', options: singleOptions }))
        .toStrictEqual({ error: expect.any(String) });
      expect(createCard({ type: 'SINGLE', question: 'a'.repeat(101), options: singleOptions }))
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

describe('getCard', () => {
  test('returns the full card', () => {
    createCard(singleCard);
    expect(getCard(1)).toStrictEqual({
      cardId: 1,
      type: 'SINGLE',
      question: 'Capital of France?',
      options: singleOptions,
      createdAt: expect.any(Number),
    });
  });
  test('returns the right card from several cards', () => {
    createCard(singleCard);
    createCard(multipleCard);
    expect(getCard(2)).toStrictEqual({
      cardId: 2,
      type: 'MULTIPLE',
      question: 'Even numbers?',
      options: multipleOptions,
      createdAt: expect.any(Number),
    });
  });
  test('returns error when card does not exist', () => {
    expect(getCard(1)).toStrictEqual({ error: expect.any(String) });
    createCard(singleCard);
    expect(getCard(2)).toStrictEqual({ error: expect.any(String) });
  });
});

describe('listCard', () => {
  test('returns empty list when there are no cards', () => {
    expect(listCard()).toStrictEqual({ cards: [] });
  });
  test('returns list of cards with cardId, type, question', () => {
    createCard(singleCard);
    createCard(multipleCard);
    expect(listCard()).toStrictEqual({
      cards: [
        { cardId: 1, type: 'SINGLE', question: 'Capital of France?' },
        { cardId: 2, type: 'MULTIPLE', question: 'Even numbers?' },
      ],
    });
  });
});

describe('editCard', () => {
  test('changes type, question, and options', () => {
    createCard(singleCard);
    const createdAt = data.cards[0].createdAt;
    expect(editCard(1, multipleCard)).toStrictEqual({});
    expect(getCard(1)).toStrictEqual({
      cardId: 1,
      type: 'MULTIPLE',
      question: 'Even numbers?',
      options: multipleOptions,
      createdAt: createdAt,
    });
  });
  test('only changes required card', () => {
    createCard(singleCard);
    createCard(singleCard);
    editCard(2, multipleCard);
    expect(getCard(1)).toStrictEqual({
      cardId: 1,
      type: 'SINGLE',
      question: 'Capital of France?',
      options: singleOptions,
      createdAt: expect.any(Number),
    });
  });
  test('returns error when card does not exist', () => {
    expect(editCard(1, singleCard)).toStrictEqual({ error: expect.any(String) });
  });
  test('returns error for invalid new card', () => {
    createCard(singleCard);
    const invalid: NewCardInput = { type: 'SINGLE', question: '', options: singleOptions };
    expect(editCard(1, invalid)).toStrictEqual({ error: expect.any(String) });
    expect(getCard(1)).toStrictEqual({
      cardId: 1,
      type: 'SINGLE',
      question: 'Capital of France?',
      options: singleOptions,
      createdAt: expect.any(Number),
    });
  });
});

describe('deleteCard', () => {
  test('removes the card', () => {
    createCard(singleCard);
    expect(deleteCard(1)).toStrictEqual({});
    expect(getCard(1)).toStrictEqual({ error: expect.any(String) });
    expect(listCard()).toStrictEqual({ cards: [] });
  });
  test('only removes the required card', () => {
    createCard(singleCard);
    createCard(multipleCard);
    deleteCard(1);
    expect(listCard()).toStrictEqual({
      cards: [{ cardId: 2, type: 'MULTIPLE', question: 'Even numbers?' }],
    });
  });
  test('cardIds are not reused after a delete', () => {
    createCard(singleCard);
    createCard(singleCard);
    deleteCard(2);
    expect(createCard(singleCard)).toStrictEqual({ cardId: 3 });
  });
  test('returns an error when card does not exist', () => {
    expect(deleteCard(1)).toStrictEqual({ error: expect.any(String) });
  });
  test('returns an error when deleting same card twice', () => {
    createCard(singleCard);
    deleteCard(1);
    expect(deleteCard(1)).toStrictEqual({ error: expect.any(String) });
  });
});

describe('checkAnswer', () => {
  describe('SINGLE', () => {
    test('picking the correct option', () => {
      createCard(singleCard);
      expect(checkAnswer(1, [0])).toStrictEqual({ correct: true });
    });
    test('picking a wrong option', () => {
      createCard(singleCard);
      expect(checkAnswer(1, [1])).toStrictEqual({ correct: false });
    });
    test('picking nothing is wrong', () => {
      createCard(singleCard);
      expect(checkAnswer(1, [])).toStrictEqual({ correct: false });
    });
    test('picking the correct option and a wrong option is wrong', () => {
      createCard(singleCard);
      expect(checkAnswer(1, [0, 2])).toStrictEqual({ correct: false });
    });
  });

  describe('MULTIPLE', () => {
    test('picking all correct options', () => {
      createCard(multipleCard);
      expect(checkAnswer(1, [0, 2])).toStrictEqual({ correct: true });
      expect(checkAnswer(1, [2, 0])).toStrictEqual({ correct: true });
    });
    test('picking only few correct options is wrong', () => {
      createCard(multipleCard);
      expect(checkAnswer(1, [0])).toStrictEqual({ correct: false });
    });
    test('picking every option is wrong', () => {
      createCard(multipleCard);
      expect(checkAnswer(1, [0, 1, 2])).toStrictEqual({ correct: false });
    });
  });
  describe('errors', () => {
    test('card does not exist', () => {
      expect(checkAnswer(1, [0])).toStrictEqual({ error: expect.any(String) });
    });
    test('index of option too big or negative', () => {
      createCard(singleCard);
      expect(checkAnswer(1, [3])).toStrictEqual({ error: expect.any(String) });
      expect(checkAnswer(1, [-1])).toStrictEqual({ error: expect.any(String) });
    });
  });
});
