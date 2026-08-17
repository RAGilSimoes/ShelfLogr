import type { bookInfo } from '@shelflogr/shared';

import { formatGoogleBook, formatOpenLibraryBook } from './book.mapper.js';

import { pool } from '../db.js';

export async function fetchDatabaseBook(
  isbn: string,
): Promise<bookInfo | null> {
  try {
    const { rows } = await pool.query(
      `SELECT 
        b.*, 
        COALESCE((ARRAY_AGG(c.name) FILTER (WHERE bc.main = true))[1], '') as "mainCategory",
        COALESCE(ARRAY_AGG(c.name) FILTER (WHERE bc.main = false), '{}') as categories
    FROM "book" b
    LEFT JOIN book_category bc ON b.id = bc.book_id
    LEFT JOIN categories c ON bc.category_id = c.id
    WHERE b.isbn = $1
    GROUP BY b.id;`,
      [isbn],
    );

    if (rows.length > 0) {
      const livro: bookInfo = rows[0];

      return livro;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Database query failed:', error);
    return null;
  }
}

export async function fetchGoogleBook(isbn: string): Promise<{
  cleanBookInfo: bookInfo;
  emptyFields: Array<string>;
} | null> {
  const responseID = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.BOOKS_API_KEY}`,
  );

  const data = await responseID.json();

  if (!data.items || data.items.length === 0) {
    return null;
  }

  const bookID = data.items[0].id;

  const responseBookInfo = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${bookID}?key=${process.env.BOOKS_API_KEY}`,
  );

  const bookData = await responseBookInfo.json();

  if (!bookData || Object.keys(bookData).length === 0) {
    return null;
  }

  const rawGoogleData = bookData.volumeInfo;

  const cleanBookInfo: bookInfo = formatGoogleBook(rawGoogleData, isbn);

  const emptyFields = [];

  for (const [key, value] of Object.entries(cleanBookInfo)) {
    if (
      (key === 'categories' && value.length === 0) ||
      (key === 'imageLinks' && value.thumbnail === '')
    ) {
      emptyFields.push(key);
    }
    if (value === '') {
      emptyFields.push(key);
    }
  }

  return { cleanBookInfo, emptyFields };
}

export async function fetchOpenLibraryBook(
  isbn: string,
): Promise<Partial<bookInfo> | null> {
  const response = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
  );

  const data = await response.json();

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  const bookData = data[`ISBN:${isbn}`];

  const cleanBookInfo: bookInfo = formatOpenLibraryBook(bookData, isbn);

  return cleanBookInfo;
}

export async function addBookToDB(info: Partial<bookInfo>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertBookText =
      'INSERT INTO "book"(isbn, title, cover, publisher, description, "publishedDate", "pageCount", language, authors) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id';
    const insertBookResult = await client.query(insertBookText, [
      info.isbn,
      info.title,
      info.cover,
      info.publisher,
      info.description,
      info.publishedDate,
      info.pageCount,
      info.language,
      info.authors,
    ]);

    const bookID = insertBookResult.rows[0].id;

    const mainCategory = info.mainCategory;
    const categories = info.categories;

    const insertMainCategory =
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id';
    const insertMainCategoryResult = await client.query(insertMainCategory, [
      mainCategory,
    ]);

    const mainCategoryID = insertMainCategoryResult.rows[0].id;

    const categoriesIDs = [];

    const insertSecondaryCategory =
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id';

    for (const secondaryCategory of categories!) {
      const insertSecondaryCategoryResult = await client.query(
        insertSecondaryCategory,
        [secondaryCategory],
      );

      const secondaryCategoryID = insertSecondaryCategoryResult.rows[0].id;

      categoriesIDs.push(secondaryCategoryID);
    }

    const insertMainCategoryBookRelation =
      'INSERT INTO book_category(book_id, category_id, main) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING';

    await client.query(insertMainCategoryBookRelation, [
      bookID,
      mainCategoryID,
      true,
    ]);

    for (const id of categoriesIDs) {
      await client.query(insertMainCategoryBookRelation, [bookID, id, false]);
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
