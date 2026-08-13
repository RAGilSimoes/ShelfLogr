import type { bookInfo, bookCover } from '@shelflogr/shared';

import { formatGoogleBook, formatOpenLibraryBook } from './book.mapper.js';

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

  const cleanBookInfo: bookInfo = formatGoogleBook(rawGoogleData);

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

  const cleanBookInfo: bookInfo = formatOpenLibraryBook(bookData);

  return cleanBookInfo;
}
