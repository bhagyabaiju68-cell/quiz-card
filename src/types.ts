// SINGLE   = exactly one correct option
// MULTIPLE = at least one correct option, but not all of them
export type CardType = 'SINGLE' | 'MULTIPLE';

export interface ChoiceOption {
  text: string;
  isCorrect: boolean;
}

// A card as it is stored
export interface Card {
  cardId: number;
  type: CardType;
  question: string;
  options: ChoiceOption[];
  createdAt: number; // timestamp from Date.now()
}

// What the user sends in to create a card
// (no cardId or createdAt - the server makes those)
export interface NewCardInput {
  type: CardType;
  question: string;
  options: ChoiceOption[];
}

export interface ErrorResponse {
  error: string;
}

export interface CreateCardResponse {
  cardId: number;
}
