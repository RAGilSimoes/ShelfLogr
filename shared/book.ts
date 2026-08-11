export interface bookCover {
  smallThumbnail: string;
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  extraLarge: string;
}

export interface bookInfo {
  title: string;
  authors: Array<string>;
  publisher: string;
  publishedDate: string;
  description: string;
  pageCount: number;
  mainCategory: string;
  categories: Array<string>;
  imageLinks: bookCover;
  language: string;
  modified: boolean;
}
