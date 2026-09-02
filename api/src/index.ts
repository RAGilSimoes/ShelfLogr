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
  fetchNYTTrendingBooks,
  fetchEntireBookInfo,
  fetchGoogleTrendingBooks,
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
  '/api/refresh-token',
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

app.post('/api/login', async (req: Request, res: Response) => {
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

app.post('/api/register', async (req: Request, res: Response) => {
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
  '/api/get-book-info/:isbn',
  verifyAuthorization(false),
  async (req: Request, res: Response) => {
    const isbn: string = req.params.isbn as string;

    const { id } = req.token;
    const result = await fetchEntireBookInfo(isbn, id);

    if (typeof result === 'string') {
      res.status(500).json({ error: result });
    } else {
      res.status(200).json({ result });
    }
  },
);

app.post(
  '/api/add-book-to-list',
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
        req.body?.list.charAt(0).toUpperCase() + req.body?.list.slice(1);
      return res.status(500).json({
        error: `Error adding book to ${targetList} list.`,
      });
    } finally {
      client.release();
    }
  },
);

app.get(
  '/api/user/active-book-recommendation',
  verifyAuthorization(false),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.token;
      let bookID;

      const getBookID =
        'SELECT "book_id" FROM user_books WHERE "user_id"=$1 AND "status"=$2 LIMIT $3';

      const getBookInfo = `SELECT 
            b.*, 
            COALESCE((ARRAY_AGG(c.name) FILTER (WHERE bc.main = true))[1], '') as "mainCategory",
            COALESCE(ARRAY_AGG(c.name) FILTER (WHERE bc.main = false), '{}') as categories
        FROM "book" b
        LEFT JOIN book_category bc ON b.id = bc.book_id
        LEFT JOIN categories c ON bc.category_id = c.id
        WHERE b.id = $1
        GROUP BY b.id;`;

      const bookStatusOptions = ['reading', 'wish', 'completed'];

      let { rows: readingBook } = await pool.query(getBookID, [
        id,
        bookStatusOptions[0],
        1,
      ]);

      let list;
      const type = 'personal';
      let activeBook = {};

      if (readingBook.length > 0) {
        bookID = readingBook[0].book_id;

        list = bookStatusOptions[0];

        const { rows: bookInfo } = await pool.query(getBookInfo, [bookID]);

        if (bookInfo.length > 0) {
          const book = bookInfo[0];
          activeBook = { type, list, book };
        }
      } else {
        let { rows: wishBook } = await pool.query(getBookID, [
          id,
          bookStatusOptions[1],
          1,
        ]);

        if (wishBook.length > 0) {
          bookID = wishBook[0].book_id;
          list = bookStatusOptions[1];

          const { rows: bookInfo } = await pool.query(getBookInfo, [bookID]);

          if (bookInfo.length > 0) {
            const book = bookInfo[0];
            activeBook = { type, list, book };
          }
        }
      }

      const getTopCategoryQuery = `
            SELECT c.name as "topCategory"
            FROM user_books ub
            JOIN book_category bc ON ub.book_id = bc.book_id
            JOIN categories c ON bc.category_id = c.id
            WHERE ub.user_id = $1 
              AND ub.status = $2 
              AND ub.liked = true 
              AND bc.main = true
            GROUP BY c.name
            ORDER BY COUNT(c.name) DESC
            LIMIT 1;
          `;

      let category;

      let { rows: topCategoryRow } = await pool.query(getTopCategoryQuery, [
        id,
        bookStatusOptions[2],
      ]);

      if (topCategoryRow.length > 0) category = topCategoryRow[0].topCategory;

      res.status(200).json({ activeBook, category });
    } catch (error) {
      console.error('Database query failed:', error);
      res
        .status(500)
        .json({ error: 'Error getting active book recommendations.' });
    }
  },
);

app.get(
  '/api/books/trending',
  verifyAuthorization(false),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.token;
      const category = req.query.category;

      let type;
      let trending;

      if (category && typeof category === 'string') {
        type = 'category';

        const trendingBooksInfo: Array<bookInfo> =
          await fetchGoogleTrendingBooks(category, id);

        trending = { type, category, trendingBooksInfo };
      } else {
        type = 'trending';
        const trendingBooksInfo: Array<bookInfo> = await fetchNYTTrendingBooks(
          id,
        );
        trending = { type, trendingBooksInfo };
      }

      return res.status(200).json(trending);
    } catch (error) {
      console.error('Database query failed:', error);
      res.status(500).json({ error: 'Error getting book recommendations.' });
    }
  },
);

app.get('/random', (req: Request, res: Response) => {
  res.json({ message: Math.random() * 100 });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr em 127.0.0.1:${PORT}`);
});
