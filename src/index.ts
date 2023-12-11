import express from 'express';
const cors = require('cors');
let bodyParser = require('body-parser');
import { connection } from "./db";
const app = express();
const port = 3001;

app.use(cors({origin: '*'}));

app.use(bodyParser.json());

app.get('/', async (req, res) => {
  res.json({message: "Hello form server"});
});

app.get('/cards', async (req, res) => {
  connection.query('SELECT * FROM cards', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json({ cards: results });
  });
});

app.post('/card', async (req, res) => {
  const { image, name, description, mood } = req.body;

  if (!image || !name || !description || !mood) {
    res.status(400).json({ error: 'Incomplete data' });
    return;
  }

  connection.query(
    'INSERT INTO cards (image, name, description, mood) VALUES (?, ?, ?, ?)',
    [image, name, description, mood],
    (error, results: any) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      res.json({ id: results.insertId, image, name, description, mood });
    }
  );
});

app.put('/cards/:id', async (req, res) => {
  const cardId = req.params.id;
  const { image, name, description, mood } = req.body;

  if (!image || !name || !description || !mood) {
    res.status(400).json({ error: 'Incomplete data' });
    return;
  }

  connection.query(
    'UPDATE cards SET image = ?, name = ?, description = ?, mood = ? WHERE id = ?',
    [image, name, description, mood, cardId],
    (error) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      res.json({ message: 'Card updated successfully' });
    }
  );
});

app.delete('/cards/:id', async (req, res) => {
  const cardId = req.params.id;

  connection.query('DELETE FROM cards WHERE id = ?', [cardId], (error) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json({ message: 'Card deleted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
