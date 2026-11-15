import { data, saveData } from './dataStore.ts';
import type { Card, NewCardInput, CreateCardResponse, ErrorResponse } from './types.ts';

export function validateCard(input: NewCardInput): ErrorResponse | undefined {
  if (input.type !== 'SINGLE' && input.type !== 'MULTIPLE') {
    return { error: 'Invalid card type' };
  }
  if (input.question.length < 1 || input.question.length > 100) {
    return { error: 'Question must be 1-100 characters' };
  }
  if (input.options.length < 2 || input.options.length > 8) {
    return { error: 'Need 2-8 options' };
  }
  for (const option of input.options) {
    if (option.text.length < 1 || option.text.length > 100) {
      return { error: 'Each option must be 1-100 characters' };
    }
  }

  const duplicateOptions: string[] = [];
  for (const option of input.options) {
    if (duplicateOptions.includes(option.text)) {
      return { error: 'Options must be unique' };
    }
    duplicateOptions.push(option.text);
  }

  let correctCount = 0;
  for (const option of input.options) {
    if (option.isCorrect) {
      correctCount++;
    }
  }
  if (input.type === 'SINGLE' && correctCount !== 1) {
    return { error: 'Single choice needs exactly 1 correct answer' };
  }
  if (input.type === 'MULTIPLE' && correctCount === 0) {
    return { error: 'Multiple choice needs at least 1 correct answer' };
  }
  if (input.type === 'MULTIPLE' && correctCount === input.options.length) {
    return { error: 'Multiple choice cannot have every option correct' };
  }
  return undefined;
}

export function createCard(input: NewCardInput): CreateCardResponse | ErrorResponse {
  const error = validateCard(input);
  if (error) {
    return error;
  }
  const cardId = data.nextCardId;
  data.nextCardId++;
  data.cards.push({
    cardId: cardId,
    type: input.type,
    question: input.question,
    options: input.options,
    createdAt: Date.now(),
  });
  saveData();
  return { cardId: cardId };
}

export function getCard(cardId: number): Card | ErrorResponse {
  const card = data.cards.find(c => c.cardId === cardId);
  if (!card) {
    return { error: 'Card not found' };
  }
  return card;
}

export function listCard() {
  const cards = [];
  for (const card of data.cards) {
    cards.push({ cardId: card.cardId, type: card.type, question: card.question });
  }
  return { cards: cards };
}

export function editCard(cardId: number, input: NewCardInput): Record<string, never> | ErrorResponse {
  const card = data.cards.find(c => c.cardId === cardId);
  if (!card) {
    return { error: 'Card not found' };
  }
  const error = validateCard(input);
  if (error) {
    return error;
  }
  card.type = input.type;
  card.question = input.question;
  card.options = input.options;
  saveData();
  return {};
}

export function deleteCard(cardId: number): Record<string, never> | ErrorResponse {
  const card = data.cards.find(c => c.cardId === cardId);
  if (!card) {
    return { error: 'Card not found' };
  }
  data.cards = data.cards.filter(c => c.cardId !== cardId);
  saveData();
  return {};
}

export function checkAnswer(cardId: number, picked: number[]): { correct: boolean } | ErrorResponse {
  const card = data.cards.find(c => c.cardId === cardId);
  if (!card) {
    return { error: 'Card not found' };
  }
  for (const index of picked) {
    if (index < 0 || index >= card.options.length) {
      return { error: 'Invalid option index' };
    }
  }
  for (let i = 0; i < card.options.length; i++) {
    const isPicked = picked.includes(i);
    if (isPicked !== card.options[i].isCorrect) {
      return { correct: false };
    }
  }
  return { correct: true };
}
