import express, { Request, Response } from 'express';
import { clear } from './dataStore.ts';
import { createCard, getCard, listCard, editCard, deleteCard, checkAnswer } from './cards.ts';

export const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/cards', (req: Request, res: Response) => {
  const result = createCard(req.body);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

app.get('/cards', (req: Request, res: Response) => {
  res.json(listCard());
});

app.get('/cards/:cardId', (req: Request, res: Response) => {
  const result = getCard(Number(req.params.cardId));
  if ('error' in result) {
    res.status(404).json(result);
    return;
  }
  res.json(result);
});

app.put('/cards/:cardId', (req: Request, res: Response) => {
  const result = editCard(Number(req.params.cardId), req.body);
  if ('error' in result) {
    if (result.error === 'Card not found') {
      res.status(404).json(result);
    } else {
      res.status(400).json(result);
    }
    return;
  }
  res.json(result);
});

app.delete('/cards/:cardId', (req: Request, res: Response) => {
  const result = deleteCard(Number(req.params.cardId));
  if ('error' in result) {
    res.status(404).json(result);
    return;
  }
  res.json(result);
});

app.post('/cards/:cardId/check', (req: Request, res: Response) => {
  const result = checkAnswer(Number(req.params.cardId), req.body.picked);
  if ('error' in result) {
    if (result.error === 'Card not found') {
      res.status(404).json(result);
    } else {
      res.status(400).json(result);
    }
    return;
  }
  res.json(result);
});

app.delete('/clear', (req: Request, res: Response) => {
  res.json(clear());
});
