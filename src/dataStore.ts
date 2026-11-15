import type { Card } from './types.ts';
import fs from 'fs';

const DATA_FILE = 'data.json';

interface Data {
  cards: Card[];
  nextCardId: number;
}

export const data: Data = {
  cards: [],
  nextCardId: 1,
};

export function saveData(): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function loadData(): void {
  if (!fs.existsSync(DATA_FILE)) {
    return;
  }
  const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  data.cards = saved.cards;
  data.nextCardId = saved.nextCardId;
}
// Resets everything (used before each test)
export function clear(): Record<string, never> {
  data.cards = [];
  data.nextCardId = 1;
  saveData();
  return {};
}
