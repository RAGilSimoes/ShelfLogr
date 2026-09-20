import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';

import { pool } from './db.js';

import { generateToken } from './services/jwt.service.js';

import { verifyAuthorization } from './middlewares/auth.middleware.js';
import type { bookInfo } from '@shelflogr/shared';
import {
  fetchNYTTrendingBooks,
  fetchEntireBookInfo,
  fetchGoogleTrendingBooks,
} from './utils/bookInfo.js';

dotenv.config();

// const authLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 10000,
// });

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

    const saltRounds = 10;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const encryptedPassword = await bcrypt.hash(password, saltRounds);
      const { rows: insertResult } = await client.query(
        'INSERT INTO "user"(name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [username, email, encryptedPassword],
      );

      const userID = insertResult[0]!.id;

      const token = generateToken(userID, email, username);

      const createDefaultTablesQuery =
        "INSERT INTO user_list(user_id, name, is_system) VALUES ($1,'reading',true),($1,'wish',true),($1,'completed',true)";

      await client.query(createDefaultTablesQuery, [userID]);

      await client.query('COMMIT');

      return res.status(201).json({ message: 'Success', token });
    } catch (error: any) {
      const errorCode = error.code;
      console.error(error);

      await client.query('ROLLBACK').catch(() => {});

      if (errorCode === '23505') {
        const detail: string = error.detail;
        const local = detail.includes('name');

        const message = local
          ? 'Username already in use'
          : 'Email already in use';
        return res.status(409).json({ error: message });
      } else {
        return res
          .status(500)
          .json({ error: 'Internal error processing registration' });
      }
    } finally {
      client.release();
    }
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
      const { book, requiredList, optionalLists } = req.body;

      const bookID = book.id;

      const userID = id;

      await client.query('BEGIN');

      const deleteRequiredListRelation =
        'DELETE FROM list_books WHERE list_books.book_id=$1 AND list_books.list_id IN (SELECT id FROM user_list WHERE user_list.user_id=$2 AND user_list.is_system = true)';

      await client.query(deleteRequiredListRelation, [bookID, userID]);

      const insertBookList =
        'INSERT INTO list_books(list_id, book_id) VALUES($1,$2) ON CONFLICT DO NOTHING;';

      await client.query(insertBookList, [requiredList, bookID]);

      if (optionalLists && optionalLists.length > 0) {
        for (const optionalList of optionalLists) {
          await client.query(insertBookList, [optionalList, bookID]);
        }
      }

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
        requiredList,
        optionalLists,
      });
    } catch (error) {
      console.log(error);
      await client.query('ROLLBACK');
      return res.status(500).json({
        error: `Error Adding Book to List(s).`,
      });
    } finally {
      client.release();
    }
  },
);

app.get(
  '/api/user/lists-names',
  verifyAuthorization(false),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.token;

      const getBookListsNamesQuery =
        'SELECT ul.id, ul.name, ul.is_system, COUNT(lb.book_id)::int as quantity FROM "user_list" ul LEFT JOIN "list_books" lb ON ul.id = lb.list_id WHERE ul.user_id=$1 GROUP BY ul.id, ul.is_system ORDER BY ul.is_system DESC, ul.name ASC;';

      const { rows: lists } = await pool.query(getBookListsNamesQuery, [id]);

      return res.status(200).json({ lists });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Couldn't get user lists." });
    }
  },
);

app.get(
  '/api/user/active-lists',
  verifyAuthorization(false),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.token;

      let lists: {
        reading: Array<{ book: bookInfo; lists: Array<string> }>;
        wish: Array<{ book: bookInfo; lists: Array<string> }>;
      } = {
        reading: [],
        wish: [],
      };

      const defaultLists = ['reading', 'wish', 'completed'];

      const getBookLists = `SELECT ul.name as "listName",
            b.*, 
            COALESCE((ARRAY_AGG(c.name) FILTER (WHERE bc.main = true))[1], '') as "mainCategory",
            COALESCE(ARRAY_AGG(c.name) FILTER (WHERE bc.main = false), '{}') as categories,
            (SELECT COALESCE(ARRAY_AGG(all_ul.name), '{}') FROM list_books all_lb JOIN user_list all_ul ON all_ul.id = all_lb.list_id WHERE all_lb.book_id = b.id AND all_ul.user_id = $1) AS lists
            FROM "list_books" lb 
            JOIN user_list ul ON ul.id = lb.list_id
            JOIN book b ON b.id = lb.book_id
            LEFT JOIN book_category bc ON b.id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.id
            WHERE ul.user_id=$1 AND ul.name = ANY($2)
            GROUP BY b.id, ul.name;`;

      await pool
        .query(getBookLists, [id, defaultLists.slice(0, 2)])
        .then((result: any) =>
          result.rows.forEach((index: any) => {
            const listName = index.listName;
            const bookLists = index.lists;
            delete index.listName;
            delete index.lists;

            if (listName === 'reading') {
              lists.reading.push({ book: index, lists: bookLists });
            } else if (listName === 'wish') {
              lists.wish.push({ book: index, lists: bookLists });
            }
          }),
        );

      const getTopCategoryQuery = `
            SELECT c.name as "topCategory"
            FROM list_books lb
            JOIN user_list ul ON ul.id=lb.list_id
            JOIN book_category bc ON lb.book_id = bc.book_id
            JOIN categories c ON bc.category_id = c.id
            JOIN user_reviews ur ON ur.book_id = lb.book_id
            WHERE ur.user_id = $1
              AND bc.main = true
              AND ur.liked = true
              AND ul.user_id = $1
              AND ul.name = 'completed'
            GROUP BY c.name
            ORDER BY COUNT(c.name) DESC
            LIMIT 1;
          `;

      let category = null;

      let { rows: topCategoryRow } = await pool.query(getTopCategoryQuery, [
        id,
      ]);

      if (topCategoryRow.length > 0) category = topCategoryRow[0].topCategory;

      res.status(200).json({ lists, category });
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
