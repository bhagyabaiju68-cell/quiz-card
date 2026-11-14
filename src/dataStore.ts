import type { Card } from './types.ts';

interface Data {
  cards: Card[];
  nextCardId: number;
}

export const data: Data = {
  cards: [],
  nextCardId: 1,
};

// Resets everything (used before each test)
export function clear(): Record<string, never> {
  data.cards = [];
  data.nextCardId = 1;
  return {};
}
