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
import type { bookInfo } from '@shelflogr/shared';
import {
  fetchGoogleBook,
  fetchOpenLibraryBook,
  fetchDatabaseBook,
  addBookToDB,
} from './utils/bookInfo.js';

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
      const isbn: string = req.params.isbn as string;

      const { id } = req.token;

      const bookInfoDatabase = await fetchDatabaseBook(isbn, id);

      let addToDB = bookInfoDatabase ? false : true;

      if (bookInfoDatabase) {
        return res.status(200).json(bookInfoDatabase);
      }

      let googleResponse = await fetchGoogleBook(isbn);

      if (!googleResponse) {
        const fallbackBook = await fetchOpenLibraryBook(isbn);

        if (!fallbackBook) {
          return res.status(404).json({ error: 'Book Not Found.' });
        } else if (addToDB) {
          await addBookToDB(fallbackBook);
        }

        return res.status(200).json(fallbackBook);
      } else if (googleResponse?.emptyFields.length !== 0) {
        const fallbackBook = await fetchOpenLibraryBook(isbn);

        if (fallbackBook) {
          for (const item of googleResponse.emptyFields) {
            const key = item as keyof bookInfo;

            if (fallbackBook[key]) {
              (googleResponse.cleanBookInfo as any)[key] = fallbackBook[
                key
              ] as any;
            }
          }
        }
      }
      if (addToDB) {
        await addBookToDB(googleResponse.cleanBookInfo);
      }
      return res.status(200).json(googleResponse.cleanBookInfo);
    } catch (error) {
      console.error('Error getting Book Information:', error);
      return res.status(500).json({ error: 'Error getting book information.' });
    }
  },
);

app.post(
  '/add-book-to-list',
  verifyAuthorization(false),
  async (req: Request, res: Response) => {
    if (!req.body || !req.body.book) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    const client = await pool.connect();
    try {
      const { id } = req.token;
      const { book, list } = req.body;

      const bookID = book.id;

      const userID = id;

      await client.query('BEGIN');
      const insertBookUserRelation =
        'INSERT INTO "user_books"(user_id, book_id, status) VALUES($1,$2,$3) ON CONFLICT (user_id, book_id) DO UPDATE SET status = EXCLUDED.status';

      await client.query(insertBookUserRelation, [userID, bookID, list]);

      const getCategoryID = 'SELECT id FROM categories WHERE name=$1';

      const insertUserCategoryRelation =
        'INSERT INTO "user_category"(user_id, category_id) VALUES($1,$2) ON CONFLICT DO NOTHING';

      if (book.mainCategory) {
        const { rows: mainCategory } = await client.query(getCategoryID, [
          book.mainCategory,
        ]);

        if (mainCategory.length > 0) {
          const mainCategoryID = mainCategory[0].id;
          await client.query(insertUserCategoryRelation, [
            userID,
            mainCategoryID,
          ]);
        }
      }

      if (book.categories && book.categories.length !== 0) {
        for (const category of book.categories) {
          const { rows: categoryResponse } = await client.query(getCategoryID, [
            category,
          ]);

          if (categoryResponse.length > 0) {
            const categoryID = categoryResponse[0].id;
            await client.query(insertUserCategoryRelation, [
              userID,
              categoryID,
            ]);
          }
        }
      }

      await client.query('COMMIT');
      return res.status(200).json({
        message: 'Book added successfully',
      });
    } catch (error) {
      console.log(error);
      await client.query('ROLLBACK');
      const targetList =
        req.body?.list === 'reading' ? 'Reading List' : 'Wish List';
      return res.status(500).json({
        error: `Error adding book to ${targetList}.`,
      });
    } finally {
      client.release();
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
