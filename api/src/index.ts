import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import { pool } from './db.js';

import { generateToken, verifyToken } from './services/jwt.service.js';

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

app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query('SELECT * FROM "user" WHERE email = $1', [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Incorrect Email or Password.' });
    }

    const user = rows[0];
    const dbPassword = user.password;

    const isPasswordValid = await bcrypt.compare(password, dbPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect Email or Password.' });
    }

    delete user.password;

    const token = generateToken(user.id, user.email, user.name);

    res.status(200).json({ message: 'Sucess', token });
  } catch (error) {
    res.status(500).json({ error: 'Internal error processing login' });
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
