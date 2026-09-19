import type { bookInfo } from '@shelflogr/shared';

import { formatGoogleBook, formatOpenLibraryBook } from './book.mapper.js';

import { pool } from '../db.js';

export async function fetchDatabaseBook(
  isbn: string,
  userID: string,
): Promise<{ book: bookInfo; currentStatus: string | null } | null> {
  try {
    const { rows: bookExists } = await pool.query(
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

    if (bookExists.length > 0) {
      const book: bookInfo = bookExists[0];

      const bookID = book.id;

      const { rows: status } = await pool.query(
        'SELECT ul.name as status FROM user_list ul JOIN list_books lb ON ul.id=lb.list_id WHERE ul.user_id = $1 AND lb.book_id = $2 AND ul.is_system=true',
        [userID, bookID],
      );

      if (status.length > 0) {
        const currentStatus = status[0].status;
        return { book, currentStatus };
      }

      return { book, currentStatus: null };
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
  try {
    const responseID = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.BOOKS_API_KEY}`,
    );

    if (!responseID.ok) return null;

    const data = await responseID.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const bookID = data.items[0].id;

    const responseBookInfo = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookID}?key=${process.env.BOOKS_API_KEY}`,
    );

    if (!responseBookInfo.ok) return null;

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
  } catch (error) {
    return null;
  }
}

export async function fetchOpenLibraryBook(
  isbn: string,
): Promise<Partial<bookInfo> | null> {
  try {
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      {
        headers: { 'User-Agent': 'Shelflogr' },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    const bookData = data[`ISBN:${isbn}`];

    const cleanBookInfo: bookInfo = formatOpenLibraryBook(bookData, isbn);

    return cleanBookInfo;
  } catch (error) {
    return null;
  }
}

export async function getAllUserBooks(
  id: string,
): Promise<Array<string> | null> {
  try {
    const isbns: Array<string> = [];
    const { rows: status } = await pool.query(
      'SELECT DISTINCT b.isbn FROM book b JOIN list_books lb ON b.id=lb.book_id JOIN user_list ul ON lb.list_id=ul.id WHERE ul.user_id=$1',
      [id],
    );

    if (status.length > 0) {
      for (const isbn of status) {
        isbns.push(isbn.isbn);
      }
    }
    return isbns;
  } catch (error) {
    return null;
  }
}

export async function fetchNYTTrendingBooks(id: string): Promise<any> {
  const list = 'combined-print-and-e-book-fiction';
  const response = await fetch(
    `https://api.nytimes.com/svc/books/v3/lists/current/${list}.json?api-key=${process.env.NYT_API_KEY}`,
  );

  const data = await response.json();

  if (!data || Object.keys(data).length === 0 || data.status !== 'OK') {
    return null;
  }

  const blackList: Array<string> | null = await getAllUserBooks(id);

  const results = data.results.books;

  const readyBooks = results.filter((book: any) => {
    const isbn = book.isbns[0]?.isbn13;
    if (!isbn || (blackList && blackList.includes(isbn))) return null;
    return book;
  });

  const top10ReadyBooks = readyBooks.slice(0, 10);

  let books: Array<{ book: Partial<bookInfo>; currentStatus: string | null }> =
    [];

  for (const book of top10ReadyBooks) {
    if (books.length === 5) break;

    const result:
      | string
      | { book: Partial<bookInfo>; currentStatus: string | null } =
      await fetchEntireBookInfo(book.isbns[0]?.isbn13, id);

    if (typeof result !== 'string') {
      books.push(result);
    }
  }

  return books;
}

export async function fetchGoogleTrendingBooks(
  category: string,
  id: string,
): Promise<any> {
  const TARGET_AMOUNT = 5;
  const FETCH_CHUNK = 10;

  let validBooks = [];
  let startIndex = 0;

  const blackList: Array<string> | null = await getAllUserBooks(id);

  const safeCategory = encodeURIComponent(category);

  while (validBooks.length < TARGET_AMOUNT) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${safeCategory}&maxResults=${FETCH_CHUNK}&startIndex=${startIndex}&key=${process.env.BOOKS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      break;
    }

    for (const item of data.items) {
      if (validBooks.length === TARGET_AMOUNT) break;

      const volumeInfo = item.volumeInfo;
      let isbn = null;

      if (volumeInfo.industryIdentifiers) {
        const isbn13 = volumeInfo.industryIdentifiers.find(
          (id: any) => id.type === 'ISBN_13',
        );
        const isbn10 = volumeInfo.industryIdentifiers.find(
          (id: any) => id.type === 'ISBN_10',
        );

        if (isbn13) isbn = isbn13.identifier;
        else if (isbn10) isbn = isbn10.identifier;
      }

      if (isbn && (!blackList || !blackList.includes(isbn))) {
        const formatted:
          | { book: Partial<bookInfo>; currentStatus?: string | null }
          | string = await fetchEntireBookInfo(isbn, id);

        if (typeof formatted !== 'string') {
          validBooks.push(formatted);
        } else {
          continue;
        }
      }
    }

    startIndex += FETCH_CHUNK;
  }

  return validBooks;
}

export async function addBookToDB(info: Partial<bookInfo>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertBookText =
      'INSERT INTO "book"(isbn, title, cover, publisher, description, "publishedDate", "pageCount", language, authors) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (isbn) DO UPDATE SET isbn = EXCLUDED.isbn RETURNING id';
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

    const insertCategoryBookRelation =
      'INSERT INTO book_category(book_id, category_id, main) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING';

    const insertCategory =
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id';

    if (mainCategory) {
      const insertMainCategoryResult = await client.query(insertCategory, [
        mainCategory,
      ]);

      const mainCategoryID = insertMainCategoryResult.rows[0].id;

      await client.query(insertCategoryBookRelation, [
        bookID,
        mainCategoryID,
        true,
      ]);
    }

    if (categories) {
      for (const secondaryCategory of categories!) {
        const insertSecondaryCategoryResult = await client.query(
          insertCategory,
          [secondaryCategory],
        );

        const secondaryCategoryID = insertSecondaryCategoryResult.rows[0].id;

        await client.query(insertCategoryBookRelation, [
          bookID,
          secondaryCategoryID,
          false,
        ]);
      }
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function fetchEntireBookInfo(
  isbn: string,
  id: string,
): Promise<{ book: Partial<bookInfo>; currentStatus: string | null } | string> {
  try {
    const bookInfoDatabase = await fetchDatabaseBook(isbn, id);

    if (bookInfoDatabase) {
      return {
        book: bookInfoDatabase.book,
        currentStatus: bookInfoDatabase.currentStatus,
      };
    }

    let googleResponse = await fetchGoogleBook(isbn);

    if (!googleResponse) {
      const fallbackBook = await fetchOpenLibraryBook(isbn);

      if (!fallbackBook) {
        return 'Book Not Found.';
      }
      await addBookToDB(fallbackBook);

      return { book: fallbackBook, currentStatus: null };
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

    await addBookToDB(googleResponse.cleanBookInfo);

    return { book: googleResponse.cleanBookInfo, currentStatus: null };
  } catch (error) {
    console.error('Error getting Book Information:', error);
    return 'Error getting book information.';
  }
}
