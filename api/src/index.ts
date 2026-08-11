import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import { pool } from './db.js';

import {
  generateToken,
  verifyToken,
  decodeToken,
} from './services/jwt.service.js';
import type { JwtPayload } from 'jsonwebtoken';

import { verifyAuthorization } from './middlewares/auth.middleware.js';
import type { bookInfo, bookCover } from '@shelflogr/shared';
import { formatGoogleBook } from './utils/book.mapper.js';

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
    return res.json({ version });
  } catch (error) {
    console.error('Database query failed:', error);
    return res
      .status(500)
      .json({ error: 'Failed to connect to the database.' });
  }
});

app.get(
  '/refresh-token',
  verifyAuthorization(false),
  async (req: Request, res: Response) => {
    try {
      const { id, email, name } = req.token;

      const newToken = generateToken(id, email, name);

      return res.status(200).json({ message: 'Sucess', token: newToken });
    } catch (error) {
      console.error('Erro ao fazer refresh do token:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

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

    return res.status(200).json({ message: 'Sucess', token });
  } catch (error) {
    return res.status(500).json({ error: 'Internal error processing login' });
  }
});

app.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    const { rows: emailResult } = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email],
    );

    if (emailResult.length !== 0) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const { rows: usernameResult } = await pool.query(
      'SELECT * FROM "user" WHERE name = $1',
      [username],
    );

    if (usernameResult.length !== 0) {
      return res.status(409).json({ error: 'Username already in use.' });
    }

    const saltRounds = 10;

    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    const { rows: insertResult } = await pool.query(
      'INSERT INTO "user"(name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, encryptedPassword],
    );

    const token = generateToken(insertResult[0]!.id, email, username);

    return res.status(200).json({ message: 'Success', token });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: 'Internal error processing registration' });
  }
});

app.get(
  '/get-book-info/:isbn',
  verifyAuthorization(false),
  async (req: Request, res: Response) => {
    try {
      const isbn = req.params.isbn;

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.BOOKS_API_KEY}`,
      );

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return res.status(404).json({ error: 'Book Not Found' });
      }

      const rawGoogleData = data.items[0].volumeInfo;

      const cleanBookInfo: bookInfo = formatGoogleBook(rawGoogleData);

      const mockData = {
        title: 'The Google story',
        authors: ['David A. Vise', 'Mark Malseed'],
        publisher: 'Random House Digital, Inc.',
        publishedDate: '2005-11-15',
        description:
          '"Here is the story behind one of the most remarkable Internet successes of our time. Based on scrupulous research and extraordinary accessto Google, ',
        pageCount: 207,
        mainCategory: 'Business & Economics / Entrepreneurship',
        categories: [
          'Browsers (Computer programs)',
          'Browsers (Computer programs)',
          'Browsers (Computer programs)',
          'Browsers (Computer programs)',
          'Browsers (Computer programs)',
          'Browsers (Computer programs)',
        ],
        imageLinks: {
          smallThumbnail:
            'https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
          thumbnail:
            'https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
          small:
            'https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=2&edge=curl&source=gbs_api',
          medium:
            'https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api',
          large:
            'https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=4&edge=curl&source=gbs_api',
          extraLarge:
            'https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=6&edge=curl&source=gbs_api',
        },
        language: 'en',
      };

      return res.status(200).json(mockData);
    } catch (error) {
      console.error('Error getting Book Information:', error);
      return res.status(500).json({ error: 'Error getting book information.' });
    }
  },
);

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
