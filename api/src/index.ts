import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT version()');
    const version = rows[0]?.version;
    res.json({ version });
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Failed to connect to the database.' });
  }
});

app.get('/get-categories', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories;');
    let categories: { Name: string; ID: string }[] = [];
    rows.map((category) => {
      categories.push({ Name: category.name, ID: category.id });
    });
    res.json({
      categories,
    });
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Failed to connect to the database.' });
  }
});

app.get('/random', (req: Request, res: Response) => {
  res.json({ message: Math.random() * 100 });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr em 127.0.0.1:${PORT}`);
});
