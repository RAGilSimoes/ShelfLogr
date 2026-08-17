export interface bookInfo {
  isbn: string;
  title: string;
  authors: Array<string>;
  publisher: string;
  publishedDate: string;
  description: string;
  pageCount: number;
  mainCategory: string;
  categories: Array<string>;
  cover: string;
  language: string;
  modified: boolean;
}
