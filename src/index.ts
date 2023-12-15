import express from 'express';
const cors = require('cors');
let bodyParser = require('body-parser');
import { connection } from "./db";
import { z } from 'zod';
const app = express();
const port = 3001;

app.use(cors({origin: '*'}));

app.use(bodyParser.json());

const cardSchema = z.object({
  image: z.string(),
  name: z.string(),
  description: z.string(),
  mood: z.string(),
});

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
  try {
    const { image, name, description, mood } = cardSchema.parse(req.body);

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
  } catch (error) {
    res.status(400).json({ error: 'Invalid data format' });
  }
});

app.put('/cards/:id', async (req, res) => {
  const cardId = req.params.id;

  try {
    const { image, name, description, mood } = cardSchema.parse(req.body);

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
  } catch (error) {
    res.status(400).json({ error: 'Invalid data format' });
  }
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
