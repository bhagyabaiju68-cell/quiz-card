import { app } from './app.ts';
import { loadData } from './dataStore.ts';

const PORT = 3000;

loadData();
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
