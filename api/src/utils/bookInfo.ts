import type { bookInfo } from '@shelflogr/shared';

import { formatGoogleBook, formatOpenLibraryBook } from './book.mapper.js';

import { pool } from '../db.js';

export async function fetchDatabaseBook(
  isbn: string,
): Promise<bookInfo | null> {
  try {
    const { rows } = await pool.query('SELECT * FROM "book" where isbn = $1', [
      isbn,
    ]);

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
  try {
    const { rows: bookID } = await pool.query(
      'INSERT INTO "book"(isbn, title, cover, publisher, description, "publishedDate", "pageCount", language, authors) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id',
      [
        info.isbn,
        info.title,
        info.cover,
        info.publisher,
        info.description,
        info.publishedDate,
        info.pageCount,
        info.language,
        info.authors,
      ],
    );
  } catch (error) {}
}
