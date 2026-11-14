import { data } from './dataStore.ts';
import type { NewCardInput, CreateCardResponse, ErrorResponse } from './types.ts';

export function createCard(input: NewCardInput): CreateCardResponse | ErrorResponse {
  if (input.type !== 'SINGLE' && input.type !== 'MULTIPLE') {
    return { error: 'Invalid card type' };
  }
  if (input.question.length < 1 || input.question.length > 200) {
    return { error: 'Question must be 1-200 characters' };
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

  const cardId = data.nextCardId;
  data.nextCardId++;
  data.cards.push({
    cardId: cardId,
    type: input.type,
    question: input.question,
    options: input.options,
    createdAt: Date.now(),
  });
  return { cardId: cardId };
}
