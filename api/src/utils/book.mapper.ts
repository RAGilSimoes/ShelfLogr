import type { bookInfo, bookCover } from '@shelflogr/shared';

export const formatGoogleBook = (googleVolumeInfo: any): bookInfo => {
  return {
    title: googleVolumeInfo.title || 'Unknown Title',

    authors: googleVolumeInfo.authors || ['Unknown Author'],

    publisher: googleVolumeInfo.publisher || 'Unknown Publisher',
    publishedDate: googleVolumeInfo.publishedDate || 'Unknown Date',
    description:
      googleVolumeInfo.description ||
      'No available description for this book was found.',
    pageCount: googleVolumeInfo.pageCount || 0,

    mainCategory: googleVolumeInfo.categories
      ? googleVolumeInfo.categories[0]
      : 'No Category',
    categories: googleVolumeInfo.categories || [],

    imageLinks: {
      smallThumbnail: googleVolumeInfo.imageLinks?.smallThumbnail || '',
      thumbnail: googleVolumeInfo.imageLinks?.thumbnail || '',
      small: googleVolumeInfo.imageLinks?.small || '',
      medium: googleVolumeInfo.imageLinks?.medium || '',
      large: googleVolumeInfo.imageLinks?.large || '',
      extraLarge: googleVolumeInfo.imageLinks?.extraLarge || '',
    },

    language: googleVolumeInfo.language || 'N/A',
    modified: false,
  };
};
